#!/usr/bin/env node
/**
 * Build the DOR101 Windows desktop app — the manual, one-command path.
 *
 *   npm run build:exe              installer + portable for the current version
 *   npm run build:portable         portable only
 *   node scripts/build-exe.mjs --help
 *
 * What it does, in order:
 *
 *   1. preflight   — Node version, required files, version + git sha banner
 *   2. deps        — `npm ci` when node_modules is missing
 *   3. website     — `next build` (this is what makes the exe the *current*
 *                    website) and a check that the build id matches the tree
 *   4. package     — electron-builder → dist-electron/*.exe
 *   5. verify      — the .exe files exist, sizes and SHA-256 written out
 *   6. release     — copies artifacts to release/v<version>/ and drafts
 *                    RELEASE.md if that version does not have one yet
 *
 * The script shells out to the local copies of `next` and `electron-builder`
 * rather than through npx, so it behaves the same in cmd, PowerShell and bash
 * and never re-resolves a different tool version mid-build.
 */

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { replaceSymlinksWithCopies, tracedExternals } from './lib/desktop-package.mjs';
import { npmInvocation, spawnOptionsForCommand } from './lib/npm-spawn.mjs';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const version = pkg.version;
const outputDir = path.join(root, 'dist-electron');
const releaseDir = path.join(root, 'release', `v${version}`);

const NODE_MIN_MAJOR = 20;
const NODE_MIN_MINOR = 9;

const args = process.argv.slice(2);
const has = (flag) => args.includes(flag);

if (has('--help') || has('-h')) {
  printHelp();
  process.exit(0);
}

const options = {
  portableOnly: has('--portable-only'),
  installerOnly: has('--installer-only'),
  skipInstall: has('--skip-install'),
  forceInstall: has('--force-install'),
  skipBuild: has('--skip-build'),
  skipReleaseCopy: has('--no-release-copy'),
  verbose: has('--verbose'),
};

const timers = [];

main().catch((error) => {
  console.error('');
  console.error(`✖ ${error.message}`);
  if (options.verbose && error.stack) console.error(error.stack);
  console.error('');
  console.error('The build stopped. Nothing was published. See BUILD.md → Troubleshooting.');
  process.exit(1);
});

async function main() {
  const width = 62;
  const rule = '─'.repeat(width);
  console.log('');
  console.log(`┌${rule}┐`);
  console.log(`│${`  DOR101 desktop build — v${version}`.padEnd(width)}│`);
  console.log(`└${rule}┘`);
  console.log('');

  preflight();
  await installDependencies();
  await buildWebsite();
  const targets = packageApp();
  const artifacts = verify(targets);
  if (!options.skipReleaseCopy) copyToRelease(artifacts);
  printSummary(artifacts);
}

// ---------------------------------------------------------------------------
// 1. preflight
// ---------------------------------------------------------------------------

function preflight() {
  const started = step('1/6', 'Checking the build environment');

  const [major, minor] = process.versions.node.split('.').map(Number);
  if (major < NODE_MIN_MAJOR || (major === NODE_MIN_MAJOR && minor < NODE_MIN_MINOR)) {
    throw new Error(
      `Node.js ${NODE_MIN_MAJOR}.${NODE_MIN_MINOR}+ is required to build this app (found ${process.versions.node}). ` +
        'Install it from https://nodejs.org and run the build again.',
    );
  }
  detail(`Node.js ${process.versions.node}, npm ${npmVersion()}, ${process.platform} ${process.arch}`);

  const required = [
    'package-lock.json',
    'electron/builder.config.js',
    'electron/main.js',
    'electron/preload.js',
    'electron/assets/icon.ico',
    'LICENSE',
  ];
  const missing = required.filter((file) => !fs.existsSync(path.join(root, file)));
  if (missing.length > 0) {
    throw new Error(`Missing required file(s): ${missing.join(', ')}`);
  }
  detail('builder config, Electron entry points, icon and licence present');

  const sha = git('rev-parse', '--short', 'HEAD');
  const branch = git('rev-parse', '--abbrev-ref', 'HEAD');
  const dirty = git('status', '--porcelain');
  detail(
    `version ${version} from package.json — ${sha ?? 'no git'}${branch ? ` on ${branch}` : ''}` +
      (dirty ? ' (working tree has uncommitted changes)' : ''),
  );
  if (sha == null) {
    detail('git is unavailable; the build id will be "dev" unless NEXT_PUBLIC_BUILD_ID is set');
  }

  const siteVersion = readSiteVersion();
  if (siteVersion && siteVersion !== version) {
    detail(
      `⚠ NEXT_PUBLIC_APP_VERSION is pinned to "${siteVersion}" in the environment, but package.json says "${version}". ` +
        'The UI will report the pinned value while the installer is named after package.json. Unset it to build from one source.',
    );
  }

  endStep(started);
}

function npmVersion() {
  const { command, commandArgs, spawnOptions } = npmInvocation(['--version']);
  const result = spawnSync(command, commandArgs, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
    ...spawnOptions,
  });
  return result.status === 0 && result.stdout ? result.stdout.trim() : 'unknown';
}

/**
 * next.config.ts derives NEXT_PUBLIC_APP_VERSION from package.json, so the only
 * way the UI can disagree with the installer is an override in the environment.
 */
function readSiteVersion() {
  return process.env.NEXT_PUBLIC_APP_VERSION || null;
}

// ---------------------------------------------------------------------------
// 2. dependencies
// ---------------------------------------------------------------------------

function installDependencies() {
  const started = step('2/6', 'Installing dependencies');

  const nodeModules = path.join(root, 'node_modules');
  const lockfile = path.join(root, 'package-lock.json');

  if (options.skipInstall) {
    if (!fs.existsSync(path.join(nodeModules, 'next'))) {
      throw new Error('--skip-install was given but node_modules/next is missing. Drop the flag.');
    }
    detail('--skip-install: using the node_modules already on disk');
    endStep(started);
    return Promise.resolve();
  }

  const installed =
    fs.existsSync(path.join(nodeModules, 'next')) && fs.existsSync(path.join(nodeModules, 'electron-builder'));

  if (installed && !options.forceInstall && !lockfileIsNewerThanInstall(lockfile, nodeModules)) {
    detail('node_modules is up to date — pass --force-install to reinstall');
    endStep(started);
    return Promise.resolve();
  }

  detail(
    options.forceInstall
      ? '--force-install: reinstalling'
      : installed
        ? 'package-lock.json changed since the last install — reinstalling'
        : 'node_modules is incomplete — running `npm ci` (this downloads Electron, ~2 minutes)',
  );
  const npm = npmInvocation(['ci', '--no-audit', '--no-fund']);
  runOrFail(npm.command, npm.commandArgs, { cwd: root, env: process.env, ...npm.spawnOptions });
  detail('dependencies installed');
  endStep(started);
  return Promise.resolve();
}

/**
 * A node_modules left over from an older lockfile builds an exe that is not the
 * version you think you are shipping, so treat it the same as a missing one.
 */
function lockfileIsNewerThanInstall(lockfile, nodeModules) {
  const marker = path.join(nodeModules, '.package-lock.json');
  try {
    return fs.statSync(lockfile).mtimeMs > fs.statSync(marker).mtimeMs;
  } catch {
    return true;
  }
}

// ---------------------------------------------------------------------------
// 3. the website
// ---------------------------------------------------------------------------

function buildWebsite() {
  const started = step('3/6', `Building the website that goes into the exe (v${version})`);

  const buildIdFile = path.join(root, '.next', 'BUILD_ID');

  if (options.skipBuild) {
    if (!fs.existsSync(buildIdFile)) {
      throw new Error(
        '--skip-build was given but there is no .next/BUILD_ID to package. ' +
          'Run the build once without the flag.',
      );
    }
    const staleWarning = describeStaleness(readBuildId());
    detail(`--skip-build: reusing .next (build id ${readBuildId()})${staleWarning}`);
    dereferenceNextSymlinks();
    endStep(started);
    return Promise.resolve();
  }

  detail('running `next build` — the exe is only current if this ran against the current source');
  runOrFail(process.execPath, [path.join(root, 'node_modules', 'next', 'dist', 'bin', 'next'), 'build'], {
    cwd: root,
    env: { ...process.env, NODE_ENV: 'production' },
  });

  if (!fs.existsSync(buildIdFile)) {
    throw new Error('`next build` finished but .next/BUILD_ID is missing.');
  }
  const buildId = readBuildId();
  const sha = git('rev-parse', '--short', 'HEAD');
  detail(`built .next (build id ${buildId})${sha && sha !== buildId ? describeStaleness(buildId) : ''}`);

  dereferenceNextSymlinks();
  endStep(started);
  return Promise.resolve();
}

/** See scripts/lib/desktop-package.mjs for why the links have to go. */
function dereferenceNextSymlinks() {
  const replaced = replaceSymlinksWithCopies(path.join(root, '.next'));
  if (replaced > 0) detail(`replaced ${replaced} symlink(s) in .next with real copies for Windows packaging`);
}

function readBuildId() {
  try {
    return fs.readFileSync(path.join(root, '.next', 'BUILD_ID'), 'utf8').trim();
  } catch {
    return 'unknown';
  }
}

function describeStaleness(buildId) {
  const sha = git('rev-parse', '--short', 'HEAD');
  if (!sha || sha === buildId) return '';
  return ` — note: HEAD is ${sha}, so this .next does not match the checked-out source`;
}

// ---------------------------------------------------------------------------
// 4. packaging
// ---------------------------------------------------------------------------

function packageApp() {
  const started = step('4/6', 'Packaging the Windows executable');

  const targets = [];
  if (!options.portableOnly) targets.push('nsis');
  if (!options.installerOnly) targets.push('portable');

  detail(`electron-builder --win ${targets.join(',')} (x64, unsigned)`);

  runOrFail(
    process.execPath,
    [
      path.join(root, 'node_modules', 'electron-builder', 'out', 'cli', 'cli.js'),
      '--config',
      path.join(root, 'electron', 'builder.config.js'),
      '--win',
      ...targets,
      // A manual build must never try to talk to GitHub. The CLI default
      // publishes when HEAD sits on a tag, which is not what "build me an exe"
      // means and fails without a token.
      '--publish',
      'never',
    ],
    {
      cwd: root,
      env: {
        ...process.env,
        // No certificate is configured; without this electron-builder hunts for
        // one in the keychain / cert store and can fail the build over it.
        CSC_IDENTITY_AUTO_DISCOVERY: 'false',
        ELECTRON_BUILDER_CACHE: process.env.ELECTRON_BUILDER_CACHE ?? path.join(root, 'node_modules', '.cache', 'electron-builder'),
      },
    },
  );

  endStep(started);
  return targets;
}

// ---------------------------------------------------------------------------
// 5. verify
// ---------------------------------------------------------------------------

function verify(targets) {
  const started = step('5/6', 'Verifying the artifacts');

  const expected = [];
  if (targets.includes('nsis')) expected.push(`DOR101 Setup ${version}.exe`);
  if (targets.includes('portable')) expected.push(`DOR101-Portable-${version}.exe`);

  const artifacts = [];
  for (const name of expected) {
    const file = path.join(outputDir, name);
    if (!fs.existsSync(file)) {
      throw new Error(
        `electron-builder finished but ${name} is not in dist-electron/. ` +
          'Re-run with --verbose for the packager output.',
      );
    }
    const size = fs.statSync(file).size;
    artifacts.push({ name, file, size, sha256: sha256(file) });
    detail(`${name} — ${humanSize(size)}`);
  }

  const unpacked = path.join(outputDir, 'win-unpacked', 'DOR101.exe');
  detail(
    fs.existsSync(unpacked)
      ? 'win-unpacked/DOR101.exe present — you can run it directly on Windows to smoke-test before shipping'
      : 'note: no win-unpacked/ directory (cross-build); install the exe on Windows to smoke-test',
  );

  const sums = artifacts.map((a) => `${a.sha256}  ${a.name}`).join('\n') + '\n';
  fs.writeFileSync(path.join(outputDir, 'SHA256SUMS.txt'), sums);
  detail(`SHA256SUMS.txt written to dist-electron/`);

  const appDir = path.join(outputDir, 'win-unpacked', 'resources', 'app');
  if (fs.existsSync(appDir)) {
    const packagedBuildId = safeRead(path.join(appDir, '.next', 'BUILD_ID'));
    if (packagedBuildId && packagedBuildId !== readBuildId()) {
      throw new Error(
        `The packaged app contains build id ${packagedBuildId} but .next says ${readBuildId()} — the exe would not match the website you just built.`,
      );
    }
    if (packagedBuildId) detail(`packaged app carries website build id ${packagedBuildId} — same as .next`);
    for (const must of ['electron/main.js', 'node_modules/next/package.json', 'public/IMAGE-CREDITS.md']) {
      if (!fs.existsSync(path.join(appDir, must))) {
        throw new Error(`The packaged app is missing ${must}. The installer would not run.`);
      }
    }
    detail('packaged app contains the Electron entry point, the Next runtime and /public');

    const externals = tracedExternals(path.join(appDir, '.next'));
    const broken = externals.filter((entry) => !entry.ok);
    if (broken.length > 0) {
      throw new Error(
        `The packaged app has unusable traced dependencies in .next/node_modules: ` +
          `${broken.map((entry) => entry.name).join(', ')}. ` +
          'The server bundle requires them by that path, so the market and health routes would fail. ' +
          'Re-run without --skip-build.',
      );
    }
    if (externals.length > 0) {
      detail(`packaged traced dependencies are real directories (${externals.map((e) => e.name).join(', ')})`);
    }
  }

  endStep(started);
  return artifacts;
}

// ---------------------------------------------------------------------------
// 6. release folder
// ---------------------------------------------------------------------------

function copyToRelease(artifacts) {
  const started = step('6/6', `Copying artifacts to release/v${version}/`);

  fs.mkdirSync(releaseDir, { recursive: true });
  for (const artifact of artifacts) {
    fs.copyFileSync(artifact.file, path.join(releaseDir, artifact.name));
    detail(`release/v${version}/${artifact.name}`);
  }
  fs.copyFileSync(path.join(outputDir, 'SHA256SUMS.txt'), path.join(releaseDir, 'SHA256SUMS.txt'));

  const notes = path.join(releaseDir, 'RELEASE.md');
  if (fs.existsSync(notes)) {
    detail('RELEASE.md already exists — left untouched');
  } else {
    fs.writeFileSync(notes, draftReleaseNotes(artifacts));
    detail('RELEASE.md drafted — edit it before publishing');
  }

  endStep(started);
}

function draftReleaseNotes(artifacts) {
  const rows = artifacts
    .map((a) => `| \`${a.name}\` | ${humanSize(a.size)} | \`${a.sha256.slice(0, 16)}…\` |`)
    .join('\n');
  return `# DOR101 v${version} — Windows Release

**Platform:** Windows 10/11 (64-bit)
**Website build id:** \`${readBuildId()}\`

## Downloads

| File | Size | SHA-256 (first 16) |
|------|------|--------------------|
${rows}

## Installation (Setup)

1. Download \`DOR101 Setup ${version}.exe\`
2. Double-click to launch the installer
3. Choose an installation directory (or accept the default)
4. Click **Install**
5. Launch **DOR101** from the Desktop shortcut or Start Menu

## Portable usage

1. Download \`DOR101-Portable-${version}.exe\`
2. Place the file anywhere (USB drive, Desktop, etc.)
3. Double-click to run — no admin rights or installation needed

## Notes

- Windows SmartScreen may show an "Unknown publisher" warning because the app is
  not code-signed. Click **More info → Run anyway** to proceed.
- No account, API key, or database setup is required for the desktop app.
- All preferences (language, theme, font size) are stored locally on your device.
`;
}

// ---------------------------------------------------------------------------
// summary
// ---------------------------------------------------------------------------

function printSummary(artifacts) {
  const total = artifacts.reduce((sum, a) => sum + a.size, 0);
  console.log('');
  console.log('✔ Done.');
  console.log('');
  console.log(`  Website version : ${version} (build id ${readBuildId()})`);
  console.log(`  Artifacts       : dist-electron/  (${humanSize(total)} total)`);
  for (const artifact of artifacts) {
    console.log(`                    • ${artifact.name} — ${humanSize(artifact.size)}`);
    console.log(`                      sha256 ${artifact.sha256}`);
  }
  if (!options.skipReleaseCopy) {
    console.log(`  Release folder  : release/v${version}/`);
  }
  console.log('');
  console.log('  Next step — publish to GitHub Releases (needs `gh auth login`):');
  console.log(`    pwsh scripts/publish-release.ps1`);
  console.log('');
  console.log(`  Total time: ${timers.reduce((sum, t) => sum + t.ms, 0)} ms across ${timers.length} steps`);
  console.log('');
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function step(label, title) {
  const started = Date.now();
  console.log(`[${label}] ${title}`);
  return { label, title, started };
}
function endStep(handle) {
  const ms = Date.now() - handle.started;
  timers.push({ label: handle.label, ms });
  console.log(`      (${ms} ms)`);
  console.log('');
}

function detail(message) {
  console.log(`      ${message}`);
}

function runOrFail(command, commandArgs, runOptions = {}) {
  const merged = spawnOptionsForCommand(command, { stdio: 'inherit', shell: false, ...runOptions });
  let result = spawnSync(command, commandArgs, merged);
  // Last-chance retry: if something still handed us a .cmd without a shell.
  if (result.error?.code === 'EINVAL' && merged.shell !== true && process.platform === 'win32') {
    result = spawnSync(command, commandArgs, { ...merged, shell: true, windowsHide: true });
  }
  if (result.error) {
    throw new Error(`Could not run \`${command}\`: ${result.error.message}`);
  }
  if (result.status !== 0) {
    const shown = [command, ...commandArgs].map((a) => (a.includes(' ') ? `"${a}"` : a)).join(' ');
    throw new Error(`\`${shown}\` exited with code ${result.status}`);
  }
}

function git(...gitArgs) {
  const result = spawnSync('git', gitArgs, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  if (result.status !== 0) return null;
  return result.stdout.trim();
}

function sha256(file) {
  return createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function safeRead(file) {
  try {
    return fs.readFileSync(file, 'utf8').trim();
  } catch {
    return null;
  }
}

function humanSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(1)} ${units[unit]}`;
}

function printHelp() {
  console.log(`
Build the DOR101 Windows desktop app (v${version}).

Usage
  npm run build:exe                       installer + portable
  npm run build:portable                  portable only
  node scripts/build-exe.mjs [options]

Options
  --installer-only       build only the NSIS setup exe
  --portable-only        build only the portable exe
  --skip-install         do not run npm ci even if node_modules is incomplete
  --force-install        reinstall dependencies from the lockfile first
  --skip-build           reuse the existing .next instead of running next build
                         (the exe then contains whatever was built last)
  --no-release-copy      leave artifacts in dist-electron/ only
  --verbose              print stack traces when a step fails
  -h, --help             this message

Output
  dist-electron/DOR101 Setup ${version}.exe        NSIS installer
  dist-electron/DOR101-Portable-${version}.exe    portable, no install
  dist-electron/win-unpacked/                     unpacked app, runnable as-is
  dist-electron/SHA256SUMS.txt                    checksums
  release/v${version}/                            copies, for publishing

Requirements
  Node.js ${NODE_MIN_MAJOR}.${NODE_MIN_MINOR}+, ~3 GB free disk. Windows is not required to build:
  electron-builder cross-builds the Windows targets on macOS and Linux too.
  No API keys, database, or Docker. See BUILD.md.
`);
}
