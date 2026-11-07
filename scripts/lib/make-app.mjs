/**
 * Decision helpers for `scripts/make-app.mjs` — the maintainer's one-command
 * "make the app" tool.
 *
 * Everything in this file is pure: it takes a description of the world and
 * returns a description of what should happen. No git, no `gh`, no prompts, no
 * filesystem. That split is deliberate — the two decisions this tool makes that
 * can actually hurt are
 *
 *   1. touching the developer's working tree while syncing with GitHub, and
 *   2. publishing something public to GitHub Releases,
 *
 * and both are decided here, where they can be asserted in
 * `src/__tests__/makeApp.test.ts` instead of being discovered by losing work.
 *
 * The rule this file implements, and the one worth remembering when changing
 * it: **the tool never discards anything and never publishes without being
 * told to.** It fast-forwards a clean tree, it stops and asks about a dirty
 * one, and it refuses to build on GitHub when the commits that would be built
 * are not the commits the developer has.
 */

/** Where the app comes from. `builder.config.js` publishes to the same repo. */
export const REPO = Object.freeze({
  owner: 'Nikoxkx',
  name: 'Dorchester-101',
  slug: 'Nikoxkx/Dorchester-101',
});

/** The workflow that builds the Windows exe on GitHub's runners. */
export const WORKFLOW_FILE = 'release.yml';

/** The artifact that workflow uploads (see `.github/workflows/release.yml`). */
export const ARTIFACT_NAME = 'DOR101-Windows';

/** Every build path lands its files here, so there is one answer to "where is my exe?". */
export const OUTPUT_DIR = 'dist-electron';

/** How long a cloud build may take before we stop waiting for it. */
export const DEFAULT_RUN_TIMEOUT_MINUTES = 45;

// ---------------------------------------------------------------------------
// arguments
// ---------------------------------------------------------------------------

const BOOLEAN_FLAGS = Object.freeze({
  '--remote': { key: 'mode', value: 'remote' },
  '--cloud': { key: 'mode', value: 'remote' },
  '--local': { key: 'mode', value: 'local' },
  '--here': { key: 'mode', value: 'local' },
  '--no-sync': { key: 'sync', value: false },
  '--skip-verify': { key: 'verify', value: false },
  '--installer-only': { key: 'targets', value: 'installer' },
  '--portable-only': { key: 'targets', value: 'portable' },
  '--publish': { key: 'publish', value: 'yes' },
  '--no-publish': { key: 'publish', value: 'no' },
  '--open': { key: 'open', value: true },
  '--yes': { key: 'assumeYes', value: true },
  '--dry-run': { key: 'dryRun', value: true },
  '--verbose': { key: 'verbose', value: true },
});

const VALUE_FLAGS = Object.freeze(['--ref', '--repo-dir', '--timeout']);

const DEFAULTS = Object.freeze({
  /** 'ask' | 'remote' | 'local' — where the exe gets built. */
  mode: 'ask',
  /** Branch or tag to build from. `null` means "work it out, then tell me". */
  ref: null,
  /** Use this clone instead of the one the tool is standing in. */
  repoDir: null,
  /** 'both' | 'installer' | 'portable'. */
  targets: 'both',
  sync: true,
  verify: true,
  /** 'ask' | 'yes' | 'no'. Only an explicit --publish ever publishes. */
  publish: 'ask',
  open: false,
  assumeYes: false,
  dryRun: false,
  verbose: false,
  help: false,
  timeoutMinutes: DEFAULT_RUN_TIMEOUT_MINUTES,
});

/**
 * Parse the command line.
 *
 * Returns `{ options, errors }` rather than throwing, so the CLI can print
 * every mistake at once instead of the developer fixing them one run at a time.
 *
 * @param {string[]} argv  arguments after the script name
 * @returns {{ options: typeof DEFAULTS, errors: string[] }}
 */
export function parseArgs(argv) {
  const options = { ...DEFAULTS };
  const errors = [];
  const seen = new Set();

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];

    if (token === '--help' || token === '-h') {
      options.help = true;
      continue;
    }

    // `--ref=main` and `--ref main` mean the same thing.
    const [flag, inlineValue] = token.includes('=') && token.startsWith('--')
      ? [token.slice(0, token.indexOf('=')), token.slice(token.indexOf('=') + 1)]
      : [token, undefined];

    if (VALUE_FLAGS.includes(flag)) {
      const value = inlineValue ?? argv[i + 1];
      if (value === undefined || value.startsWith('--')) {
        errors.push(`${flag} needs a value, e.g. ${flag} main`);
        continue;
      }
      if (inlineValue === undefined) i += 1;
      seen.add(flag);
      if (flag === '--ref') options.ref = value;
      if (flag === '--repo-dir') options.repoDir = value;
      if (flag === '--timeout') {
        const minutes = Number(value);
        if (!Number.isFinite(minutes) || minutes <= 0) {
          errors.push(`--timeout needs a number of minutes, e.g. --timeout 30 (got "${value}")`);
        } else {
          options.timeoutMinutes = minutes;
        }
      }
      continue;
    }

    const boolean = BOOLEAN_FLAGS[flag];
    if (boolean) {
      seen.add(flag);
      options[boolean.key] = boolean.value;
      continue;
    }

    errors.push(`Unknown option "${token}". Run with --help to see what this tool accepts.`);
  }

  if (seen.has('--remote') && seen.has('--local')) {
    errors.push('--remote and --local contradict each other. Pick where the app should be built.');
  }
  if (seen.has('--installer-only') && seen.has('--portable-only')) {
    errors.push('--installer-only and --portable-only contradict each other. Pick one, or neither for both.');
  }
  if (seen.has('--publish') && seen.has('--no-publish')) {
    errors.push('--publish and --no-publish contradict each other.');
  }
  if (seen.has('--no-sync') && options.mode === 'remote') {
    // Not a contradiction — GitHub builds whatever is on GitHub — but the flag
    // would do nothing at all, and a silently ignored flag is how you end up
    // shipping a build of the wrong commit.
    errors.push('--no-sync has no effect with --remote: GitHub builds the code that is already on GitHub.');
  }

  return { options, errors };
}

// ---------------------------------------------------------------------------
// reading git's answers
// ---------------------------------------------------------------------------

/**
 * Split `git status --porcelain` into changes that matter and noise.
 *
 * Tracked modifications are what can collide with a fast-forward, so they are
 * the ones the tool asks about. Untracked files are reported but never block
 * anything: a merge only touches them if the incoming commits add a file at the
 * same path, and git refuses the merge itself in that case rather than
 * overwriting it.
 *
 * @param {string} porcelain  stdout of `git status --porcelain`
 * @returns {{ tracked: string[], untracked: string[] }}
 */
export function parseStatusPorcelain(porcelain) {
  const tracked = [];
  const untracked = [];

  for (const line of (porcelain ?? '').split('\n')) {
    if (line.trim() === '') continue;
    const code = line.slice(0, 2);
    // `--porcelain` puts the file at a fixed offset; renames read `R  old -> new`.
    const file = line.slice(3).split(' -> ').pop() ?? line.slice(3);
    if (code === '??') untracked.push(file);
    else if (code !== '!!') tracked.push(file);
  }

  return { tracked, untracked };
}

/**
 * Parse `git rev-list --left-right --count <theirs>...<ours>`.
 *
 * The left/right order is the easy thing to get backwards, and getting it
 * backwards inverts every safety check in this tool — "you have unpushed work"
 * would become "GitHub has work you are missing". Called as
 * `--count origin/main...HEAD`, left is what GitHub has that this checkout does
 * not (**behind**) and right is what this checkout has that GitHub does not
 * (**ahead**).
 *
 * @param {string} counts  e.g. `"2\t3"`
 * @returns {{ behind: number, ahead: number }}
 */
export function parseAheadBehind(counts) {
  const [left, right] = (counts ?? '').trim().split(/\s+/).map(Number);
  return {
    behind: Number.isFinite(left) ? left : 0,
    ahead: Number.isFinite(right) ? right : 0,
  };
}

/**
 * Decide the ref to build from.
 *
 * An explicit `--ref` always wins. Otherwise a local build stays on whatever
 * branch the developer is already on — switching branches without being asked
 * is exactly the surprise this tool should not produce.
 *
 * A cloud build has one extra constraint: GitHub can only build a ref that
 * exists on GitHub. Dispatching a workflow against a branch that was never
 * pushed fails with "No ref found", so a local-only branch falls back to the
 * repository's default branch, and says so in `note` rather than silently
 * building something else.
 *
 * @param {{ mode: 'remote' | 'local', requestedRef?: string | null, currentBranch?: string | null, currentBranchOnRemote?: boolean, defaultBranch?: string | null, shortSha?: string | null }} input
 * @returns {{ ref: string, explicit: boolean, detached: boolean, label: string, note: string | null }}
 */
export function resolveTargetRef(input) {
  const {
    mode,
    requestedRef = null,
    currentBranch = null,
    currentBranchOnRemote = true,
    defaultBranch = null,
    shortSha = null,
  } = input;

  if (requestedRef) {
    return {
      ref: requestedRef,
      explicit: true,
      detached: currentBranch === null,
      label: requestedRef,
      note: null,
    };
  }

  if (mode === 'remote') {
    if (currentBranch && currentBranchOnRemote) {
      return { ref: currentBranch, explicit: false, detached: false, label: currentBranch, note: null };
    }
    const ref = defaultBranch ?? 'main';
    return {
      ref,
      explicit: false,
      detached: currentBranch === null,
      label: ref,
      note: currentBranch
        ? `${currentBranch} only exists on this computer, so the cloud build uses ${ref}`
        : `this checkout is a detached HEAD, so the cloud build uses ${ref}`,
    };
  }

  if (currentBranch) {
    return { ref: currentBranch, explicit: false, detached: false, label: currentBranch, note: null };
  }

  // Detached HEAD on a local build is usually deliberate — rebuilding an old
  // tag — so build exactly that and let --ref override it.
  return {
    ref: shortSha ?? 'HEAD',
    explicit: false,
    detached: true,
    label: `detached HEAD${shortSha ? ` @ ${shortSha}` : ''}`,
    note: `building the checked-out commit, not a branch; pass --ref ${defaultBranch ?? 'main'} for the latest`,
  };
}

// ---------------------------------------------------------------------------
// the two safety decisions
// ---------------------------------------------------------------------------

/**
 * @typedef {object} TreeState
 * @property {boolean} hasUpstream       the current branch exists on GitHub
 * @property {number} behind             commits GitHub has that this checkout does not
 * @property {number} ahead              commits this checkout has that GitHub does not
 * @property {string[]} trackedChanges   modified/staged tracked files
 * @property {string[]} untrackedFiles   files git does not know about
 */

/**
 * Work out what to do with the working tree before building **here**.
 *
 * Never proposes anything destructive. The only tree-changing action it can
 * return is a fast-forward of a clean branch, or a checkout of a ref the
 * developer named explicitly — and a checkout is only offered when the tree is
 * clean, because `git checkout` would either refuse or carry local edits into
 * another branch.
 *
 * @param {TreeState & { sync?: boolean, explicitRef?: boolean, refDiffersFromCurrent?: boolean, interactive?: boolean, assumeYes?: boolean }} state
 * @returns {{ action: string, reason: string, notes: string[], question?: { prompt: string, choices: string[], defaultIndex: number } }}
 */
export function planLocalSync(state) {
  const {
    sync = true,
    hasUpstream = true,
    behind = 0,
    ahead = 0,
    trackedChanges = [],
    untrackedFiles = [],
    explicitRef = false,
    refDiffersFromCurrent = false,
    interactive = false,
  } = state;

  const notes = [];
  if (trackedChanges.length > 0) {
    notes.push(
      `${trackedChanges.length} file(s) have uncommitted changes${trackedChanges.length <= 3 ? `: ${trackedChanges.join(', ')}` : ''}`,
    );
  }
  if (untrackedFiles.length > 0) {
    notes.push(`${untrackedFiles.length} untracked file(s) — they stay exactly where they are`);
  }
  if (ahead > 0) {
    notes.push(`${ahead} local commit(s) are not on GitHub yet — a build here includes them, a cloud build would not`);
  }

  if (!sync) {
    return { action: 'skip', reason: '--no-sync: building exactly what is checked out', notes };
  }

  const wantsAnotherRef = explicitRef && refDiffersFromCurrent;
  const nothingToFetch = behind === 0 && !wantsAnotherRef;

  if (nothingToFetch) {
    if (!hasUpstream && !explicitRef) {
      notes.push('this branch has no counterpart on GitHub, so there is nothing to pull');
    }
    return {
      action: 'up-to-date',
      reason: trackedChanges.length > 0
        ? 'already level with GitHub — your uncommitted changes go into the build as they are'
        : 'already level with GitHub',
      notes,
    };
  }

  if (trackedChanges.length > 0) {
    const what = wantsAnotherRef ? `switch to the ref you asked for` : `fast-forward ${behind} commit(s)`;
    return {
      action: interactive ? 'ask-dirty' : 'blocked-dirty',
      reason: `committing or stashing is your call, not the tool's: ${what} would move the tree you are editing`,
      notes,
      question: interactive
        ? {
            prompt: `You have uncommitted changes, and GitHub has ${behind} commit(s) this checkout does not. What should the build use?`,
            choices: [
              'Build what is checked out right now, changes and all (nothing is pulled)',
              'Stop here so I can commit or stash first',
            ],
            defaultIndex: 0,
          }
        : undefined,
    };
  }

  if (wantsAnotherRef) {
    return {
      action: 'checkout-and-sync',
      reason: `--ref was given and the tree is clean, so checking it out is what you asked for`,
      notes,
    };
  }

  if (!hasUpstream) {
    notes.push(`GitHub has no branch by this name to pull from`);
    return { action: 'use-current', reason: 'building the branch as it stands', notes };
  }

  return {
    action: 'fast-forward',
    reason: `tree is clean and GitHub is ${behind} commit(s) ahead — fast-forwarding cannot lose anything`,
    notes,
  };
}

/**
 * Work out whether a **cloud** build would build the code the developer means.
 *
 * GitHub's runner checks the repository out fresh, so the only thing that
 * matters is what has been pushed. The failure this guards against is the
 * expensive one: a ten-minute build that succeeds and produces an exe missing
 * the work sitting unpushed on the laptop.
 *
 * @param {TreeState & { interactive?: boolean, assumeYes?: boolean, explicitRef?: boolean, defaultBranch?: string | null, currentBranch?: string | null }} state
 * @returns {{ action: string, reason: string, notes: string[], question?: { prompt: string, choices: string[], defaultIndex: number } }}
 */
export function planRemoteSource(state) {
  const {
    ahead = 0,
    behind = 0,
    trackedChanges = [],
    untrackedFiles = [],
    interactive = false,
    explicitRef = false,
    currentBranch = null,
    defaultBranch = null,
  } = state;

  const notes = [];
  if (trackedChanges.length > 0) {
    notes.push(
      `${trackedChanges.length} uncommitted change(s) are NOT part of a cloud build — GitHub only sees what has been pushed`,
    );
  } else if (untrackedFiles.length > 0) {
    notes.push(
      `${untrackedFiles.length} untracked file(s) are NOT part of a cloud build — GitHub only sees what has been pushed`,
    );
  }
  if (behind > 0) {
    notes.push(`this checkout is ${behind} commit(s) behind GitHub; the cloud build uses the newer code`);
  }
  if (explicitRef && currentBranch && defaultBranch && currentBranch !== defaultBranch) {
    notes.push(`building ${currentBranch} on GitHub, not the default branch`);
  }

  if (ahead === 0) {
    return { action: 'ready', reason: 'everything here is already on GitHub', notes };
  }

  return {
    action: interactive ? 'ask-unpushed' : 'blocked-unpushed',
    reason: `${ahead} local commit(s) have not been pushed, so a cloud build would not contain them`,
    notes,
    question: interactive
      ? {
          prompt: `${ahead} of your commits are not on GitHub yet. A cloud build would not include them. What now?`,
          choices: [
            `Push ${currentBranch ?? 'this branch'} to GitHub first, then build that`,
            'Build anyway — I know those commits will be missing',
            'Build on this computer instead (uses the code as it is here)',
            'Stop and let me sort it out',
          ],
          defaultIndex: 0,
        }
      : undefined,
  };
}

// ---------------------------------------------------------------------------
// artifacts
// ---------------------------------------------------------------------------

/**
 * The exe filenames electron-builder will produce, straight from the
 * `artifactName` patterns in `electron/builder.config.js`.
 *
 * Kept as a function of (version, targets) because three places have to agree
 * on these names — the packager, the release workflow's upload globs and this
 * tool — and a silent mismatch reads as "the build succeeded but where is my
 * exe?".
 *
 * @param {string} version
 * @param {'both' | 'installer' | 'portable'} targets
 * @returns {string[]}
 */
export function artifactNames(version, targets = 'both') {
  const names = [];
  if (targets !== 'portable') names.push(`DOR101 Setup ${version}.exe`);
  if (targets !== 'installer') names.push(`DOR101-Portable-${version}.exe`);
  return names;
}

/** The `target` choice accepted by the Release workflow's `workflow_dispatch`. */
export function workflowTargetChoice(targets) {
  return targets === 'installer' || targets === 'portable' ? targets : 'both';
}

/**
 * Build the `gh api` argument list that dispatches the Release workflow.
 *
 * Uses the REST endpoint rather than `gh workflow run` for one reason: the
 * endpoint takes typed inputs, so `publish_release` arrives as a real boolean
 * instead of the string `"false"`, which a GitHub Actions boolean input treats
 * as true.
 *
 * @param {{ ref: string, targets?: 'both' | 'installer' | 'portable', publish?: boolean, slug?: string, workflowFile?: string }} input
 * @returns {string[]}
 */
export function dispatchArgs(input) {
  const {
    ref,
    targets = 'both',
    publish = false,
    slug = REPO.slug,
    workflowFile = WORKFLOW_FILE,
  } = input;

  return [
    'api',
    `repos/${slug}/actions/workflows/${workflowFile}/dispatches`,
    '-X',
    'POST',
    '-f',
    `ref=${ref}`,
    '-F',
    `target=${workflowTargetChoice(targets)}`,
    '-F',
    `publish_release=${publish ? 'true' : 'false'}`,
  ];
}

/**
 * Find the run our dispatch created.
 *
 * `workflow_dispatch` returns no run id, so the run has to be identified after
 * the fact. Matching on "newest workflow_dispatch run for this branch" alone
 * would happily pick up a run somebody started a minute earlier — including a
 * still-running one — and this tool would then download the wrong exe. So the
 * caller records the ids that already existed before dispatching and passes
 * them in to be excluded. Ids are monotonic, so they are a safer ordering than
 * `created_at`, which is a timestamp from a different clock.
 *
 * @param {Array<{ id: number, event?: string, head_branch?: string, created_at?: string }>} runs
 * @param {{ ref: string, excludeIds?: Iterable<number>, event?: string }} options
 * @returns {{ id: number, event: string, head_branch: string, created_at: string } | null}
 */
export function pickWorkflowRun(runs, options) {
  const { ref, excludeIds = [], event = 'workflow_dispatch' } = options;
  const excluded = new Set(excludeIds);

  const candidates = (runs ?? [])
    .filter((run) => run && typeof run.id === 'number')
    .filter((run) => run.event === event)
    .filter((run) => run.head_branch === ref)
    .filter((run) => !excluded.has(run.id))
    .sort((a, b) => b.id - a.id);

  return candidates[0] ?? null;
}

/**
 * Turn a run's status/conclusion into one line of English.
 *
 * @param {{ status?: string, conclusion?: string | null }} run
 * @returns {{ text: string, done: boolean, ok: boolean }}
 */
export function describeRun(run) {
  const status = run?.status ?? 'unknown';

  if (status !== 'completed') {
    const label = status === 'in_progress' ? 'building' : status === 'queued' ? 'waiting for a runner' : status;
    return { text: label, done: false, ok: false };
  }

  const conclusion = run?.conclusion ?? 'unknown';
  const ok = conclusion === 'success';
  const label = ok
    ? 'finished'
    : conclusion === 'cancelled'
      ? 'was cancelled'
      : conclusion === 'timed_out'
        ? 'timed out'
        : `failed (${conclusion})`;
  return { text: label, done: true, ok };
}

/**
 * Name the jobs/steps that failed, for the message a developer actually reads.
 *
 * The Release workflow marks the verification step `continue-on-error`, so a
 * run can be green with a failed verification inside it; that case is handled
 * by reading `verify-desktop.log` out of the artifact, not here.
 *
 * @param {Array<{ name?: string, conclusion?: string | null, steps?: Array<{ name?: string, conclusion?: string | null }> }>} jobs
 * @returns {string[]}
 */
export function failedSteps(jobs) {
  const out = [];
  for (const job of jobs ?? []) {
    if (job?.conclusion !== 'failure' && job?.conclusion !== 'timed_out') continue;
    const failed = (job.steps ?? []).filter((step) => step.conclusion === 'failure' || step.conclusion === 'timed_out');
    if (failed.length === 0) {
      out.push(job.name ?? 'an unnamed job');
      continue;
    }
    for (const step of failed) out.push(`${job.name ?? 'job'} → ${step.name ?? 'an unnamed step'}`);
  }
  return out;
}

// ---------------------------------------------------------------------------
// the verifier's log
// ---------------------------------------------------------------------------

/**
 * Decode a log file that may not be UTF-8.
 *
 * `verify-desktop.log` is written by `Tee-Object` inside a Windows runner.
 * PowerShell 7 writes UTF-8, but Windows PowerShell 5.1 writes UTF-16LE, and a
 * UTF-16 file read as UTF-8 is a wall of NUL bytes — which would make the tool
 * report "could not tell whether verification passed" on an otherwise good
 * build. Detecting it costs three lines.
 *
 * @param {Buffer | Uint8Array} bytes
 * @returns {string}
 */
export function decodeLog(bytes) {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes ?? []);

  if (view[0] === 0xff && view[1] === 0xfe) {
    return new TextDecoder('utf-16le').decode(view.subarray(2));
  }
  if (view[0] === 0xfe && view[1] === 0xff) {
    // Big-endian UTF-16: swap, then reuse the little-endian decoder.
    const swapped = new Uint8Array(view.subarray(2));
    for (let i = 0; i + 1 < swapped.length; i += 2) {
      const tmp = swapped[i];
      swapped[i] = swapped[i + 1];
      swapped[i + 1] = tmp;
    }
    return new TextDecoder('utf-16le').decode(swapped);
  }
  if (view[0] === 0xef && view[1] === 0xbb && view[2] === 0xbf) {
    return new TextDecoder('utf-8').decode(view.subarray(3));
  }

  // No BOM: interleaved NULs are the fingerprint of UTF-16 text.
  const sample = view.subarray(0, Math.min(view.length, 512));
  let nulls = 0;
  for (const byte of sample) if (byte === 0) nulls += 1;
  if (sample.length > 8 && nulls > sample.length * 0.2) {
    return new TextDecoder('utf-16le').decode(view);
  }

  return new TextDecoder('utf-8').decode(view);
}

/**
 * Read the packaged-app check's verdict out of its log.
 *
 * The patterns here mirror the exact lines `scripts/verify-desktop-package.mjs`
 * prints. Matching the sentences rather than the ✔/✖ glyphs matters: a log that
 * travelled through a Windows runner and a PowerShell `Tee-Object` can arrive
 * with the glyphs mangled, and a mangled glyph must not be able to flip a
 * failed verification into a pass.
 *
 * Returns `ok: null` when the log does not say either way — an empty or
 * truncated file must not be reported as a pass, and must not be reported as a
 * failure that scares somebody away from a good build.
 *
 * @param {string} logText
 * @returns {{ ok: boolean | null, probed: string | null, failures: string[], reason: string }}
 */
export function interpretVerifyLog(logText) {
  const text = typeof logText === 'string' ? logText : '';
  const failures = [];

  const probedMatch = text.match(/\((\d+)\/(\d+) probed OK\)/);
  const probed = probedMatch ? `${probedMatch[1]}/${probedMatch[2]}` : null;

  const booted = /The packaged app boots and serves every required route/.test(text);
  const structuralFailed = text.match(/(\d+) structural check\(s\) failed/);
  const neverStarted = /next start.{0,4} did not come up/.test(text);
  const requiredFailed = text.match(/(\d+) required route\(s\) failed inside the package/);
  // The verifier fails the run on a version mismatch even when every route
  // answered, so this is a verdict of its own, not a detail.
  const versionMismatch = text.match(/server reports version (\S+) — package\.json says (\S+)/);

  // Per-route lines read `✖ 500 /api/news — …`; the summary block indents its
  // own list as `    /api/news → 500 …`. Collect both, dedupe by path.
  for (const line of text.split('\n')) {
    const route = line.match(/(\d{3})\s+(\/\S+)/) ?? line.match(/(\/\S+)\s+→\s+(\d{3})/);
    if (!route) continue;
    const failed = line.includes('✖') || line.includes('→');
    if (!failed) continue;
    const [status, routePath] = route[1].startsWith('/') ? [route[2], route[1]] : [route[1], route[2]];
    const entry = `${status} ${routePath}`;
    if (!failures.includes(entry)) failures.push(entry);
  }

  if (structuralFailed) {
    return {
      ok: false,
      probed,
      failures,
      reason: `${structuralFailed[1]} structural check(s) failed — the packaged app would not start`,
    };
  }
  if (neverStarted) {
    return { ok: false, probed, failures, reason: 'the packaged app never started its server' };
  }
  if (requiredFailed && Number(requiredFailed[1]) > 0) {
    return {
      ok: false,
      probed,
      failures,
      reason: `${requiredFailed[1]} required route(s) failed inside the package`,
    };
  }
  if (versionMismatch && !booted) {
    return {
      ok: false,
      probed,
      failures,
      reason: `the packaged app reports version ${versionMismatch[1]} but package.json says ${versionMismatch[2]} — the exe is not the build you think it is`,
    };
  }
  if (booted) {
    return {
      ok: true,
      probed,
      failures,
      reason: `the packaged app booted and served every required route${probed ? ` (${probed} probed OK)` : ''}`,
    };
  }

  return {
    ok: null,
    probed,
    failures,
    reason: text.trim() === ''
      ? 'the verification log is empty'
      : 'the verification log has no verdict line — it may have been cut short',
  };
}

// ---------------------------------------------------------------------------
// publishing
// ---------------------------------------------------------------------------

/**
 * Decide whether and how to publish.
 *
 * Publishing is the one irreversible thing this tool does, so the bar is
 * explicit: `gh` installed and signed in, files that exist on disk, and a
 * decision that came from the developer (`--publish`) or from answering the
 * prompt. `--yes` deliberately does NOT count — "accept the defaults" must
 * never mean "put a release on the internet".
 *
 * @param {{ version: string, files: string[], ghAvailable?: boolean, ghAuthenticated?: boolean, releaseExists?: boolean, confirmed?: boolean, explicitPublish?: boolean, tag?: string }} input
 * @returns {{ action: 'create' | 'upload' | 'skip' | 'blocked', tag: string, reason: string, files: string[] }}
 */
export function planPublish(input) {
  const {
    version,
    files = [],
    ghAvailable = false,
    ghAuthenticated = false,
    releaseExists = false,
    confirmed = false,
    explicitPublish = false,
    tag = `v${version}`,
  } = input;

  if (!(confirmed || explicitPublish)) {
    return { action: 'skip', tag, reason: 'publishing was not requested', files };
  }
  if (!ghAvailable) {
    return {
      action: 'blocked',
      tag,
      reason: 'the GitHub CLI (gh) is not installed, and it is what creates the release',
      files,
    };
  }
  if (!ghAuthenticated) {
    return { action: 'blocked', tag, reason: 'gh is not signed in — run `gh auth login`', files };
  }
  if (files.length === 0) {
    return { action: 'blocked', tag, reason: 'no exe files were found to upload', files };
  }

  return {
    action: releaseExists ? 'upload' : 'create',
    tag,
    reason: releaseExists
      ? `${tag} already exists on GitHub — adding these files to it`
      : `${tag} does not exist yet — it will be created from the branch that was built`,
    files,
  };
}

/**
 * `gh` arguments that create the release with its notes and files.
 *
 * @param {{ tag: string, title: string, files: string[], notesFile?: string | null, slug?: string }} input
 * @returns {string[]}
 */
export function releaseCreateArgs(input) {
  const { tag, title, files, notesFile = null, slug = REPO.slug } = input;
  const args = ['release', 'create', tag, '--repo', slug, '--title', title];
  if (notesFile) args.push('--notes-file', notesFile);
  else args.push('--generate-notes');
  args.push(...files);
  return args;
}

/**
 * `gh` arguments that add files to a release that already exists.
 *
 * `--clobber` because re-uploading the same version after a fixed build is the
 * normal case here, and without it `gh` refuses and the developer is left
 * deleting assets by hand in a browser.
 *
 * @param {{ tag: string, files: string[], slug?: string }} input
 * @returns {string[]}
 */
export function releaseUploadArgs(input) {
  const { tag, files, slug = REPO.slug } = input;
  return ['release', 'upload', tag, ...files, '--repo', slug, '--clobber'];
}

// ---------------------------------------------------------------------------
// small formatting helpers, shared so the CLI stays readable
// ---------------------------------------------------------------------------

/**
 * @param {number} ms
 * @returns {string} e.g. `"9s"`, `"4m05s"`, `"1h02m"`
 */
export function humanDuration(ms) {
  const total = Math.max(0, Math.round((ms ?? 0) / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  if (hours > 0) return `${hours}h${String(minutes).padStart(2, '0')}m`;
  if (minutes > 0) return `${minutes}m${String(seconds).padStart(2, '0')}s`;
  return `${seconds}s`;
}

/** @param {number} bytes */
export function humanSize(bytes) {
  if (!Number.isFinite(bytes) || bytes < 1024) return `${bytes ?? 0} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(1)} ${units[unit]}`;
}

/**
 * Which local requirements a mode needs, for the preflight report.
 *
 * @param {'remote' | 'local'} mode
 * @param {{ nodeOk?: boolean, ghAvailable?: boolean, ghAuthenticated?: boolean }} tools
 * @returns {{ ready: boolean, missing: string[] }}
 */
export function checkModeRequirements(mode, tools) {
  const { nodeOk = true, ghAvailable = false, ghAuthenticated = false } = tools ?? {};
  const missing = [];

  if (mode === 'remote') {
    if (!ghAvailable) missing.push('the GitHub CLI (gh) — winget install GitHub.cli, or brew install gh');
    else if (!ghAuthenticated) missing.push('a signed-in gh — run: gh auth login');
  } else if (!nodeOk) {
    missing.push('Node.js 22.12+, 24 or 26+ — install it from nodejs.org');
  }

  return { ready: missing.length === 0, missing };
}
