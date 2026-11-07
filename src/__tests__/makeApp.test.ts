/**
 * Tests for the "make the app" tool's decisions.
 *
 * `scripts/make-app.mjs` is the maintainer's one command for turning the
 * website into the Windows app. It is allowed to do three things that matter:
 * move the developer's git tree, spend ten minutes of GitHub's runner time, and
 * publish a release that the website's download button immediately points
 * residents at. Every one of those is decided in `scripts/lib/make-app.mjs`,
 * which is pure, so the decisions can be asserted here rather than discovered
 * later by a lost commit or an exe built from the wrong code.
 *
 * The two invariants these tests exist to keep:
 *
 *   1. The tool never discards work. A dirty tree is asked about interactively
 *      and refused outright when nobody can answer — it is never stashed,
 *      reset or checked out over.
 *   2. Nothing is published without being told to. In particular `--yes`,
 *      which means "stop asking me safe questions", must never mean "put a
 *      release on the internet".
 */
import { describe, expect, it } from 'vitest';

import {
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
} from '../../scripts/lib/make-app.mjs';

describe('parseArgs', () => {
  it('defaults to asking, building both targets, syncing and verifying', () => {
    const { options, errors } = parseArgs([]);
    expect(errors).toEqual([]);
    expect(options.mode).toBe('ask');
    expect(options.targets).toBe('both');
    expect(options.sync).toBe(true);
    expect(options.verify).toBe(true);
    expect(options.publish).toBe('ask');
    expect(options.dryRun).toBe(false);
  });

  it('reads a mode, a ref and a timeout', () => {
    const { options, errors } = parseArgs(['--remote', '--ref', 'v4.9.0', '--timeout', '90']);
    expect(errors).toEqual([]);
    expect(options.mode).toBe('remote');
    expect(options.ref).toBe('v4.9.0');
    expect(options.timeoutMinutes).toBe(90);
  });

  it('accepts --flag=value as well as --flag value', () => {
    expect(parseArgs(['--ref=main']).options.ref).toBe('main');
    expect(parseArgs(['--timeout=15']).options.timeoutMinutes).toBe(15);
    expect(parseArgs(['--repo-dir=/tmp/x']).options.repoDir).toBe('/tmp/x');
  });

  it('rejects a flag whose value is missing or is another flag', () => {
    expect(parseArgs(['--ref']).errors).toHaveLength(1);
    expect(parseArgs(['--ref', '--local']).errors).toHaveLength(1);
  });

  it('rejects contradictory flags instead of silently picking one', () => {
    expect(parseArgs(['--remote', '--local']).errors.join(' ')).toMatch(/contradict/);
    expect(parseArgs(['--installer-only', '--portable-only']).errors.join(' ')).toMatch(/contradict/);
    expect(parseArgs(['--publish', '--no-publish']).errors.join(' ')).toMatch(/contradict/);
  });

  it('rejects --no-sync with --remote, because the flag would silently do nothing', () => {
    // A cloud build compiles what is on GitHub; ignoring the flag would leave
    // the developer believing they had built their local edits.
    const { errors } = parseArgs(['--remote', '--no-sync']);
    expect(errors.join(' ')).toMatch(/no effect/);
  });

  it('names an unknown option and points at --help', () => {
    const { errors } = parseArgs(['--ship-it']);
    expect(errors[0]).toMatch(/Unknown option "--ship-it"/);
    expect(errors[0]).toMatch(/--help/);
  });

  it('rejects a timeout that is not a positive number', () => {
    expect(parseArgs(['--timeout', 'soon']).errors).toHaveLength(1);
    expect(parseArgs(['--timeout', '-5']).errors).toHaveLength(1);
  });
});

describe('parseStatusPorcelain', () => {
  it('separates tracked changes from untracked files', () => {
    const { tracked, untracked } = parseStatusPorcelain(
      [' M README.md', 'M  package.json', 'A  src/new.ts', '?? scratch.txt', '?? dist/'].join('\n'),
    );
    expect(tracked).toEqual(['README.md', 'package.json', 'src/new.ts']);
    expect(untracked).toEqual(['scratch.txt', 'dist/']);
  });

  it('reads the new path of a rename', () => {
    const { tracked } = parseStatusPorcelain('R  old/name.ts -> new/name.ts');
    expect(tracked).toEqual(['new/name.ts']);
  });

  it('ignores blank input', () => {
    expect(parseStatusPorcelain('')).toEqual({ tracked: [], untracked: [] });
    expect(parseStatusPorcelain(undefined)).toEqual({ tracked: [], untracked: [] });
  });
});

describe('parseAheadBehind', () => {
  it('reads left as behind and right as ahead', () => {
    // Called as `rev-list --left-right --count origin/main...HEAD`: left is what
    // GitHub has that this checkout does not, right is the reverse. Getting this
    // backwards inverts every safety check in the tool, so it is pinned here.
    expect(parseAheadBehind('2\t3')).toEqual({ behind: 2, ahead: 3 });
    expect(parseAheadBehind('0\t0')).toEqual({ behind: 0, ahead: 0 });
  });

  it('treats an unreadable answer as no divergence rather than as a big one', () => {
    expect(parseAheadBehind('')).toEqual({ behind: 0, ahead: 0 });
    expect(parseAheadBehind(undefined)).toEqual({ behind: 0, ahead: 0 });
  });
});

describe('resolveTargetRef', () => {
  it('lets an explicit --ref win over everything', () => {
    const target = resolveTargetRef({
      mode: 'local',
      requestedRef: 'v4.9.0',
      currentBranch: 'main',
      defaultBranch: 'main',
    });
    expect(target.ref).toBe('v4.9.0');
    expect(target.explicit).toBe(true);
  });

  it('leaves a local build on the branch the developer is already on', () => {
    // Switching branches unasked is the surprise this tool must not produce.
    const target = resolveTargetRef({ mode: 'local', currentBranch: 'feature-x', defaultBranch: 'main' });
    expect(target.ref).toBe('feature-x');
    expect(target.explicit).toBe(false);
  });

  it('falls back to the default branch for a cloud build of a branch GitHub has never seen', () => {
    // Dispatching a workflow against a ref that does not exist fails with
    // "No ref found" four minutes later; falling back and saying so is cheaper.
    const target = resolveTargetRef({
      mode: 'remote',
      currentBranch: 'only-on-my-laptop',
      currentBranchOnRemote: false,
      defaultBranch: 'main',
    });
    expect(target.ref).toBe('main');
    expect(target.note).toMatch(/only exists on this computer/);
  });

  it('builds a pushed branch in the cloud, since that is what the developer means', () => {
    const target = resolveTargetRef({
      mode: 'remote',
      currentBranch: 'feature-x',
      currentBranchOnRemote: true,
      defaultBranch: 'main',
    });
    expect(target.ref).toBe('feature-x');
    expect(target.note).toBeNull();
  });

  it('keeps a detached HEAD for a local build — usually a deliberate rebuild of an old tag', () => {
    const target = resolveTargetRef({ mode: 'local', currentBranch: null, shortSha: '082abf3', defaultBranch: 'main' });
    expect(target.ref).toBe('082abf3');
    expect(target.detached).toBe(true);
    expect(target.note).toMatch(/--ref main/);
  });
});

describe('planLocalSync', () => {
  it('fast-forwards a clean branch that GitHub is ahead of', () => {
    const plan = planLocalSync({ behind: 3, trackedChanges: [] });
    expect(plan.action).toBe('fast-forward');
    expect(plan.reason).toMatch(/cannot lose anything/);
  });

  it('never touches a dirty tree: it asks when somebody can answer', () => {
    const plan = planLocalSync({ behind: 3, trackedChanges: ['src/app/page.tsx'], interactive: true });
    expect(plan.action).toBe('ask-dirty');
    expect(plan.question.choices[0]).toMatch(/Build what is checked out right now/);
    expect(plan.question.choices[1]).toMatch(/Stop here/);
  });

  it('and refuses when nobody can answer, rather than picking a default that moves the tree', () => {
    const plan = planLocalSync({ behind: 3, trackedChanges: ['src/app/page.tsx'], interactive: false });
    expect(plan.action).toBe('blocked-dirty');
  });

  it('leaves an already-level tree alone, and says the build includes uncommitted changes', () => {
    const plan = planLocalSync({ behind: 0, trackedChanges: ['README.md'] });
    expect(plan.action).toBe('up-to-date');
    expect(plan.reason).toMatch(/uncommitted changes go into the build/);
  });

  it('checks out an explicitly requested ref only because the tree is clean', () => {
    const plan = planLocalSync({ behind: 0, trackedChanges: [], explicitRef: true, refDiffersFromCurrent: true });
    expect(plan.action).toBe('checkout-and-sync');
  });

  it('honours --no-sync by building exactly what is on disk', () => {
    const plan = planLocalSync({ sync: false, behind: 9, trackedChanges: ['a.ts'] });
    expect(plan.action).toBe('skip');
  });

  it('warns that unpushed commits will be in a local build but not a cloud one', () => {
    const plan = planLocalSync({ behind: 0, ahead: 2 });
    expect(plan.notes.join(' ')).toMatch(/2 local commit\(s\) are not on GitHub/);
  });

  it('reports a branch GitHub does not have instead of inventing something to pull', () => {
    const plan = planLocalSync({ behind: 0, hasUpstream: false });
    expect(plan.action).toBe('up-to-date');
    expect(plan.notes.join(' ')).toMatch(/no counterpart on GitHub/);
  });

  it('treats untracked files as noise: they neither block nor get removed', () => {
    const plan = planLocalSync({ behind: 2, trackedChanges: [], untrackedFiles: ['scratch.txt'] });
    expect(plan.action).toBe('fast-forward');
    expect(plan.notes.join(' ')).toMatch(/stay exactly where they are/);
  });
});

describe('planRemoteSource', () => {
  it('is ready when everything here is already on GitHub', () => {
    expect(planRemoteSource({ ahead: 0, behind: 0 }).action).toBe('ready');
  });

  it('stops a non-interactive cloud build that would miss unpushed commits', () => {
    // The expensive failure: a green ten-minute run that produced an exe without
    // the fix the developer just made.
    const plan = planRemoteSource({ ahead: 2, interactive: false, currentBranch: 'main' });
    expect(plan.action).toBe('blocked-unpushed');
    expect(plan.reason).toMatch(/would not contain them/);
  });

  it('offers to push, build anyway, build locally, or stop — when somebody can choose', () => {
    const plan = planRemoteSource({ ahead: 2, interactive: true, currentBranch: 'main' });
    expect(plan.action).toBe('ask-unpushed');
    expect(plan.question.choices).toHaveLength(4);
    expect(plan.question.choices[0]).toMatch(/Push main to GitHub first/);
    expect(plan.question.defaultIndex).toBe(0);
  });

  it('says plainly that uncommitted changes cannot be in a cloud build', () => {
    const plan = planRemoteSource({ ahead: 0, trackedChanges: ['src/app/page.tsx'] });
    expect(plan.notes.join(' ')).toMatch(/NOT part of a cloud build/);
  });

  it('distinguishes untracked files from edits, so the count is believable', () => {
    const untrackedOnly = planRemoteSource({ ahead: 0, untrackedFiles: ['a.txt', 'b.txt'] });
    expect(untrackedOnly.notes.join(' ')).toMatch(/2 untracked file\(s\)/);
    const edited = planRemoteSource({ ahead: 0, trackedChanges: ['a.ts'], untrackedFiles: ['b.txt'] });
    expect(edited.notes.join(' ')).toMatch(/1 uncommitted change\(s\)/);
  });
});

describe('artifactNames', () => {
  it('matches the artifactName patterns in electron/builder.config.js', () => {
    // Three places have to agree on these strings — the packager, the release
    // workflow's upload globs and this tool. A drift reads as "the build
    // succeeded, so where is my exe?".
    expect(artifactNames('4.9.1', 'both')).toEqual([
      'DOR101 Setup 4.9.1.exe',
      'DOR101-Portable-4.9.1.exe',
    ]);
    expect(artifactNames('4.9.1', 'installer')).toEqual(['DOR101 Setup 4.9.1.exe']);
    expect(artifactNames('4.9.1', 'portable')).toEqual(['DOR101-Portable-4.9.1.exe']);
  });

  it('maps targets onto the workflow choice input', () => {
    expect(workflowTargetChoice('both')).toBe('both');
    expect(workflowTargetChoice('installer')).toBe('installer');
    expect(workflowTargetChoice('portable')).toBe('portable');
  });
});

describe('dispatchArgs', () => {
  it('POSTs, and sends publish_release as a real boolean', () => {
    const args = dispatchArgs({ ref: 'main', targets: 'portable', publish: false });
    expect(args).toContain('POST');
    expect(args.slice(0, 2)).toEqual(['api', 'repos/Nikoxkx/Dorchester-101/actions/workflows/release.yml/dispatches']);
    // `-f` sends strings; a GitHub Actions boolean input reads the string
    // "false" as true, which would publish a release nobody asked for.
    const index = args.indexOf('publish_release=false');
    expect(args[index - 1]).toBe('-F');
    expect(args).toContain('ref=main');
    expect(args).toContain('target=portable');
  });
});

describe('pickWorkflowRun', () => {
  const runs = [
    { id: 100, event: 'workflow_dispatch', head_branch: 'main', created_at: '2026-11-01T10:00:00Z' },
    { id: 101, event: 'push', head_branch: 'main', created_at: '2026-11-01T10:05:00Z' },
    { id: 102, event: 'workflow_dispatch', head_branch: 'other', created_at: '2026-11-01T10:06:00Z' },
    { id: 103, event: 'workflow_dispatch', head_branch: 'main', created_at: '2026-11-01T10:07:00Z' },
  ];

  it('picks the newest dispatch on the right branch', () => {
    expect(pickWorkflowRun(runs, { ref: 'main' })?.id).toBe(103);
  });

  it('ignores tag pushes and other branches', () => {
    expect(pickWorkflowRun(runs, { ref: 'main', excludeIds: [103] })?.id).toBe(100);
    expect(pickWorkflowRun(runs, { ref: 'nope' })).toBeNull();
  });

  it('skips the runs that already existed before we dispatched', () => {
    // Without this the tool can attach itself to somebody else's in-flight run
    // and download that run's exe, believing it is the one it asked for.
    expect(pickWorkflowRun(runs, { ref: 'main', excludeIds: [100, 103] })).toBeNull();
  });

  it('orders by id, not by timestamp, because ids are monotonic and clocks are not', () => {
    const skewed = [
      { id: 200, event: 'workflow_dispatch', head_branch: 'main', created_at: '2026-01-01T00:00:00Z' },
      { id: 199, event: 'workflow_dispatch', head_branch: 'main', created_at: '2026-12-31T23:59:59Z' },
    ];
    expect(pickWorkflowRun(skewed, { ref: 'main' })?.id).toBe(200);
  });

  it('survives an empty or malformed answer', () => {
    expect(pickWorkflowRun([], { ref: 'main' })).toBeNull();
    expect(pickWorkflowRun(undefined, { ref: 'main' })).toBeNull();
    expect(pickWorkflowRun([{ event: 'workflow_dispatch' }], { ref: 'main' })).toBeNull();
  });
});

describe('describeRun', () => {
  it('says what a running build is doing', () => {
    expect(describeRun({ status: 'queued' })).toEqual({ text: 'waiting for a runner', done: false, ok: false });
    expect(describeRun({ status: 'in_progress' }).text).toBe('building');
  });

  it('reports a finished build', () => {
    expect(describeRun({ status: 'completed', conclusion: 'success' })).toEqual({ text: 'finished', done: true, ok: true });
    expect(describeRun({ status: 'completed', conclusion: 'failure' }).ok).toBe(false);
    expect(describeRun({ status: 'completed', conclusion: 'cancelled' }).text).toBe('was cancelled');
  });

  it('never calls an unfinished run finished', () => {
    expect(describeRun({ status: 'unknown' }).done).toBe(false);
    expect(describeRun(undefined).done).toBe(false);
  });
});

describe('failedSteps', () => {
  it('names the job and step that failed, in the shape the API returns', () => {
    // This is the real answer for a run of this repository that failed.
    const jobs = [
      {
        name: 'release',
        conclusion: 'failure',
        steps: [
          { name: 'Build the website and package it', conclusion: 'success' },
          { name: 'Run npm run verify:desktop', conclusion: 'failure' },
        ],
      },
    ];
    expect(failedSteps(jobs)).toEqual(['release → Run npm run verify:desktop']);
  });

  it('ignores a tolerated failure inside a green job', () => {
    // The workflow marks verification `continue-on-error`, so a run can be
    // successful with a failed step inside it. That case is reported by reading
    // verify-desktop.log, not by failing the build here.
    const jobs = [{ name: 'release', conclusion: 'success', steps: [{ name: 'verify', conclusion: 'failure' }] }];
    expect(failedSteps(jobs)).toEqual([]);
  });

  it('still names a job that failed without a failing step', () => {
    expect(failedSteps([{ name: 'release', conclusion: 'failure', steps: [] }])).toEqual(['release']);
    expect(failedSteps(undefined)).toEqual([]);
  });
});

describe('decodeLog', () => {
  const text = '✔ 200 /api/health\n';

  it('passes UTF-8 through', () => {
    expect(decodeLog(Buffer.from(text, 'utf8'))).toBe(text);
  });

  it('decodes UTF-16LE with a BOM', () => {
    expect(decodeLog(Buffer.from(`\ufeff${text}`, 'utf16le'))).toBe(text);
  });

  it('decodes UTF-16LE without a BOM, which is what a mangled Tee-Object leaves', () => {
    // Windows PowerShell 5.1 writes the verification log as UTF-16. Read as
    // UTF-8 it is a wall of NULs, and the verdict silently becomes "unknown".
    const utf16 = Buffer.from(text, 'utf16le');
    expect(utf16.includes(0)).toBe(true);
    expect(decodeLog(utf16)).toBe(text);
  });

  it('strips a UTF-8 BOM', () => {
    expect(decodeLog(Buffer.from(`\ufeff${text}`, 'utf8'))).toBe(text);
  });

  it('survives an empty file', () => {
    expect(decodeLog(Buffer.alloc(0))).toBe('');
  });
});

describe('interpretVerifyLog', () => {
  const passing = [
    'DOR101 desktop package check',
    '  ✔ server answered on http://127.0.0.1:41873 in 506 ms',
    '  ✔ 200 /',
    '  ✔ 200 /api/health',
    '  ✔ server reports version 4.9.1 — package.json says 4.9.1',
    '✔ The packaged app boots and serves every required route (12/12 probed OK).',
  ].join('\n');

  it('reads a pass, and the probe count with it', () => {
    const result = interpretVerifyLog(passing);
    expect(result.ok).toBe(true);
    expect(result.probed).toBe('12/12');
    expect(result.reason).toMatch(/every required route/);
  });

  it('reads a required-route failure and lists the routes', () => {
    const result = interpretVerifyLog(
      ['  ✖ 500 /api/resources — unexpected status', '✖ 1 required route(s) failed inside the package:'].join('\n'),
    );
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/1 required route\(s\) failed/);
    expect(result.failures).toContain('500 /api/resources');
  });

  it('reads a structural failure, which means the app would not start at all', () => {
    const result = interpretVerifyLog('✖ 2 structural check(s) failed — the packaged app would not start.');
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/structural/);
  });

  it('reads a server that never bound — in the exe that is a window that never loads', () => {
    const result = interpretVerifyLog('  ✖ `next start` did not come up: no answer within 30s');
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/never started its server/);
  });

  it('fails on a version mismatch even when every route answered', () => {
    const result = interpretVerifyLog('  ✖ server reports version 4.9.0 — package.json says 4.9.1');
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/4\.9\.0/);
  });

  it('says "unknown" rather than guessing when the log has no verdict', () => {
    // An empty or truncated log must not be reported as a pass — that is how a
    // blank-window exe reaches residents — and not as a failure either.
    expect(interpretVerifyLog('').ok).toBeNull();
    expect(interpretVerifyLog('DOR101 desktop package check\n').ok).toBeNull();
    expect(interpretVerifyLog(undefined).ok).toBeNull();
  });

  it('does not let a mangled glyph flip the verdict', () => {
    // The sentences are matched, not the ✔/✖ characters, because a log that
    // travelled through a Windows runner can arrive with them corrupted.
    const noGlyphs = passing.replace(/[✔✖]/g, '?');
    expect(interpretVerifyLog(noGlyphs).ok).toBe(true);
  });

  it('ignores routes that only failed because the runner had no network', () => {
    const result = interpretVerifyLog(
      [passing, '  · 0   /api/news — fetch failed (needs network).'].join('\n'),
    );
    expect(result.ok).toBe(true);
    expect(result.failures).toEqual([]);
  });
});

describe('planPublish', () => {
  const files = ['dist-electron/DOR101 Setup 4.9.1.exe'];
  const ready = { ghAvailable: true, ghAuthenticated: true };

  it('does nothing when publishing was not asked for', () => {
    expect(planPublish({ version: '4.9.1', files, ...ready }).action).toBe('skip');
  });

  it('does not treat --yes as permission to publish', () => {
    // "--yes" means stop asking me safe questions. A release is not safe: the
    // website's download button points residents at the newest one immediately.
    const plan = planPublish({ version: '4.9.1', files, ...ready, confirmed: false, explicitPublish: false });
    expect(plan.action).toBe('skip');
  });

  it('creates a release that does not exist yet', () => {
    const plan = planPublish({ version: '4.9.1', files, ...ready, confirmed: true, releaseExists: false });
    expect(plan.action).toBe('create');
    expect(plan.tag).toBe('v4.9.1');
  });

  it('adds to a release that already exists instead of failing on the duplicate tag', () => {
    const plan = planPublish({ version: '4.9.1', files, ...ready, confirmed: true, releaseExists: true });
    expect(plan.action).toBe('upload');
    expect(plan.reason).toMatch(/already exists/);
  });

  it('blocks with a reason when gh is missing or not signed in', () => {
    expect(planPublish({ version: '4.9.1', files, confirmed: true, ghAvailable: false }).reason).toMatch(/not installed/);
    expect(
      planPublish({ version: '4.9.1', files, confirmed: true, ghAvailable: true, ghAuthenticated: false }).reason,
    ).toMatch(/gh auth login/);
  });

  it('blocks rather than creating an empty release', () => {
    const plan = planPublish({ version: '4.9.1', files: [], ...ready, confirmed: true });
    expect(plan.action).toBe('blocked');
    expect(plan.reason).toMatch(/no exe files/);
  });
});

describe('release arguments', () => {
  it('creates with the drafted notes when there are any', () => {
    const args = releaseCreateArgs({
      tag: 'v4.9.1',
      title: 'DOR101 v4.9.1',
      files: ['a.exe', 'b.exe'],
      notesFile: 'release/v4.9.1/RELEASE.md',
    });
    expect(args).toContain('--notes-file');
    expect(args).not.toContain('--generate-notes');
    expect(args.slice(-2)).toEqual(['a.exe', 'b.exe']);
  });

  it('falls back to generated notes when there is no RELEASE.md', () => {
    const args = releaseCreateArgs({ tag: 'v4.9.1', title: 'DOR101 v4.9.1', files: ['a.exe'], notesFile: null });
    expect(args).toContain('--generate-notes');
  });

  it('clobbers on upload, because rebuilding the same version is the normal case here', () => {
    const args = releaseUploadArgs({ tag: 'v4.9.1', files: ['a.exe'] });
    expect(args).toContain('--clobber');
    expect(args.slice(0, 3)).toEqual(['release', 'upload', 'v4.9.1']);
  });
});

describe('checkModeRequirements', () => {
  it('says a cloud build needs a signed-in gh and nothing else', () => {
    expect(checkModeRequirements('remote', { ghAvailable: true, ghAuthenticated: true }).ready).toBe(true);
    expect(checkModeRequirements('remote', { ghAvailable: true, ghAuthenticated: false }).ready).toBe(false);
    expect(checkModeRequirements('remote', { ghAvailable: false }).missing.join(' ')).toMatch(/GitHub CLI/);
  });

  it('says a local build needs a supported Node', () => {
    expect(checkModeRequirements('local', { nodeOk: true }).ready).toBe(true);
    expect(checkModeRequirements('local', { nodeOk: false }).missing.join(' ')).toMatch(/Node\.js/);
  });
});

describe('formatting', () => {
  it('keeps a duration short enough for the one-line run update', () => {
    expect(humanDuration(9_000)).toBe('9s');
    expect(humanDuration(125_000)).toBe('2m05s');
    expect(humanDuration(3_720_000)).toBe('1h02m');
    expect(humanDuration(-5)).toBe('0s');
  });

  it('formats a size the way the rest of the build scripts do', () => {
    expect(humanSize(512)).toBe('512 B');
    expect(humanSize(188_743_680)).toBe('180.0 MB');
  });
});
