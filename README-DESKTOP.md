# DOR101 — Desktop Application Guide

DOR101 ships as a standalone Windows desktop app (`.exe`) built with **Electron**
and **electron-builder**. The desktop app embeds the production Next.js build and
serves it locally on `http://127.0.0.1:3101`, then opens it in a native window —
same desk, same privacy, no browser needed.

## Desktop features

- ✅ One-file installer or portable executable
- ✅ Native menus: **Refresh All** and **Generate Report** (runs the dashboard snapshot)
- ✅ Dark/light theme, language, and font size follow the in-app settings
- ✅ Same offline PWA shell and emergency numbers as the web app
- ✅ Auto-update *notifications* are wired (releases are unsigned, so distribution
  is via GitHub Releases rather than an auto-updater feed)

## Development

```bash
npm run dev              # terminal 1 — Next.js dev server
npm run electron:dev     # terminal 2 — Electron window against it
```

## Production build (Windows)

```bash
npm run build
npm run build:exe
```

Output:

- `dist-electron/DOR101 Setup 2.0.0.exe` — NSIS installer
- `dist-electron/DOR101-Portable-2.0.0.exe` — portable (run from a USB drive)

`npm run build:portable` builds only the portable target.

## GitHub Releases

Tag a release and `.github/workflows/release.yml` (Windows runner) builds both
artifacts and publishes them:

```bash
git tag v2.0.0
git push origin v2.0.0
```

## Code signing (optional)

1. Acquire a Windows code-signing certificate
2. Set `CSC_LINK` / `CSC_KEY_PASSWORD` (or configure `scripts/sign.js`)
3. Remove `sign: null` from `electron/builder.config.js`

Until then, expect the SmartScreen "unknown publisher" warning:
**More info → Run anyway**.

## Architecture

```
Electron main process (electron/main.js)
    ├── spawns/attaches to Next.js server on 127.0.0.1:3101
    ├── native menu  →  IPC (preload.js)  →  web app events
    └── BrowserWindow (contextIsolation, sandbox on)
Web app (Next.js App Router) — pages + /api routes
```

Key files:

- `electron/main.js` — window, local server lifecycle, menu, IPC
- `electron/preload.js` — safe bridge (`window.electron`), typed in `src/types/electron.d.ts`
- `electron/builder.config.js` — packaging settings
- `src/components/layout/MainLayout.tsx` — maps native menu actions to app events
- `src/components/UpdateNotifier.tsx` — update-available UI

## Troubleshooting

| Symptom | Fix |
|---|---|
| Blank window | Run `npm run build` first, then `npm run build:exe`; the shell needs `.next/` |
| Port already in use | Set `DOR101_PORT` (default 3101) before starting |
| Menu clicks do nothing in the browser | Correct — native menu actions only exist inside the Electron shell |
| Window shows old colors/icons | Rebuild: icons are bundled at package time |

For anything else, open an issue: https://github.com/Nikoxkx/Dorchester-101/issues
