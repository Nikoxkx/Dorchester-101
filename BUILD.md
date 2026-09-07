# Building the DOR101 Windows exe

The desktop app is the current website wrapped in Electron. One command builds it
from whatever is checked out:

```bash
git pull
npm run build:exe
```

That is the whole manual build. The script installs dependencies if they are
missing, runs `next build`, packages the result, and tells you where the
executables are.

## What you get

Everything lands in `dist-electron/`, named after the version in `package.json`:

| File | What it is |
|------|------------|
| `DOR101 Setup 4.0.0.exe` | NSIS installer — Start Menu and Desktop shortcuts, uninstaller |
| `DOR101-Portable-4.0.0.exe` | Portable — double-click and run, no install, no admin rights |
| `win-unpacked/DOR101.exe` | The unpacked app. Run it on Windows to smoke-test before shipping |
| `SHA256SUMS.txt` | Checksums for both exes |

The script also copies the two exes, the checksums and a drafted `RELEASE.md`
into `release/v4.0.0/`, which is where `scripts/publish-release.ps1` looks.

## What the script does

`scripts/build-exe.mjs`, in order:

1. **Preflight** — Node version, required files, and the version + git sha the
   build will be stamped with.
2. **Dependencies** — `npm ci`, but only if `node_modules` is incomplete.
3. **Website** — `next build`. This is the step that makes the exe the *current*
   website; skipping it packages whatever was built last.
4. **Package** — `electron-builder --win nsis portable --publish never`.
5. **Verify** — the exes exist, the packaged app carries the same build id as
   `.next`, and its entry point, Next runtime and `/public` are present.
6. **Release** — copy to `release/v<version>/` and draft the notes.

Any step failing stops the build and prints the command that failed. Nothing is
published by the script.

## Options

```bash
node scripts/build-exe.mjs --help
```

| Flag | Use it when |
|------|-------------|
| `--portable-only` | You only need the no-install exe (`npm run build:portable`) |
| `--installer-only` | You only need the setup exe |
| `--skip-install` | You know `node_modules` is already correct |
| `--skip-build` | You just ran `next build` and do not want to wait again |
| `--no-release-copy` | You want the artifacts in `dist-electron/` only |
| `--verbose` | You want a stack trace with the failure |

## Requirements

- **Node.js 20.9+** and npm.
- **~3 GB free disk** for `node_modules`, `.next` and the packaged output.
- **Internet access** on the first run: npm, the Electron binaries and
  electron-builder's NSIS tools all download from the npm registry and GitHub
  releases.
- **Windows is not required.** electron-builder cross-builds the Windows targets
  on macOS and Linux too; you just cannot run the result there.

No API keys, no database, no Docker. Every data source the app uses is either
bundled or a public API called at runtime.

## Checking a build before you ship it

```bash
npm run verify:desktop
```

This assembles exactly what goes into `resources/app` — using electron-builder's
own matcher for the `files` patterns, plus the production dependency tree — boots
`next start` from that directory the way `electron/main.js` does, and requests
the routes the desktop app depends on:

```
✔ server answered on http://127.0.0.1:41873 in 506 ms
✔ 200 /
✔ 200 /about
✔ 200 /api/health
✔ 200 /api/download
✔ server reports version 4.0.0 — package.json says 4.0.0
✔ The packaged app boots and serves every required route (12/12 probed OK).
```

It catches the failures that only show up inside the package: a `files` pattern
that drops something the server needs, a route that only worked because a
devDependency happened to be installed, and a server that never binds (which in
the exe is a window that never loads). It needs no Windows machine.

## Publishing

```bash
pwsh scripts/publish-release.ps1     # tag v<version>, create the release, upload both exes
```

or, to attach the exes to a release that already exists:

```bash
pwsh scripts/upload-release.ps1      # version defaults to package.json
```

Both need `gh auth login`. The site's download button (`/api/download`) points at
the newest GitHub release automatically, so publishing is what makes the new exe
reach users.

## Releasing a new version

1. Bump `version` in `package.json`. That one value names the exes, the release
   folder and the version shown in the app — `next.config.ts` injects it as
   `NEXT_PUBLIC_APP_VERSION`.
2. `npm run build:exe`
3. `npm run verify:desktop`
4. Edit `release/v<new-version>/RELEASE.md` (the script drafts it).
5. Commit, tag `v<new-version>`, push the tag — the
   [Release workflow](.github/workflows/release.yml) builds and publishes on
   Windows. Or run `scripts/publish-release.ps1` yourself.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `Node.js 20.9+ is required` | Install Node 20 or newer from nodejs.org |
| `Could not run npm.cmd: spawnSync npm.cmd EINVAL` | Fixed in current `scripts/lib/npm-spawn.mjs`: the build runs npm as a Node script (`npm-cli.js`), and if it must use `npm.cmd` it always sets `shell: true`. Pull the latest tree and re-run `npm run build:exe`. Do not stay on Node 18. |
| Build fails downloading `electron-v…-win32-x64.zip` | GitHub releases are unreachable (corporate proxy, offline). Retry on a normal connection; the download is cached in `node_modules/.cache/electron-builder` after the first success |
| Windows SmartScreen warns "Unknown publisher" | Expected: the build is unsigned. **More info → Run anyway** |
| `electron-builder` complains about a signing certificate | Should not happen — the config sets `signAndEditExecutable: false` and the script sets `CSC_IDENTITY_AUTO_DISCOVERY=false` |
| NSIS "invalid icon" | The icon must be `electron/assets/icon.ico`, not the `.png` |
| The app opens to a blank window | Run `dist-electron/win-unpacked/DOR101.exe` from a terminal to see the server log, then `npm run verify:desktop` to reproduce it outside Electron |
| The exe shows an old version of the site | The build reused a stale `.next`. Run `npm run build:exe` without `--skip-build`; the script prints the build id it packaged |
| `Cannot find module` in an API route inside the exe | A dependency is in `devDependencies`. Move it to `dependencies` — only production dependencies are packaged |
| `verify:desktop` passes every route then dies with `EBUSY: resource busy or locked, rmdir` | Windows-only, and it used to fail the whole run: the staging directory was deleted before the `next start` child had released it. `stopProcess()` in `scripts/lib/desktop-package.mjs` now waits for the exit and `removeDirRetrying()` retries the delete. If a stale `.desktop-package-check/` is left behind, delete it by hand |

## How the desktop build is put together

Configuration lives in `electron/builder.config.js`.

- **App ID:** `org.dor101.app`
- **Output:** `dist-electron/`
- **Targets:** NSIS installer and portable, x64
- **Icons:** `electron/assets/icon.ico` (also copied beside the exe for the window
  and tray icons)
- **Signing:** off

The packaged app is a plain directory, not an asar archive: `electron/main.js`
spawns `next start` with `resources/app` as its working directory, and a child
process cannot chdir into an archive. It picks a free port on `127.0.0.1`, waits
for the server to answer before showing the window, and shows an error dialog
rather than a blank window if it never does.

The site has server-rendered API routes (`/api/news`, `/api/mbta`,
`/api/market-data`, …), so a static export is not an option — the exe ships the
real Next.js server and its production dependencies. That is why the download is
around 180 MB rather than a few.

`node_modules` is deliberately absent from the `files` list: electron-builder
collects the production dependency tree on its own. Naming it explicitly copies
everything on disk, devDependencies included, which measured at **1.2 GB across
50,000 files** against ~17 MB of application code.

### Updates

There is **no auto-updater**. `electron/preload.js` exposes the IPC bridge an
updater would use, but no `electron-updater` is wired up and nothing emits those
events. Users update by downloading the new release — the site's download button
resolves the newest one. If you want real auto-updates, that is a separate piece
of work: add `electron-updater`, call `autoUpdater.checkForUpdatesAndNotify()` in
`main.js`, and publish `latest.yml` alongside the exes.
