# Building DOR101 for Windows

## Quick build

```bash
npm install
npm run build:exe
```

Artifacts are written to `dist-electron/`:

- `DOR101 Setup 2.0.0.exe` — NSIS installer
- `DOR101-Portable-2.0.0.exe` — portable executable
- `win-unpacked/DOR101.exe` — unpacked application folder

## Prerequisites

- Node.js 20+
- Windows 10/11 (64-bit) for building Windows targets
- ~2 GB free disk space for the build cache and output

No API keys, Docker, or database required.

## Development

```bash
npm run dev              # Web dev server at http://localhost:3000
npm run electron:dev     # Electron shell against the dev server
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `RequestError: unable to verify the first certificate` during `npm install` | Corporate proxy blocking the Electron binary CDN — run `ELECTRON_SKIP_BINARY_DOWNLOAD=1 npm install` (web app still works; only `build:exe` needs the binary) |
| Windows SmartScreen warning | Expected for unsigned builds; use **More info → Run anyway** |
| Code signing / symlink errors | `electron/builder.config.js` disables signing (`signAndEditExecutable: false`) |
| NSIS invalid icon | Use `electron/assets/icon.ico` (not `.png`) for installer icons |

## Configuration

Packaging is controlled by `electron/builder.config.js`:

- **App ID:** `org.dor101.app`
- **Output:** `dist-electron/`
- **Targets:** NSIS installer + portable (x64)
- **Icons:** `electron/assets/icon.ico`
- **Version:** read from `package.json` (currently 2.0.0)
