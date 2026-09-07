# Dorchester 101 — the Windows desktop app

DOR101 ships as a website and as a Windows desktop app. The desktop app is the
same Next.js application running locally inside an Electron window: no account,
no configuration, no database, and no browser required.

**To build the exe yourself, see [BUILD.md](BUILD.md).** The short version:

```bash
npm run build:exe
```

## Downloads

From [GitHub Releases](https://github.com/Nikoxkx/Dorchester-101/releases/latest),
or from the download button on the site itself, which resolves the newest release
for you:

| File | Use it when |
|------|-------------|
| `DOR101 Setup <version>.exe` | You want Start Menu and Desktop shortcuts, and an uninstaller |
| `DOR101-Portable-<version>.exe` | You are on a library or shelter computer, or a USB stick — no install, no admin rights |

Both are about 180 MB. They contain the whole application, so nothing else needs
to be downloaded or installed to run them.

## Installing

1. Download `DOR101 Setup <version>.exe` and double-click it.
2. Choose an installation directory, or accept the default.
3. Click **Install**.
4. Launch **DOR101** from the Desktop shortcut or the Start Menu.

Windows SmartScreen may warn that the publisher is unknown, because the build is
not code-signed. Choose **More info → Run anyway**.

## Running the portable build

1. Put `DOR101-Portable-<version>.exe` anywhere — Desktop, a USB drive, a shared
   folder.
2. Double-click it. Nothing is written to the registry and no admin rights are
   needed.

## What runs on your machine

```
DOR101.exe  (Electron window)
    │
    └── next start  on 127.0.0.1, a port chosen at launch
            └── the production build of this website (.next/)
```

The desktop app runs the real site locally, including its server-rendered API
routes — live MBTA predictions, news feeds and HUD/Census market data are fetched
by that local server, so those pages need an internet connection. Everything the
site ships offline (the directory, the map places, hotlines, FAQ) is inside the
package and works with no signal at all.

The server binds to `127.0.0.1` only. Nothing is exposed to the rest of the
network, and closing the window stops the server.

Your language, theme and font-size choices are stored locally on your device.

## Updates

There is no auto-updater in the current build. When a new version is published,
download it from the link above — the site's download button always points at the
newest release. Installing over an existing installation keeps your preferences.

## Troubleshooting

| Symptom | What to do |
|---------|------------|
| Blank window on launch | Quit DOR101 completely and start it again. If it persists, run `win-unpacked\DOR101.exe` from a terminal to see the server log |
| "Unknown publisher" warning | Expected for an unsigned build: **More info → Run anyway** |
| A page shows no live data | Those pages need a connection. The rest of the app works offline |
| Live transit or news is stale | The local server polls on its own schedule; reopen the page, or check that the MBTA/Census feeds are up |

## For maintainers

| Task | Where |
|------|-------|
| Build the exe | [BUILD.md](BUILD.md) — `npm run build:exe` |
| Check a package without installing it | `npm run verify:desktop` |
| Publish a release | `scripts/publish-release.ps1`, or push a `v*` tag |
| Electron main process | `electron/main.js` |
| Packaging configuration | `electron/builder.config.js` |

Report problems at <https://github.com/Nikoxkx/Dorchester-101/issues>.
