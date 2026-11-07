#!/usr/bin/env node
/**
 * Make the DOR101 app — the maintainer's one command.
 *
 *   Double-click Build-App.bat            (Windows)
 *   Double-click build-app.command        (macOS)
 *   node scripts/make-app.mjs --help      (anywhere)
 *
 * This is a developer tool. Nothing on the website links to it and residents
 * never need it: it exists so that "get me the current app" is one action
 * instead of `git pull`, `npm ci`, `npm run build:exe`, `npm run verify:desktop`
 * and a PowerShell publish script remembered in the right order.
 *
 * What it does:
 *
 *   connect   talks to GitHub, fetches, and says plainly which code is about to
 *             be built — including when the newest commits are still only here
 *   choose    asks where to build: on GitHub's Windows runner (nothing is
 *             compiled on this computer; the exe is downloaded when it
 *             finishes) or here (scripts/build-exe.mjs, the same path the
 *             workflow uses)
 *   build     cloud: dispatches the Release workflow, follows the run, downloads
 *             the artifacts.  local: fast-forwards a clean tree, then builds
 *   verify    boots the packaged app and requests the routes the exe depends on
 *   publish   asks, and only then creates or updates the GitHub Release that the
 *             site's download button resolves
 *
 * Two promises this tool keeps: it never discards work, and it never publishes
 * unless it was told to. The decisions that enforce both live in
 * `scripts/lib/make-app.mjs`, which is pure and tested; this file is the
 * conversation and the side effects.
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

import {
  ARTIFACT_NAME,
  DEFAULT_RUN_TIMEOUT_MINUTES,
  OUTPUT_DIR,
  REPO,
  WORKFLOW_FILE,
  artifactNames,
  checkModeRequirements,
  decodeLog,
  describeRun,
  dispatchArgs,
  failedSteps,
  humanDuration,
  humanSize,
  interpretVerifyLog,
  parseAheadBehind,
  parseArgs,
  parseStatusPorcelain,
  pickWorkflowRun,
  planLocalSync,
  planPublish,
  planRemoteSource,
  releaseCreateArgs,
  releaseUploadArgs,
  resolveTargetRef,
  workflowTargetChoice,
} from './lib/make-app.mjs';

/** Where this script lives — normally the repository it shipped with. */
const toolRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const { options, errors } = parseArgs(process.argv.slice(2));

if (errors.length > 0) {
  console.error('');
  for (const error of errors) console.error(`✖ ${error}`);
  console.error('');
  console.error('Nothing was changed. Run with --help to see every option.');
  process.exit(2);
}

if (options.help) {
  printHelp();
  process.exit(0);
}

/** True when somebody is watching and can answer a question. */
const interactive = Boolean(process.stdin.isTTY && process.stdout.isTTY);

/**
 * Whether a question can be answered at all — by a person, or by `--yes`
 * taking the default.
 *
 * Kept separate from `interactive` on purpose: `interactive` decides how output
 * is rendered (an in-place progress line versus whole lines for a redirected
 * log), while this decides whether the tool may ask anything. `--yes` in a
 * script can answer, but cannot redraw a terminal.
 */
const canAnswer = interactive || options.assumeYes;

/** Sentinels for `askChoice`, so "stopped" and "could not ask" stay distinct. */
const ABORT = -1;

const timers = [];
let outputRoot = options.repoDir ? path.resolve(options.repoDir) : toolRoot;
let version = 'unknown';

/**
 * The section currently being timed, or null between sections.
 *
 * Declared here rather than down with the printing helpers because `main()` is
 * invoked at module level: a `let` further down the file is still in its
 * temporal dead zone when `preflight()` opens the first section, and reading it
 * throws before the tool has printed anything useful.
 */
let currentSection = null;

main().catch((error) => {
  console.error('');
  console.error(`✖ ${error.message}`);
  if (options.verbose && error.stack) console.error(error.stack);
  console.error('');
  console.error('Stopped. Nothing was published. See docs/MAKE-APP.md for what to try next.');
  process.exit(1);
});

async function main() {
  banner();

  const tools = preflight();
  const github = await connect(tools);

  const mode = await chooseMode(tools, github);
  if (mode === null) return stopped();

  const built = mode === 'remote'
    ? await buildOnGitHub(github)
    : await buildHere(tools, github);
  if (built === null) return stopped();

  // "Build on this computer instead", chosen from the unpushed-commits question.
  if (built.switchToLocal) {
    console.log('');
    detail('switching to a build on this computer');
    const local = await buildHere(tools, github);
    if (local === null) return stopped();
    return finish(local, tools);
  }

  return finish(built, tools);
}

// ---------------------------------------------------------------------------
// preflight — what are we working with
// ---------------------------------------------------------------------------

function banner() {
  const width = 62;
  const rule = '─'.repeat(width);
  console.log('');
  console.log(`┌${rule}┐`);
  console.log(`│${'  DOR101 — make the app'.padEnd(width)}│`);
  console.log(`└${rule}┘`);
  console.log('');
  console.log(`  Repository  ${REPO.slug}`);
  if (options.dryRun) console.log('  Dry run     anything that would change something is printed, not run');
  console.log('');
}

function preflight() {
  section('Connect');

  const [major, minor] = process.versions.node.split('.').map(Number);
  const tools = {
    nodeOk: (major === 22 && minor >= 12) || major === 24 || major >= 26,
    nodeVersion: process.versions.node,
    git: which('git'),
    gh: which('gh'),
    platform: process.platform,
  };
  tools.ghAvailable = Boolean(tools.gh);
  tools.ghAuthenticated = false;
  tools.ghUser = null;

  detail(`Node.js ${tools.nodeVersion}${tools.nodeOk ? '' : '  ✖ too old — 22.12+, 24 or 26+ is needed to build here'}`);
  detail(tools.git ? `git ${tools.git.version}` : 'git  ✖ not found on PATH');

  if (tools.ghAvailable) {
    const auth = capture('gh', ['api', 'user', '--jq', '.login']);
    if (auth.ok) {
      tools.ghAuthenticated = true;
      tools.ghUser = auth.stdout.trim();
      detail(`gh ${tools.gh.version}, signed in as ${tools.ghUser}`);
    } else {
      detail(`gh ${tools.gh.version}, not signed in — run \`gh auth login\` to build on GitHub`);
    }
  } else {
    detail('gh  not installed — needed to build on GitHub (winget install GitHub.cli, or brew install gh)');
  }

  if (isGitRepo(outputRoot)) {
    detail(`working in ${outputRoot}`);
    const remote = gitIn(outputRoot, 'remote', 'get-url', 'origin');
    if (remote == null) {
      detail('⚠ this clone has no `origin` remote, so there is nothing to sync from');
    } else if (!remote.toLowerCase().includes(REPO.slug.toLowerCase())) {
      detail(`⚠ origin is ${remote}, not ${REPO.slug} — building what this clone points at`);
    }
    version = readLocalVersion() ?? version;
    return tools;
  }

  // No checkout here. A cloud build does not need one, so only insist on code
  // when the code is what we were asked to build.
  if (options.repoDir) {
    cloneInto(outputRoot);
    version = readLocalVersion() ?? version;
    return tools;
  }
  if (options.mode === 'remote') {
    detail('no local checkout — that is fine for a cloud build, GitHub has the code');
    return tools;
  }
  throw new Error(
    `${outputRoot} is not a git repository, so there is no code to build.\n` +
      `  Clone it first:   git clone https://github.com/${REPO.slug}.git\n` +
      `  Or point here:    --repo-dir <path>   (a missing folder is cloned for you)\n` +
      `  Or build in the cloud, which needs no checkout at all:  --remote`,
  );
}

/** Clone the repository, so the tool can also be run from outside a checkout. */
function cloneInto(dir) {
  detail(`cloning https://github.com/${REPO.slug}.git`);
  detail(`into ${dir}`);
  fs.mkdirSync(path.dirname(dir), { recursive: true });
  runOrFail('git', ['clone', `https://github.com/${REPO.slug}.git`, dir], { cwd: path.dirname(dir), mutate: true });
  outputRoot = dir;
}

// ---------------------------------------------------------------------------
// connect — what GitHub has, and how this checkout compares
// ---------------------------------------------------------------------------

async function connect(tools) {
  const github = {
    isRepo: isGitRepo(outputRoot),
    branch: null,
    branchOnRemote: false,
    shortSha: null,
    defaultBranch: 'main',
    hasUpstream: true,
    ahead: 0,
    behind: 0,
    trackedChanges: [],
    untrackedFiles: [],
    remoteVersion: null,
  };

  if (!github.isRepo) {
    if (!tools.ghAvailable || !tools.ghAuthenticated) {
      throw new Error('There is no local checkout to build from, and reading the repository from GitHub needs a signed-in `gh`.');
    }
    const meta = ghJson(['repos', REPO.slug]);
    if (meta?.default_branch) github.defaultBranch = meta.default_branch;
    github.remoteVersion = await readGitHubVersion(github.defaultBranch);
    if (github.remoteVersion) version = github.remoteVersion;
    detail(`GitHub's ${github.defaultBranch} is at v${version}`);
    endSection();
    return github;
  }

  github.branch = gitIn(outputRoot, 'rev-parse', '--abbrev-ref', 'HEAD');
  if (github.branch === 'HEAD') github.branch = null; // detached
  github.shortSha = gitIn(outputRoot, 'rev-parse', '--short', 'HEAD');

  detail('fetching from GitHub…');
  const fetched = capture('git', ['fetch', '--prune', '--tags', 'origin'], { cwd: outputRoot });
  if (!fetched.ok) {
    throw new Error(
      `could not reach GitHub from this clone: ${firstLine(fetched.stderr)}\n` +
        '  Check the connection, or build what is already on disk with --local --no-sync.',
    );
  }

  const originHead = gitIn(outputRoot, 'symbolic-ref', '--short', 'refs/remotes/origin/HEAD');
  if (originHead) github.defaultBranch = originHead.replace(/^origin\//, '');

  github.branchOnRemote = github.branch != null
    && gitIn(outputRoot, 'rev-parse', '--verify', '--quiet', `refs/remotes/origin/${github.branch}`) != null;

  const status = parseStatusPorcelain(gitInRaw(outputRoot, 'status', '--porcelain') ?? '');
  github.trackedChanges = status.tracked;
  github.untrackedFiles = status.untracked;

  // Report against the branch this checkout is on, and against the default
  // branch when they differ — a cloud build uses the default, so both gaps are
  // information the developer needs before choosing.
  const here = `${github.branch ?? 'detached HEAD'}${github.shortSha ? ` @ ${github.shortSha}` : ''}`;
  detail(
    `here       ${here}${github.trackedChanges.length > 0 ? `  (${github.trackedChanges.length} uncommitted change(s))` : '  (clean)'}`,
  );

  const branchGap = github.branch ? measureAgainst(github.branch) : null;
  if (branchGap && branchGap.exists) {
    detail(`on GitHub  ${github.branch} @ ${branchGap.remoteSha}${describeGap(branchGap)}`);
    Object.assign(github, { ahead: branchGap.ahead, behind: branchGap.behind, hasUpstream: true });
  } else if (github.branch) {
    detail(`on GitHub  ${github.branch} — no such branch, it exists only on this computer`);
    github.hasUpstream = false;
  }

  if (github.defaultBranch !== github.branch) {
    const defaultGap = measureAgainst(github.defaultBranch);
    if (defaultGap.exists) {
      detail(`on GitHub  ${github.defaultBranch} @ ${defaultGap.remoteSha}${describeGap(defaultGap)}  ← what a cloud build uses`);
      github.defaultGap = defaultGap;
    }
  } else {
    github.defaultGap = branchGap;
  }

  // The version names the exe files, so it must be the version of the code
  // being built, not of the code that happened to be checked out a moment ago.
  const versionRef = options.mode === 'remote' ? github.defaultBranch : github.branch ?? github.defaultBranch;
  github.remoteVersion = await readGitHubVersion(versionRef);
  if (github.remoteVersion && github.remoteVersion !== version) {
    detail(`GitHub's ${versionRef} is version ${github.remoteVersion} (this checkout says ${version})`);
  }

  endSection();
  return github;
}

/**
 * How this checkout compares with one branch on GitHub.
 *
 * Measured per ref, on demand, because the ref that matters changes with the
 * build path: a local build is compared with the branch it is on, while a cloud
 * build is compared with the ref GitHub will actually check out. Comparing
 * against the wrong one makes the unpushed-commits check pass when it should
 * not — and that check is what stops a ten-minute run producing an exe without
 * the fix that was just made.
 */
function measureAgainst(ref) {
  const remoteRef = `origin/${ref}`;
  const remoteSha = gitIn(outputRoot, 'rev-parse', '--short', '--verify', '--quiet', remoteRef);
  if (remoteSha == null) return { exists: false, remoteSha: null, ahead: 0, behind: 0 };
  const counts = gitIn(outputRoot, 'rev-list', '--left-right', '--count', `${remoteRef}...HEAD`) ?? '';
  return { exists: true, remoteSha, ...parseAheadBehind(counts) };
}

function describeGap(gap) {
  const parts = [];
  if (gap.behind > 0) parts.push(`${gap.behind} commit(s) newer than this checkout`);
  if (gap.ahead > 0) parts.push(`${gap.ahead} commit(s) here that GitHub does not have`);
  if (parts.length === 0) return '  (same code)';
  return `  (${parts.join(', ')})`;
}

/**
 * The version in `package.json` on GitHub, for a ref.
 *
 * Read through the API when a signed-in `gh` is available, so a cloud build
 * names its files after the code GitHub is about to build even when this
 * checkout is behind. Falls back to the object the fetch already brought here.
 */
async function readGitHubVersion(ref) {
  // `-X GET` is load-bearing: `gh api` switches to POST as soon as a `-f` field
  // is present, and POSTing to a read endpoint answers 404 — which reads exactly
  // like "that ref does not exist".
  const raw = capture('gh', [
    'api',
    `repos/${REPO.slug}/contents/package.json`,
    '-X',
    'GET',
    '-f',
    `ref=${ref}`,
    '-H',
    'Accept: application/vnd.github.raw',
  ]);
  if (raw.ok) {
    try {
      return JSON.parse(raw.stdout).version ?? null;
    } catch {
      /* fall through to git */
    }
  }
  const shown = gitIn(outputRoot, 'show', `origin/${ref}:package.json`);
  if (!shown) return null;
  try {
    return JSON.parse(shown).version ?? null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// choose — where does the exe get built
// ---------------------------------------------------------------------------

async function chooseMode(tools, github) {
  if (options.mode !== 'ask') {
    const resolved = await confirmModeIsUsable(options.mode, tools);
    return resolved === ABORT ? null : resolved ?? options.mode;
  }

  if (!canAnswer) {
    throw new Error(
      'This tool has to know where to build, and there is no terminal here to ask.\n' +
        '  Re-run with --remote (build on GitHub) or --local (build on this computer),\n' +
        '  or add --yes to take the default.',
    );
  }

  const remoteReady = checkModeRequirements('remote', tools);
  const localReady = checkModeRequirements('local', tools);

  console.log(`  How do you want to build the app${version === 'unknown' ? '' : ` (v${version})`}?`);

  const answer = await askChoice({
    prompt: '',
    choices: [
      {
        title: `On GitHub${remoteReady.ready ? '' : '  (not available here)'}`,
        detail: [
          "GitHub's Windows runner builds the exe; the files are downloaded here.",
          'Nothing is installed or compiled on this computer. About 10 minutes.',
          remoteReady.ready ? `Ready — gh signed in as ${tools.ghUser}.` : `Needs: ${remoteReady.missing.join('; ')}`,
        ],
      },
      {
        title: `On this computer${localReady.ready ? '' : '  (not available here)'}`,
        detail: [
          'Pulls the latest code, then builds here with scripts/build-exe.mjs.',
          'About 5 minutes, and faster after that. Needs ~3 GB of free disk.',
          localReady.ready ? `Ready — Node.js ${tools.nodeVersion}.` : `Needs: ${localReady.missing.join('; ')}`,
        ],
      },
    ],
    // The cloud build is the default because it asks the least of the machine in
    // front of you; when gh is not usable, the local one is the default instead.
    defaultIndex: remoteReady.ready ? 0 : 1,
    allowAbort: true,
  });

  if (answer === ABORT || answer === null) return null;
  const mode = answer === 1 ? 'local' : 'remote';
  const resolved = await confirmModeIsUsable(mode, tools);
  return resolved === ABORT ? null : resolved ?? mode;
}

/**
 * A mode can be chosen and still be unusable — no `gh`, no Node. Say so and
 * offer the other one, rather than failing four minutes into a build.
 *
 * @returns {Promise<'remote' | 'local' | null | -1>} the mode to use, null when
 *          the one asked for is fine, or ABORT when neither can run.
 */
async function confirmModeIsUsable(mode, tools) {
  if (checkModeRequirements(mode, tools).ready) return null;

  const check = checkModeRequirements(mode, tools);
  console.log('');
  detail(`✖ building ${mode === 'remote' ? 'on GitHub' : 'on this computer'} is not possible right now:`);
  for (const missing of check.missing) detail(`    ${missing}`);

  const other = mode === 'remote' ? 'local' : 'remote';
  if (!checkModeRequirements(other, tools).ready) {
    detail('  the other build path is not usable on this machine either.');
    return ABORT;
  }

  if (!canAnswer) {
    detail(`  ${other === 'remote' ? '--remote' : '--local'} would work here.`);
    return ABORT;
  }

  const answer = await askChoice({
    prompt: `Build ${other === 'remote' ? 'on GitHub' : 'on this computer'} instead?`,
    choices: ['Yes', 'No, stop here'],
    defaultIndex: 0,
    allowAbort: false,
  });
  return answer === 0 ? other : ABORT;
}

// ---------------------------------------------------------------------------
// build on GitHub
// ---------------------------------------------------------------------------

async function buildOnGitHub(github) {
  section('Build on GitHub');

  const target = resolveTargetRef({
    mode: 'remote',
    requestedRef: options.ref,
    currentBranch: github.branch,
    currentBranchOnRemote: github.branchOnRemote,
    defaultBranch: github.defaultBranch,
    shortSha: github.shortSha,
  });
  if (target.note) detail(`note: ${target.note}`);

  // The one thing worth stopping for: a cloud build cannot see work that was
  // never pushed, and it will happily spend ten minutes building the wrong code.
  if (github.isRepo) {
    // Measured against the ref GitHub will check out, not against this
    // checkout's own branch — the two differ exactly when it matters.
    const gap = measureAgainst(target.ref);
    const plan = planRemoteSource({
      ahead: gap.ahead,
      behind: gap.behind,
      trackedChanges: github.trackedChanges,
      untrackedFiles: github.untrackedFiles,
      interactive: canAnswer,
      currentBranch: github.branch,
      defaultBranch: github.defaultBranch,
      explicitRef: target.explicit,
    });
    for (const note of plan.notes) detail(`note: ${note}`);

    if (plan.action === 'blocked-unpushed') {
      throw new Error(
        `${plan.reason}.\n` +
          `  Push it:               git push origin ${github.branch ?? 'HEAD'}\n` +
          `  Or build it here:      --local\n` +
          `  Or build without them: --remote --ref ${target.ref}`,
      );
    }

    if (plan.action === 'ask-unpushed') {
      const answer = await askChoice({
        prompt: plan.question.prompt,
        choices: plan.question.choices,
        defaultIndex: plan.question.defaultIndex,
        allowAbort: false,
        // The default here pushes to GitHub, so --yes must not take it.
        auto: false,
      });
      if (answer === null || answer === 3) return null;
      if (answer === 2) {
        endSection();
        return { switchToLocal: true };
      }
      if (answer === 0) {
        if (github.branch == null) {
          throw new Error('A detached HEAD cannot be pushed to a branch name. Check out a branch first, or choose another option.');
        }
        runOrFail('git', ['push', '-u', 'origin', github.branch], { cwd: outputRoot, mutate: true });
        target.ref = github.branch;
        detail(`pushed ${github.branch} — that is what GitHub will build`);
        // The version names the exe files, and it is now the version of the
        // branch that was just pushed, not of the one measured before.
        github.remoteVersion = await readGitHubVersion(github.branch);
      } else {
        detail(`building ${target.ref} as it stands on GitHub`);
      }
    }
  }

  version = github.remoteVersion ?? version;
  detail(`GitHub will build ${target.ref} — ${workflowTargetChoice(options.targets)} target(s), app version ${version}`);

  // Run ids that already exist, so the run picked up after the dispatch is
  // definitely ours and not an earlier one that is still going.
  const before = listDispatchRunIds(target.ref);

  const dispatched = run('gh', dispatchArgs({ ref: target.ref, targets: options.targets, publish: false }), { mutate: true });
  if (!dispatched.ok && !dispatched.dryRun) {
    throw new Error(
      `GitHub refused the build request: ${firstLine(dispatched.stderr)}\n` +
        `  Check that you can run workflows:\n  https://github.com/${REPO.slug}/actions/workflows/${WORKFLOW_FILE}`,
    );
  }

  if (options.dryRun) {
    detail('dry run: stopping before the workflow is dispatched');
    endSection();
    return dryRunResult('remote', target.ref);
  }
  if (!dispatched.ok) {
    throw new Error(`GitHub refused the build request: ${firstLine(dispatched.stderr)}`);
  }

  const run_ = await waitForOurRun(target.ref, before);
  detail(`run ${run_.id} — ${run_.html_url}`);
  detail('the runner installs dependencies, builds the website, then packages the exe');

  const finished = await followRun(run_.id);
  if (!finished.ok) {
    await reportRunFailure(run_, finished);
    throw new Error(`the build on GitHub ${finished.text}. Nothing was downloaded.`);
  }

  detail('build succeeded — downloading the files');
  const outDir = path.join(outputRoot, OUTPUT_DIR);
  fs.mkdirSync(outDir, { recursive: true });
  runOrFail('gh', ['run', 'download', String(run_.id), '--name', ARTIFACT_NAME, '--dir', outDir], { mutate: true });

  const artifacts = collectArtifacts(version, outDir);
  if (artifacts.length === 0) {
    throw new Error(
      `the run finished but no exe was found in ${OUTPUT_DIR}/.\n` +
        `  See what it uploaded: ${run_.html_url}`,
    );
  }
  for (const artifact of artifacts) detail(`${artifact.name} — ${humanSize(artifact.size)}`);

  endSection();
  return {
    mode: 'remote',
    ref: target.ref,
    sha: run_.head_sha ?? null,
    runUrl: run_.html_url,
    artifacts,
    outDir,
    verifyLog: path.join(outDir, 'verify-desktop.log'),
  };
}

/** The result a dry run reports: the files it would have produced, unbuilt. */
function dryRunResult(mode, ref) {
  const outDir = path.join(outputRoot, OUTPUT_DIR);
  return {
    mode,
    ref,
    sha: null,
    artifacts: artifactNames(version, options.targets).map((name) => ({
      name,
      file: path.join(outDir, name),
      size: 0,
      missing: true,
    })),
    outDir,
    verifyLog: path.join(outDir, 'verify-desktop.log'),
  };
}

function listDispatchRunIds(ref) {
  const runs = ghJson([
    'repos', REPO.slug, 'actions', 'workflows', WORKFLOW_FILE, 'runs',
    '-X', 'GET',
    '-f', `branch=${ref}`, '-f', 'event=workflow_dispatch', '-f', 'per_page=20',
  ]);
  return new Set((runs?.workflow_runs ?? []).map((entry) => entry.id));
}

/**
 * `workflow_dispatch` answers 204 with no body, so the run has to be found by
 * looking for the one that did not exist a moment ago.
 */
async function waitForOurRun(ref, before, timeoutMs = 90_000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const runs = ghJson([
      'repos', REPO.slug, 'actions', 'workflows', WORKFLOW_FILE, 'runs',
      '-X', 'GET',
      '-f', `branch=${ref}`, '-f', 'per_page=20',
    ])?.workflow_runs ?? [];

    const ours = pickWorkflowRun(runs, { ref, excludeIds: before });
    if (ours) return ghJson(['repos', REPO.slug, 'actions', 'runs', String(ours.id)]) ?? ours;
    await sleep(3000);
  }
  throw new Error(
    'GitHub accepted the build request but no run appeared within 90 seconds.\n' +
      `  Look for it here: https://github.com/${REPO.slug}/actions/workflows/${WORKFLOW_FILE}`,
  );
}

/** Follow a run to its end, keeping one line on screen instead of scrolling. */
async function followRun(runId) {
  const startedAt = Date.now();
  const deadline = startedAt + options.timeoutMinutes * 60_000;
  let lastLine = '';

  for (;;) {
    const current = ghJson(['repos', REPO.slug, 'actions', 'runs', String(runId)]);
    if (!current) throw new Error(`could not read run ${runId} from GitHub any more.`);

    const state = describeRun(current);
    const jobNote = current.status === 'in_progress' ? currentJob(runId) : '';
    const line = `on GitHub for ${humanDuration(Date.now() - startedAt)} — ${state.text}${jobNote ? ` (${jobNote})` : ''}`;

    if (interactive) {
      process.stdout.write(`\r      ${line.padEnd(78).slice(0, 78)}`);
    } else if (line !== lastLine) {
      // A redirected log wants whole lines, not a carriage-return animation.
      console.log(`      ${line}`);
    }
    lastLine = line;

    if (state.done) {
      if (interactive) process.stdout.write('\n');
      return { ok: state.ok, text: state.text, run: current };
    }

    if (Date.now() > deadline) {
      if (interactive) process.stdout.write('\n');
      throw new Error(
        `the build on GitHub is still running after ${options.timeoutMinutes} minutes.\n` +
          '  It is not lost — follow it, and download the files when it ends:\n' +
          `  ${current.html_url}\n` +
          '  Or allow longer next time: --timeout 90',
      );
    }

    await sleep(10_000);
  }
}

/** The step the runner is on, so a long wait says what it is waiting for. */
function currentJob(runId) {
  const jobs = ghJson(['repos', REPO.slug, 'actions', 'runs', String(runId), 'jobs']);
  const job = (jobs?.jobs ?? []).find((entry) => entry.status === 'in_progress');
  if (!job) return '';
  const step = (job.steps ?? []).find((entry) => entry.status === 'in_progress');
  return step?.name ?? job.name ?? '';
}

async function reportRunFailure(failedRun, finished) {
  const jobs = ghJson(['repos', REPO.slug, 'actions', 'runs', String(failedRun.id), 'jobs']);
  const steps = failedSteps(jobs?.jobs ?? []);
  console.log('');
  detail(`✖ the build on GitHub ${finished.text}`);
  for (const step of steps) detail(`    failed at: ${step}`);
  detail(`    log: ${failedRun.html_url}`);

  if (!canAnswer) return;
  const answer = await askChoice({
    prompt: 'Print the failing part of the log here?',
    choices: ['Yes', 'No'],
    defaultIndex: 0,
    allowAbort: false,
  });
  if (answer !== 0) return;
  console.log('');
  run('gh', ['run', 'view', String(failedRun.id), '--log-failed'], { inherit: true });
  console.log('');
}

// ---------------------------------------------------------------------------
// build on this computer
// ---------------------------------------------------------------------------

async function buildHere(tools, github) {
  section('Build on this computer');

  if (!github.isRepo) {
    throw new Error('Building here needs a checkout of the code, and this is not one. Use --remote, or --repo-dir <path>.');
  }
  if (!tools.nodeOk) {
    throw new Error(
      `Node.js 22.12+, 24 or 26+ is required to build here (found ${tools.nodeVersion}).\n` +
        '  Install it from https://nodejs.org, or build on GitHub instead with --remote.',
    );
  }

  const target = resolveTargetRef({
    mode: 'local',
    requestedRef: options.ref,
    currentBranch: github.branch,
    currentBranchOnRemote: github.branchOnRemote,
    defaultBranch: github.defaultBranch,
    shortSha: github.shortSha,
  });
  if (target.note) detail(`note: ${target.note}`);

  // Measured against the ref about to be built, which is the branch this
  // checkout is on unless --ref named something else.
  const gap = measureAgainst(target.ref);
  const plan = planLocalSync({
    sync: options.sync,
    hasUpstream: gap.exists,
    behind: gap.behind,
    ahead: gap.ahead,
    trackedChanges: github.trackedChanges,
    untrackedFiles: github.untrackedFiles,
    explicitRef: target.explicit,
    refDiffersFromCurrent: target.ref !== github.branch,
    interactive: canAnswer,
  });
  for (const note of plan.notes) detail(`note: ${note}`);
  // The refusal below carries its own reason, so printing it twice reads as noise.
  if (plan.action !== 'blocked-dirty') detail(plan.reason);

  switch (plan.action) {
    case 'skip':
    case 'up-to-date':
    case 'use-current':
      break;

    case 'fast-forward': {
      const from = github.shortSha;
      runOrFail('git', ['merge', '--ff-only', `origin/${target.ref}`], { cwd: outputRoot, mutate: true });
      if (!options.dryRun) detail(`${target.ref}: ${from} → ${gitIn(outputRoot, 'rev-parse', '--short', 'HEAD')}`);
      break;
    }

    case 'checkout-and-sync': {
      runOrFail('git', ['checkout', target.ref], { cwd: outputRoot, mutate: true });
      if (!options.dryRun && gitIn(outputRoot, 'rev-parse', '--verify', '--quiet', `origin/${target.ref}`) != null) {
        const ff = capture('git', ['merge', '--ff-only', `origin/${target.ref}`], { cwd: outputRoot });
        detail(ff.ok ? `now at ${gitIn(outputRoot, 'rev-parse', '--short', 'HEAD')}` : `left as checked out (${firstLine(ff.stderr)})`);
      }
      break;
    }

    case 'ask-dirty': {
      const answer = await askChoice({
        prompt: plan.question.prompt,
        choices: plan.question.choices,
        defaultIndex: plan.question.defaultIndex,
        allowAbort: false,
      });
      if (answer === null || answer === 1) {
        endSection();
        throw new Error(
          'Stopped, and nothing was changed.\n' +
            '  Commit it:  git add -A && git commit -m "…"\n' +
            '  Or park it: git stash   (then git stash pop afterwards)',
        );
      }
      detail('building what is checked out — your changes are untouched, and they will be in the app');
      break;
    }

    case 'blocked-dirty':
      throw new Error(
        `${plan.reason}.\n` +
          `  Changed: ${github.trackedChanges.slice(0, 6).join(', ')}${github.trackedChanges.length > 6 ? ', …' : ''}\n` +
          '  Commit or stash them and run again, or add --no-sync to build exactly what is on disk.',
      );

    default:
      throw new Error(`internal: unhandled sync action "${plan.action}"`);
  }

  // The sync may have moved the tree, and the version in package.json is what
  // names the exe files — so read both again now that we know what we are building.
  if (!options.dryRun) version = readLocalVersion() ?? version;
  const buildingFrom = options.dryRun ? github.shortSha : gitIn(outputRoot, 'rev-parse', '--short', 'HEAD');
  detail(`building v${version} from ${target.label}${buildingFrom ? ` @ ${buildingFrom}` : ''}`);

  const buildScript = path.join(outputRoot, 'scripts', 'build-exe.mjs');
  const buildArgs = [buildScript];
  if (options.targets === 'installer') buildArgs.push('--installer-only');
  if (options.targets === 'portable') buildArgs.push('--portable-only');
  if (options.verbose) buildArgs.push('--verbose');

  console.log('');
  runOrFail(process.execPath, buildArgs, { cwd: outputRoot, mutate: true, inherit: true });
  console.log('');

  const outDir = path.join(outputRoot, OUTPUT_DIR);
  const artifacts = options.dryRun
    ? dryRunResult('local', target.ref).artifacts
    : collectArtifacts(version, outDir);

  endSection();
  return {
    mode: 'local',
    ref: target.ref,
    sha: options.dryRun ? null : gitIn(outputRoot, 'rev-parse', '--short', 'HEAD'),
    artifacts,
    outDir,
    verifyLog: null,
  };
}

// ---------------------------------------------------------------------------
// verify, publish, summary
// ---------------------------------------------------------------------------

async function finish(built, tools) {
  const verdict = await verify(built);
  await publish(built, verdict, tools);
  await summary(built, verdict);
}

async function verify(built) {
  section('Verify');

  if (built.mode === 'remote') {
    // The workflow already booted the packaged app and uploaded the log. Reading
    // that beats running the check again against files this machine cannot boot.
    if (options.dryRun) {
      detail(`would read ${ARTIFACT_NAME}/verify-desktop.log from the download`);
      endSection();
      return { ok: null, reason: 'dry run' };
    }
    if (!built.verifyLog || !fs.existsSync(built.verifyLog)) {
      detail('? the download has no verify-desktop.log — the workflow did not upload one');
      detail('  the exe files are still in dist-electron/ if you want them');
      endSection();
      return { ok: null, reason: 'the cloud build did not report a verification result' };
    }
    const result = interpretVerifyLog(decodeLog(fs.readFileSync(built.verifyLog)));
    detail(`${result.ok === true ? '✔' : result.ok === false ? '✖' : '?'} ${result.reason}`);
    for (const failure of result.failures.slice(0, 6)) detail(`    ${failure}`);
    if (result.ok === null) detail('    that is not a failure — the log just does not say either way');
    endSection();
    return result;
  }

  if (!options.verify) {
    detail('--skip-verify: not booting the packaged app');
    endSection();
    return { ok: null, reason: 'verification was skipped' };
  }
  if (options.dryRun) {
    detail('would run: node scripts/verify-desktop-package.mjs');
    detail('it boots the packaged app and requests the routes the exe depends on');
    endSection();
    return { ok: null, reason: 'dry run' };
  }

  detail('booting the packaged app and requesting the routes the exe depends on…');
  console.log('');
  const result = run(process.execPath, [path.join(outputRoot, 'scripts', 'verify-desktop-package.mjs')], {
    cwd: outputRoot,
    mutate: true,
    inherit: true,
  });
  console.log('');
  detail(result.ok ? '✔ the packaged app passed its check' : '✖ the packaged app did not pass its check — see the output above');
  endSection();
  return { ok: result.ok, reason: result.ok ? 'passed here' : 'failed here' };
}

async function publish(built, verdict, tools) {
  section('Publish');

  const tag = `v${version}`;
  const files = built.artifacts.filter((artifact) => !artifact.missing).map((artifact) => artifact.file);

  if (options.dryRun && files.length === 0) {
    detail(`would offer to publish ${tag} with the ${built.artifacts.length} exe file(s) this build produces`);
    endSection();
    return;
  }

  if (options.publish === 'no') {
    detail('--no-publish: the files stay on this computer');
    endSection();
    return;
  }

  // A failed verification is a reason not to publish, not a hard stop: the
  // developer may know something the check does not. --publish is them saying so.
  if (verdict.ok === false && options.publish !== 'yes') {
    detail(`✖ not publishing — the packaged app failed verification (${verdict.reason})`);
    detail('  fix the build, or override with --publish once you have read the failure');
    endSection();
    return;
  }

  let confirmed = options.publish === 'yes';
  if (!confirmed) {
    if (!canAnswer) {
      detail('the files are ready, but publishing needs a decision and there is nobody here to ask');
      detail(`  to publish: gh release create ${tag} --repo ${REPO.slug} --generate-notes ${files.map(quote).join(' ')}`);
      endSection();
      return;
    }
    console.log('');
    detail('Publishing makes these the files residents download:');
    for (const artifact of built.artifacts) detail(`    ${artifact.name} — ${humanSize(artifact.size)}`);
    detail("the site's download button points at the newest release automatically.");
    if (verdict.ok === false) detail('⚠ this build failed verification, and --publish was given anyway.');
    if (await confirmYesNo(`Publish ${tag} to GitHub Releases now?`, false) !== true) {
      detail(`not published — the files are in ${OUTPUT_DIR}/`);
      endSection();
      return;
    }
    confirmed = true;
  }

  const releaseExists = capture('gh', ['release', 'view', tag, '--repo', REPO.slug]).ok;
  const notesFile = path.join(outputRoot, 'release', tag, 'RELEASE.md');
  const plan = planPublish({
    version,
    files,
    ghAvailable: tools.ghAvailable,
    ghAuthenticated: tools.ghAuthenticated,
    releaseExists,
    confirmed,
    explicitPublish: options.publish === 'yes',
    tag,
  });

  if (plan.action === 'blocked') {
    detail(`✖ cannot publish: ${plan.reason}`);
    endSection();
    return;
  }

  detail(plan.reason);
  if (fs.existsSync(notesFile)) detail(`release notes: release/${tag}/RELEASE.md`);
  else detail('release notes: generated by GitHub from the commits');

  const args = plan.action === 'create'
    ? releaseCreateArgs({
        tag,
        title: `DOR101 ${tag}`,
        files,
        notesFile: fs.existsSync(notesFile) ? notesFile : null,
      })
    : releaseUploadArgs({ tag, files });

  if (options.dryRun) {
    detail(`would run: gh ${args.map(quote).join(' ')}`);
    endSection();
    return;
  }

  runOrFail('gh', args, { mutate: true, inherit: true });
  detail(`✔ https://github.com/${REPO.slug}/releases/tag/${tag}`);
  endSection();
}

async function summary(built, verdict) {
  section('Done');

  const total = built.artifacts.reduce((sum, artifact) => sum + artifact.size, 0);
  const shown = path.relative(process.cwd(), built.outDir) || built.outDir;

  console.log(`  Version      ${version}`);
  console.log(`  Built from   ${built.ref}${built.sha ? ` @ ${String(built.sha).slice(0, 12)}` : ''} — ${built.mode === 'remote' ? 'on GitHub' : 'on this computer'}`);
  if (built.runUrl) console.log(`  Run          ${built.runUrl}`);
  console.log(`  Verified     ${verdictText(verdict)}`);
  console.log(`  Files        ${shown}${total > 0 ? `  (${humanSize(total)})` : ''}`);
  for (const artifact of built.artifacts) {
    console.log(`               • ${artifact.name}${artifact.missing ? '  (not built — dry run)' : ` — ${humanSize(artifact.size)}`}`);
  }

  if (built.artifacts.length > 0 && !options.dryRun) {
    console.log('');
    console.log('  Which one do I want?');
    for (const artifact of built.artifacts) {
      const kind = artifact.name.includes('Portable')
        ? 'portable — runs from a USB stick or a shared computer; no install, no admin rights'
        : 'installer — Start Menu and Desktop shortcuts, plus an uninstaller';
      console.log(`    ${artifact.name.includes('Portable') ? 'Portable' : 'Setup   '}   ${kind}`);
    }
  }

  console.log('');
  if (timers.length > 0) {
    console.log(`  Time         ${timers.map((entry) => `${entry.label} ${humanDuration(entry.ms)}`).join(', ')}`);
    console.log('');
  }
  endSection();

  if (built.artifacts.some((artifact) => !artifact.missing) && (options.open || interactive)) {
    await openOutputFolder(built.outDir);
  }
}

function verdictText(verdict) {
  if (verdict.ok === true) return 'yes';
  if (verdict.ok === false) return `NO — ${verdict.reason}`;
  return `not checked (${verdict.reason})`;
}

/** The double-click case: the window is the only view of the result, so offer the files. */
async function openOutputFolder(dir) {
  if (!options.open) {
    const answer = await confirmYesNo(`Open ${OUTPUT_DIR}/ to see the files?`, true);
    if (answer !== true) return;
  }
  const opener = process.platform === 'win32' ? 'explorer' : process.platform === 'darwin' ? 'open' : 'xdg-open';
  const result = run(opener, [dir], { mutate: true });
  // `explorer` exits non-zero even when it opened the window, so never fail the
  // run over it — just say where the files are.
  if (!result.ok && !result.dryRun) detail(`open it yourself: ${dir}`);
}

function stopped() {
  console.log('');
  console.log('  Stopped. Nothing was changed and nothing was published.');
  console.log('');
}

// ---------------------------------------------------------------------------
// running things
// ---------------------------------------------------------------------------

/**
 * Run a command.
 *
 * `mutate: true` marks the ones that change something — a file, a git ref, a
 * GitHub run, a release — and those are the only ones `--dry-run` holds back.
 * Reads still happen for real, so a dry run reports the actual state of the
 * repository rather than a guess at it.
 */
function run(command, args, { cwd = outputRoot, mutate = false, inherit = false, env = process.env } = {}) {
  if (mutate && options.dryRun) {
    console.log(`      [dry run] would run: ${[command, ...args].map(quote).join(' ')}`);
    return { ok: true, dryRun: true, stdout: '', stderr: '' };
  }
  const result = spawnSync(command, args, {
    cwd,
    env,
    encoding: 'utf8',
    stdio: inherit ? 'inherit' : ['ignore', 'pipe', 'pipe'],
    shell: false,
    windowsHide: true,
  });
  return {
    ok: result.status === 0,
    status: result.status,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    error: result.error,
  };
}

function runOrFail(command, args, runOptions = {}) {
  const result = run(command, args, runOptions);
  if (result.error) {
    const hint = command === 'gh' && result.error.code === 'ENOENT'
      ? 'the GitHub CLI is not installed — winget install GitHub.cli, or brew install gh'
      : result.error.message;
    throw new Error(`could not run \`${command}\`: ${hint}`);
  }
  if (!result.ok && !result.dryRun) {
    const shown = [command, ...args].map(quote).join(' ');
    const why = firstLine(result.stderr) || firstLine(result.stdout);
    throw new Error(`\`${shown}\` failed${result.status != null ? ` (exit ${result.status})` : ''}${why ? `:\n  ${why}` : ''}`);
  }
  return result;
}

/** Run a command for its answer. Never throws: a failed read is just a "no". */
function capture(command, args, runOptions = {}) {
  const result = run(command, args, { ...runOptions, inherit: false });
  return result.error ? { ok: false, stdout: '', stderr: result.error.message } : result;
}

function ghJson(pathParts) {
  const result = capture('gh', ['api', ...pathParts]);
  if (!result.ok) return null;
  try {
    return JSON.parse(result.stdout);
  } catch {
    return null;
  }
}

/** git in a specific directory — `outputRoot` can move when --repo-dir clones. */
function gitIn(dir, ...gitArgs) {
  const result = spawnSync('git', gitArgs, {
    cwd: dir,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  });
  return result.status === 0 ? result.stdout.trim() : null;
}

/**
 * git without the trim, for the commands whose output is positional.
 *
 * `git status --porcelain` is fixed-width: `XY␣path`, where a worktree-only
 * edit begins with a space. Trimming that leading space shifts every column and
 * quietly eats the first character of each filename, so ` M README.md` reads as
 * `EADME.md`. Values that are not positional keep using `gitIn`.
 */
function gitInRaw(dir, ...gitArgs) {
  const result = spawnSync('git', gitArgs, {
    cwd: dir,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  });
  return result.status === 0 ? result.stdout.replace(/\n$/, '') : null;
}

function isGitRepo(dir) {
  return fs.existsSync(path.join(dir, '.git')) || gitIn(dir, 'rev-parse', '--is-inside-work-tree') === 'true';
}

function readLocalVersion() {
  try {
    return JSON.parse(fs.readFileSync(path.join(outputRoot, 'package.json'), 'utf8')).version ?? null;
  } catch {
    return null;
  }
}

/** Find a tool on PATH and its version, or null when it is not installed. */
function which(tool) {
  const isWindows = process.platform === 'win32';
  const finder = spawnSync(isWindows ? 'where' : 'command', isWindows ? [tool] : ['-v', tool], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
    shell: !isWindows, // `command` is a shell builtin
  });
  if (finder.status !== 0) return null;
  const found = firstLine(finder.stdout);
  const version = spawnSync(tool, ['--version'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
    shell: isWindows, // .cmd shims need a shell on modern Node
  });
  return {
    path: found,
    version: version.status === 0 ? firstLine(version.stdout).replace(/^(git|gh) version /, '').split(' ')[0] : '',
  };
}

/** The exe files this build was supposed to produce, with the sizes on disk. */
function collectArtifacts(buildVersion, outDir) {
  const found = [];
  for (const name of artifactNames(buildVersion, options.targets)) {
    const file = path.join(outDir, name);
    if (fs.existsSync(file)) {
      found.push({ name, file, size: fs.statSync(file).size, missing: false });
    } else if (options.dryRun) {
      found.push({ name, file, size: 0, missing: true });
    }
  }
  return found;
}

// ---------------------------------------------------------------------------
// asking
// ---------------------------------------------------------------------------

/**
 * Offer numbered choices.
 *
 * @returns {Promise<number | null>} the index chosen, ABORT if the developer
 *          stopped, or null when there is nobody to ask — a distinction callers
 *          act on, because "could not ask" must never become a default that
 *          changes the tree or publishes something.
 */
async function askChoice({ prompt, choices, defaultIndex = 0, allowAbort = true, auto = true }) {
  const titleOf = (choice) => (typeof choice === 'string' ? choice : choice.title);

  if (options.assumeYes) {
    // --yes means "stop asking me safe questions". A question whose default
    // writes to GitHub is not safe, so it stops instead of answering — that is
    // the difference between --yes and --publish.
    if (!auto) {
      detail(`--yes will not answer this one, because the default would change something on GitHub:`);
      if (prompt) detail(`  ${prompt}`);
      return ABORT;
    }
    if (prompt) {
      console.log('');
      console.log(`  ${prompt}`);
    }
    detail(`--yes: ${titleOf(choices[defaultIndex])}`);
    return defaultIndex;
  }

  if (!interactive) return null;

  if (prompt) {
    console.log('');
    console.log(`  ${prompt}`);
  }
  choices.forEach((choice, index) => {
    const item = typeof choice === 'string' ? { title: choice } : choice;
    console.log(`    ${index + 1}  ${item.title}${index === defaultIndex ? '  ← default' : ''}`);
    for (const line of item.detail ?? []) console.log(`         ${line}`);
  });

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    for (;;) {
      const suffix = allowAbort ? ', q = stop' : '';
      const answer = (await question(rl, `\n  Enter ${choices.length > 1 ? `1-${choices.length}` : '1'} (Enter = ${defaultIndex + 1}${suffix}): `)).trim().toLowerCase();
      if (answer === '') return defaultIndex;
      if (allowAbort && ['q', 'quit', 'stop', 'cancel'].includes(answer)) return ABORT;
      const picked = Number(answer);
      if (Number.isInteger(picked) && picked >= 1 && picked <= choices.length) return picked - 1;
      console.log(`  Please enter a number between 1 and ${choices.length}.`);
    }
  } finally {
    rl.close();
  }
}

async function confirmYesNo(prompt, defaultYes) {
  if (options.assumeYes) {
    // Both confirmations this tool asks default to the safe side: "publish?"
    // defaults to no, so --yes can never put a release on the internet.
    detail(`--yes: ${prompt} → ${defaultYes ? 'yes' : 'no'}`);
    return defaultYes;
  }
  if (!interactive) return null;
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    for (;;) {
      const answer = (await question(rl, `\n  ${prompt} [${defaultYes ? 'Y/n' : 'y/N'}]: `)).trim().toLowerCase();
      if (answer === '') return defaultYes;
      if (['y', 'yes'].includes(answer)) return true;
      if (['n', 'no'].includes(answer)) return false;
      console.log('  Please answer y or n.');
    }
  } finally {
    rl.close();
  }
}

function question(rl, text) {
  return new Promise((resolve) => rl.question(text, resolve));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// printing
// ---------------------------------------------------------------------------

function section(title) {
  currentSection = { title, started: Date.now(), label: title.toLowerCase().replace(/[^a-z0-9]+/g, '-') };
  console.log('');
  console.log(`── ${title} ${'─'.repeat(Math.max(0, 58 - title.length))}`);
  console.log('');
}

function endSection() {
  if (!currentSection) return;
  timers.push({ label: currentSection.label, ms: Date.now() - currentSection.started });
  currentSection = null;
}

function detail(message) {
  console.log(`      ${message}`);
}

function quote(value) {
  return /\s/.test(value) ? `"${value}"` : value;
}

function firstLine(text) {
  return (text ?? '').split('\n').map((line) => line.trim()).find((line) => line !== '') ?? '';
}

function printHelp() {
  console.log(`
Make the DOR101 Windows app from the code on GitHub.

  A maintainer's tool. Residents download the finished app from the website;
  this is what produces it.

Usage
  Double-click Build-App.bat            Windows
  Double-click build-app.command        macOS
  node scripts/make-app.mjs [options]   anywhere

With no options it connects to GitHub, shows you what it found, and asks where
to build. Every question has a default, so pressing Enter all the way through
is a complete, safe run: the latest main, built on GitHub, verified, and not
published.

Where to build
  --remote              build on GitHub's Windows runner and download the exe
                        files here. Needs a signed-in gh, and nothing else
  --local               build on this computer with scripts/build-exe.mjs.
                        Needs Node.js 22.12+/24/26+ and ~3 GB of free disk

What to build
  --ref <branch|tag>    build this ref instead of the default. Locally it is
                        also checked out, but only when the tree is clean
  --repo-dir <path>     use this clone; a folder that does not exist is cloned
  --no-sync             local only: build what is checked out, pull nothing
  --installer-only      just the setup exe
  --portable-only       just the no-install exe

After building
  --skip-verify         do not boot the packaged app
  --publish             publish to GitHub Releases without asking
  --no-publish          never offer to publish
  --open                open the output folder when finished
  --timeout <minutes>   how long to wait for a cloud build (default ${DEFAULT_RUN_TIMEOUT_MINUTES})

Other
  --yes                 take the default answer to safe questions. It never
                        publishes (that is --publish) and never discards work —
                        it stops instead
  --dry-run             print what would happen; nothing is built or changed
  --verbose             stack traces when something fails
  -h, --help            this message

Output
  ${OUTPUT_DIR}/DOR101 Setup <version>.exe        installer
  ${OUTPUT_DIR}/DOR101-Portable-<version>.exe    portable, no install
  ${OUTPUT_DIR}/SHA256SUMS.txt                    checksums, from either path

Safety
  The only change this tool makes to your tree is a fast-forward of a clean
  branch, or a checkout of a ref you named. Uncommitted changes are reported
  and asked about, never stashed, reset or discarded. Publishing needs an
  explicit yes, and a build that fails verification is not offered for it.

Examples
  node scripts/make-app.mjs                     ask me, every time
  node scripts/make-app.mjs --remote            build on GitHub, download, verify
  node scripts/make-app.mjs --local --no-sync   rebuild what is on my disk
  node scripts/make-app.mjs --remote --publish  build, verify, release v<version>
  node scripts/make-app.mjs --ref v4.9.0 --local
                                                rebuild an older version
  node scripts/make-app.mjs --dry-run --remote  show me exactly what it would do
`);
}
