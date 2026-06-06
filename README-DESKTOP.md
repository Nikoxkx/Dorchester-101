# Dorchester 101 - Desktop Application Build Guide

## Overview

Dorchester 101 is now packaged as a standalone Windows desktop application (.exe) using **Electron** and **electron-builder**. Users can download a single file and run it immediately without any additional setup.

## Features

- ✅ **One-file download**: Single .exe installer or portable executable
- ✅ **Auto-updates**: Seamless background updates without user interaction
- ✅ **No installation required**: Portable version runs directly
- ✅ **All features included**: Full web app functionality in desktop wrapper
- ✅ **Offline-capable**: Can work offline for cached content

## Building the Desktop App

### Development

```bash
npm run dev:electron
```

This starts:
1. Next.js dev server on http://localhost:3000
2. Electron window connected to the dev server

### Production Build (Windows)

**Installer (.exe + Setup):**
```bash
npm run build:electron:win
```
Output: `dist/Dorchester 101-1.0.0.exe` (NSIS installer)

**Portable (No Installation):**
```bash
npm run build:electron:win
```
Output: `dist/Dorchester 101-1.0.0-portable.exe` (Run directly)

### Publishing to GitHub Releases (Auto-Updates)

```bash
npm run build:electron:win:publish
```

This will:
1. Build the app
2. Create release artifacts
3. Upload to GitHub Releases automatically
4. Users will be notified of updates on next launch

**Prerequisites:**
- GitHub personal access token (PAT) with `public_repo` scope
- Set environment variable: `GH_TOKEN=your_token`

## Automatic Updates

The app checks for updates:
- On every launch
- Every hour while running
- Silently downloads updates in the background
- Notifies user when ready to install

Users will see a notification in the bottom-right corner:
1. "Update Available" - downloading
2. "Update Ready to Install" - click "Restart Now" to apply

## Release Distribution

### GitHub Releases
Files are automatically published to GitHub Releases:
- `Dorchester 101-1.0.0.exe` - NSIS installer
- `Dorchester 101-1.0.0-portable.exe` - Portable (no install)
- `latest.yml` - Auto-updater manifest

### Direct Download
Users can download directly from: https://github.com/Nikoxkx/Dorchester-101/releases

### One-Click Setup
1. User downloads `.exe`
2. Double-click to run
3. Choose install or run directly
4. App launches immediately

## Code Signing (Optional)

To trust the app without SmartScreen warnings:

1. Acquire a Windows code signing certificate (EV recommended)
2. Update `scripts/sign.js` with your certificate path
3. Set environment variables:
   ```
   CERTIFICATE_FILE=path/to/cert.pfx
   CERTIFICATE_PASSWORD=your_password
   ```
4. Run `npm run build:electron:win:publish`

## Troubleshooting

### Electron fails to find Next.js build
- Ensure `npm run build` completes before building Electron
- Check `out/` directory exists

### Auto-updater not working
- Verify GitHub Releases have the latest `latest.yml`
- Check `GH_TOKEN` environment variable is set
- Ensure version in `package.json` is incremented

### App window is blank on launch
- Clear Electron cache: `~/.config/Dorchester 101/`
- Try portable version first
- Check dev console: press `Ctrl+Shift+I`

## Architecture

```
Electron Main Process
    ↓
Browser Window (BrowserView)
    ↓
Next.js App (Static Export)
    ↓
Web APIs / Backend
```

- **electron/main.js**: Electron entry point, window management, auto-updates
- **electron/preload.js**: IPC bridge between main and renderer
- **next.config.js**: Configured for static export (`output: 'export'`)
- **src/components/UpdateNotifier.tsx**: Update UI notifications

## Performance Optimizations

- Static site export (no server needed)
- Minimal Electron overhead (~150MB with app)
- Lazy-loading components
- Cached data for offline capability

## Migration from Web to Desktop

The same Next.js codebase serves both:
- **Web**: Deploy to Vercel / traditional hosting
- **Desktop**: Package with Electron

No code duplication required.

## Next Steps

1. **Create release workflow** (GitHub Actions) to automate builds
2. **Add code signing** for production releases
3. **Test on target machines** (Windows 10+)
4. **Gather feedback** from Dorchester users
5. **Monitor crash reports** and auto-update metrics

---

For questions or issues, open a GitHub issue: https://github.com/Nikoxkx/Dorchester-101/issues
