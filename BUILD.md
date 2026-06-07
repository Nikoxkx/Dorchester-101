# Building DOR101 for Windows

## Quick build

```bash
npm install
npm run build:exe
```

Artifacts are written to `dist-electron/`:

- `DOR101 Setup 1.0.0.exe` — NSIS installer
- `DOR101-Portable-1.0.0.exe` — portable executable
- `win-unpacked/DOR101.exe` — unpacked application folder

Copy release files to `release/v1.0.0/` for distribution.

## Prerequisites

- Node.js 18+
- Windows 10/11 (64-bit) for building Windows targets
- ~2 GB free disk space for build cache and output

No API keys, Docker, or database required.

## Development

```bash
npm run dev              # Web dev server at http://localhost:3000
npm run build            # Production web build
npm run electron:dev     # Electron (run `npm run build` first)
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `DATABASE_URL is required` during build | Fixed — DB is optional; desktop builds work without it |
| Windows SmartScreen warning | Expected for unsigned builds; use **More info → Run anyway** |
| Code signing / symlink errors | `electron/builder.config.js` disables signing (`signAndEditExecutable: false`) |
| NSIS invalid icon | Use `electron/assets/icon.ico` (not `.png`) for installer icons |

## Configuration

Packaging is controlled by `electron/builder.config.js`:

- **App ID:** `org.dor101.app`
- **Output:** `dist-electron/`
- **Targets:** NSIS installer + portable (x64)
- **Icons:** `electron/assets/icon.ico`
