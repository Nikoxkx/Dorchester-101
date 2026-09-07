#!/usr/bin/env node
/**
 * Prove the desktop package actually runs, without needing Windows.
 *
 *   npm run verify:desktop
 *
 * electron-builder's own matcher decides what goes into `resources/app`, so this
 * script asks that matcher (app-builder-lib's FileMatcher, with the same default
 * patterns electron-builder prepends in getMainFileMatchers) instead of guessing.
 * It then adds the *production* dependency tree the packager would add, boots
 * `next start` from that directory exactly the way electron/main.js does, and
 * requests the pages and API routes the desktop app depends on.
 *
 * What this catches that `next build` cannot:
 *   - a `files` pattern that drops something the server needs at runtime
 *   - a route that only works because a devDependency happened to be installed
 *   - the `.next/node_modules/*` traced externals turning into dangling symlinks
 *   - a server that never binds, which in the exe is a window that never loads
 *
 * The staging directory is thrown away afterwards unless --keep is passed.
 */

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import net from 'node:net';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { replaceSymlinksWithCopies, tracedExternals } from './lib/desktop-package.mjs';

const require = createRequire(import.meta.url);

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const args = process.argv.slice(2);
const has = (flag) => args.includes(flag);
const keep = has('--keep');
const verbose = has('--verbose');

const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const stagingRoot = path.join(root, '.desktop-package-check');
const appDir = path.join(stagingRoot, 'app');

/** Routes the desktop app needs. `required: false` ones depend on the network. */
const ROUTES = [
  { path: '/', required: true, expect: 'text/html' },
  { path: '/settings', required: true, expect: 'text/html' },
  // The About page reads public/IMAGE-CREDITS.md off disk via process.cwd(), so
  // this is the check that /public shipped and the server's cwd is right.
  { path: '/about', required: true, expect: 'text/html' },
  // /api/health imports @/db, which imports pg — a 500 here means the
  // production dependency tree is missing something.
  { path: '/api/health', required: true, expect: 'application/json' },
  { path: '/api/download', required: true, expect: 'application/json' },
  { path: '/api/resources', required: true, expect: 'application/json' },
  { path: '/manifest.json', required: true, expect: 'application/json' },
  { path: '/icons/icon-192.png', required: true, expect: 'image/png' },
  { path: '/market-trends', required: true, expect: 'text/html' },
  // These call third-party APIs; a failure here is usually the sandbox being
  // offline rather than the package being wrong.
  { path: '/api/search?q=housing', required: false, expect: 'application/json' },
  { path: '/api/news', required: false, expect: 'application/json' },
  { path: '/api/market-data', required: false, expect: 'application/json' },
];

const results = [];
let server = null;

main()
  .then((code) => {
    teardown();
    process.exit(code);
  })
  .catch((error) => {
    teardown();
    console.error('');
    console.error(`✖ ${error.message}`);
    if (verbose && error.stack) console.error(error.stack);
    process.exit(1);
  });

async function main() {
  console.log('');
  console.log('DOR101 desktop package check');
  console.log('============================');
  console.log('');

  if (!fs.existsSync(path.join(root, '.next', 'BUILD_ID'))) {
    throw new Error('No .next/BUILD_ID — run `npm run build` (or `npm run build:exe --skip-install`) first.');
  }
  console.log(`website build id : ${readBuildId()}`);
  console.log(`staging directory: ${path.relative(root, stagingRoot)}/`);
  console.log('');

  fs.rmSync(stagingRoot, { recursive: true, force: true });
  fs.mkdirSync(appDir, { recursive: true });

  const copied = await copyAppFiles();
  console.log(`  app files      : ${copied.files} files, ${(copied.bytes / 1048576).toFixed(1)} MB`);

  const deps = copyProductionDependencies();
  console.log(`  production deps: ${deps.packages} packages, ${(deps.bytes / 1048576).toFixed(1)} MB`);
  if (deps.missing.length > 0) {
    console.log(`  not installed here (optional, platform-specific): ${deps.missing.join(', ')}`);
  }

  // Same normalisation scripts/build-exe.mjs applies to .next before the
  // packager copies it — see scripts/lib/desktop-package.mjs.
  const normalized = replaceSymlinksWithCopies(path.join(appDir, '.next'));
  const sourceLinks = tracedExternals(path.join(root, '.next')).filter((e) => e.isLink).length;
  if (normalized > 0) {
    console.log(`  normalized     : ${normalized} symlink(s) in .next replaced with real copies`);
  }
  if (sourceLinks > 0) {
    console.log(
      `  note           : the repo's .next still has ${sourceLinks} symlink(s); ` +
        '`npm run build:exe` replaces them before packaging',
    );
  }

  const structural = checkStructure();
  console.log('');
  console.log('Structure');
  for (const check of structural) {
    console.log(`  ${check.ok ? '✔' : '✖'} ${check.label}`);
    if (!check.ok && check.detail) console.log(`      ${check.detail}`);
  }

  const structuralFailures = structural.filter((c) => !c.ok && c.fatal);
  if (structuralFailures.length > 0) {
    console.error('');
    console.error(`✖ ${structuralFailures.length} structural check(s) failed — the packaged app would not start.`);
    return 1;
  }

  console.log('');
  console.log('Runtime');
  const port = await freePort();
  const booted = await startServer(port);
  if (!booted.ok) {
    console.error(`  ✖ \`next start\` did not come up: ${booted.reason}`);
    return 1;
  }
  console.log(`  ✔ server answered on http://127.0.0.1:${port} in ${booted.ms} ms`);

  for (const route of ROUTES) {
    const result = await probe(`http://127.0.0.1:${port}${route.path}`, route.expect);
    results.push({ ...route, ...result });
    const mark = result.ok ? '✔' : route.required ? '✖' : '·';
    console.log(
      `  ${mark} ${String(result.status).padEnd(3)} ${route.path}` +
        `${result.ok ? '' : ` — ${result.detail}`}${!route.required && !result.ok ? ' (needs network)' : ''}`,
    );
  }

  // The exe has to be the *current* version, and /api/health is the one place
  // that says which version the running server was built from.
  let versionMatches = false;
  const health = results.find((r) => r.path === '/api/health');
  try {
    const reported = JSON.parse(health.body).version;
    versionMatches = reported === pkg.version;
    console.log(
      `  ${versionMatches ? '✔' : '✖'} server reports version ${reported} — package.json says ${pkg.version}`,
    );
  } catch {
    console.error('  ✖ could not read the version from /api/health');
  }

  const requiredFailures = results.filter((r) => r.required && !r.ok);
  const optionalFailures = results.filter((r) => !r.required && !r.ok);

  console.log('');
  if (requiredFailures.length === 0 && versionMatches) {
    console.log(
      `✔ The packaged app boots and serves every required route (${results.length - optionalFailures.length}/${results.length} probed OK).`,
    );
  } else {
    console.error(`✖ ${requiredFailures.length} required route(s) failed inside the package:`);
    for (const failure of requiredFailures) console.error(`    ${failure.path} → ${failure.status} ${failure.detail}`);
  }
  if (optionalFailures.length > 0) {
    console.log(
      `  ${optionalFailures.length} network-dependent route(s) did not answer; that is expected offline ` +
        `(${optionalFailures.map((f) => f.path).join(', ')}).`,
    );
  }
  console.log('');
  return requiredFailures.length === 0 && versionMatches ? 0 : 1;
}

// ---------------------------------------------------------------------------
// assembling the package
// ---------------------------------------------------------------------------

/**
 * Copy exactly what electron-builder's `files` patterns select, using its own
 * matcher. The pattern list built here mirrors
 * app-builder-lib/out/fileMatcher.js → getMainFileMatchers(): the defaults it
 * splices in before the user's patterns and the excludes it appends after.
 */
async function copyAppFiles() {
  const { FileMatcher, excludedNames, excludedExts } = require('app-builder-lib/out/fileMatcher.js');
  const { copyDir } = require('builder-util');

  const config = require(path.join(root, 'electron', 'builder.config.js'));
  const buildResourcesDir = path.resolve(root, config.directories.buildResources);
  const outDir = path.resolve(root, config.directories.output);

  const matcher = new FileMatcher(root, appDir, (value) => value, config.files);
  const patterns = matcher.patterns;
  const defaults = [];

  if (!matcher.isSpecifiedAsEmptyArray && (matcher.isEmpty() || matcher.containsOnlyIgnore())) {
    defaults.push('**/*');
  } else if (!patterns.includes('package.json')) {
    patterns.push('package.json');
  }
  defaults.push('!**/node_modules');

  for (const dir of [buildResourcesDir, outDir]) {
    const relative = path.relative(root, dir).split(path.sep).join('/');
    if (relative.length !== 0 && !relative.startsWith('.')) defaults.push(`!${relative}{,/**/*}`);
  }

  let insertAt = 0;
  for (let i = patterns.length - 1; i >= 0; i -= 1) {
    if (patterns[i].startsWith('**/')) {
      insertAt = i + 1;
      break;
    }
  }
  patterns.splice(insertAt, 0, ...defaults);
  patterns.push(`!**/*.{${excludedExts},pdb}`);
  patterns.push('!**/._*');
  patterns.push('!**/electron-builder.{yaml,yml,json,json5,toml,ts}');
  patterns.push(`!**/{${excludedNames}}`);
  patterns.push('!.yarn{,/**/*}');
  patterns.push('!.editorconfig');
  patterns.push('!.yarnrc.yml');

  await copyDir(root, appDir, { filter: matcher.createFilter() });

  return sizeOf(appDir);
}

/**
 * electron-builder collects package.json "dependencies" (plus optional
 * dependencies) and everything below them — never devDependencies, and not the
 * optional *peer* dependencies that npm also installs into node_modules
 * (`npm ls --omit=dev` lists those too, which would silently mask a missing
 * runtime dependency here). So the tree is walked from the manifests instead.
 */
function copyProductionDependencies() {
  const names = productionPackageNames();
  const nodeModules = path.join(root, 'node_modules');
  let copied = 0;

  const walk = (dir, scope = '') => {
    for (const entry of listDirWithTypes(dir)) {
      if (!entry.isDirectory()) continue;
      const full = path.join(dir, entry.name);
      if (entry.name === '.bin') continue;

      if (scope === '' && entry.name.startsWith('@')) {
        walk(full, entry.name); // scoped namespace: the packages are one level down
        continue;
      }
      const name = scope === '' ? entry.name : `${scope}/${entry.name}`;
      if (!names.has(name)) continue;

      const relative = path.relative(root, full);
      const to = path.join(appDir, relative);
      fs.mkdirSync(path.dirname(to), { recursive: true });
      fs.cpSync(full, to, { recursive: true, dereference: true, errorOnExist: false, force: true });
      copied += 1;
      // A nested node_modules under a production package holds its own
      // production dependencies.
      const nested = path.join(full, 'node_modules');
      if (fs.existsSync(nested)) walk(nested);
    }
  };

  walk(nodeModules);

  const bytes = sizeOf(path.join(appDir, 'node_modules')).bytes;
  return { packages: copied, bytes, missing: [...names].filter((n) => !fs.existsSync(path.join(appDir, 'node_modules', n))) };
}

/** Transitive closure of dependencies + optionalDependencies, from the manifests. */
function productionPackageNames() {
  const names = new Set();
  const queue = [[JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')), root]];

  while (queue.length > 0) {
    const [manifest, fromDir] = queue.shift();
    for (const field of ['dependencies', 'optionalDependencies']) {
      for (const name of Object.keys(manifest[field] ?? {})) {
        const installed = resolveInstalled(name, fromDir);
        if (installed == null) continue; // optional platform package not installed here
        if (names.has(name)) continue;
        names.add(name);
        queue.push([installed.manifest, installed.dir]);
      }
    }
  }

  return names;
}

/** Node's own lookup order: nearest node_modules first, then outwards. */
function resolveInstalled(name, fromDir) {
  let current = fromDir;
  while (true) {
    const dir = path.join(current, 'node_modules', name);
    const manifestPath = path.join(dir, 'package.json');
    if (fs.existsSync(manifestPath)) {
      try {
        return { dir, manifest: JSON.parse(fs.readFileSync(manifestPath, 'utf8')) };
      } catch {
        return null;
      }
    }
    const parent = path.dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

// ---------------------------------------------------------------------------
// structural checks
// ---------------------------------------------------------------------------

function checkStructure() {
  const checks = [];
  const add = (label, ok, detail = '', fatal = true) => checks.push({ label, ok, detail, fatal });

  const at = (...parts) => path.join(appDir, ...parts);
  const isRealFile = (file) => {
    try {
      return fs.statSync(file).isFile(); // statSync follows symlinks; a dangling one throws
    } catch {
      return false;
    }
  };

  add('electron/main.js', isRealFile(at('electron', 'main.js')), 'the exe has no entry point without it');
  add('electron/preload.js', isRealFile(at('electron', 'preload.js')), 'the IPC bridge is referenced by main.js');
  add('package.json', isRealFile(at('package.json')));
  add('.next/BUILD_ID', isRealFile(at('.next', 'BUILD_ID')));
  add('.next/required-server-files.json', isRealFile(at('.next', 'required-server-files.json')));
  add('node_modules/next (server runtime)', isRealFile(at('node_modules', 'next', 'package.json')));
  add('node_modules/react (peer of the server bundle)', isRealFile(at('node_modules', 'react', 'package.json')));
  add('node_modules/pg (imported by @/db)', isRealFile(at('node_modules', 'pg', 'package.json')));
  add('public/IMAGE-CREDITS.md (read by /about)', isRealFile(at('public', 'IMAGE-CREDITS.md')));

  // The build cache is 100 MB of nothing at runtime.
  add('.next/cache excluded', !fs.existsSync(at('.next', 'cache')), '', false);

  // No devDependencies should have travelled along.
  for (const devOnly of ['typescript', 'electron', 'electron-builder', 'vitest', 'playwright']) {
    add(
      `devDependency ${devOnly} excluded`,
      !fs.existsSync(at('node_modules', devOnly)),
      'shipping devDependencies is what made the old package 1.2 GB',
      false,
    );
  }

  // The server bundle requires these by path, so a dangling link is a 500 on
  // /api/health and /api/market-data rather than a build warning.
  const traced = tracedExternals(at('.next'));
  if (traced.length === 0) {
    add('.next/node_modules traced externals', true, 'none in this build', false);
  } else {
    for (const entry of traced) {
      add(
        `traced external ${entry.name} is a real directory`,
        entry.ok,
        entry.isLink ? 'still a symlink — Windows cannot create it without developer mode' : 'directory is empty',
      );
    }
  }

  return checks;
}

// ---------------------------------------------------------------------------
// booting the server the way electron/main.js does
// ---------------------------------------------------------------------------

function startServer(port) {
  return new Promise((resolve) => {
    const startedAt = Date.now();
    const nextCli = path.join(appDir, 'node_modules', 'next', 'dist', 'bin', 'next');
    const log = [];

    server = spawn(process.execPath, [nextCli, 'start', '-H', '127.0.0.1', '-p', String(port)], {
      cwd: appDir,
      env: { ...process.env, HOSTNAME: '127.0.0.1', PORT: String(port), NODE_ENV: 'production' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    const onData = (chunk) => {
      const text = chunk.toString().trim();
      if (text) log.push(text);
      if (verbose && text) console.log(`      [server] ${text}`);
    };
    server.stdout.on('data', onData);
    server.stderr.on('data', onData);
    server.on('exit', (code) => {
      if (code !== 0 && code !== null) log.push(`exited with code ${code}`);
    });

    const deadline = Date.now() + 60_000;
    const attempt = () => {
      const request = require('node:http').get(`http://127.0.0.1:${port}/api/health`, (res) => {
        res.resume();
        resolve({ ok: true, ms: Date.now() - startedAt });
      });
      request.on('error', () => {
        if (Date.now() > deadline) {
          resolve({ ok: false, reason: log.slice(-3).join(' | ') || 'no output from next start' });
          return;
        }
        setTimeout(attempt, 250);
      });
      request.setTimeout(3000, () => request.destroy());
    };
    attempt();
  });
}

function probe(url, expectedType) {
  return new Promise((resolve) => {
    const startedAt = Date.now();
    const request = require('node:http').get(url, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        if (body.length < 4096) body += chunk;
      });
      res.on('end', () => {
        const type = res.headers['content-type'] ?? '';
        const ok = res.statusCode === 200 && (expectedType == null || type.includes(expectedType));
        resolve({
          status: res.statusCode,
          ok,
          ms: Date.now() - startedAt,
          body,
          detail: ok ? '' : `expected ${expectedType}, got ${type || 'no content-type'}`,
        });
      });
    });
    request.on('error', (error) => resolve({ status: 0, ok: false, ms: 0, body: '', detail: error.message }));
    request.setTimeout(45_000, () => {
      request.destroy();
      resolve({ status: 0, ok: false, ms: 45_000, body: '', detail: 'timed out after 45s' });
    });
  });
}

function teardown() {
  if (server && server.exitCode === null) server.kill('SIGKILL');
  if (!keep) fs.rmSync(stagingRoot, { recursive: true, force: true });
  else console.log(`staging kept at ${stagingRoot}`);
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function freePort() {
  return new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.unref();
    probe.on('error', reject);
    probe.listen(0, '127.0.0.1', () => {
      const assigned = probe.address().port;
      probe.close(() => resolve(assigned));
    });
  });
}

function listDir(dir) {
  try {
    return fs.readdirSync(dir);
  } catch {
    return [];
  }
}

function sizeOf(dir) {
  let files = 0;
  let bytes = 0;
  const walk = (current) => {
    for (const entry of listDirWithTypes(current)) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile()) {
        files += 1;
        try {
          bytes += fs.statSync(full).size;
        } catch {
          /* vanished mid-walk */
        }
      }
    }
  };
  walk(dir);
  return { files, bytes };
}

function listDirWithTypes(dir) {
  try {
    return fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
}

function readBuildId() {
  try {
    return fs.readFileSync(path.join(root, '.next', 'BUILD_ID'), 'utf8').trim();
  } catch {
    return 'unknown';
  }
}
