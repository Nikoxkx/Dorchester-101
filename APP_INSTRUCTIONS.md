# DOR101 — Build & Run Instructions

This repository contains the web app (Next.js 16, App Router) and the Windows
desktop wrapper (Electron). Everything below runs without API keys or a database.

---

## 1. Clone and install

```bash
git clone https://github.com/Nikoxkx/Dorchester-101.git
cd Dorchester-101
npm install
```

Requirements: Node.js 20+, npm.

Web-only development? Skip the Electron binary download:

```bash
ELECTRON_SKIP_BINARY_DOWNLOAD=1 npm install
```

---

## 2. Run the web app locally

```bash
npm run dev
```

Open `http://localhost:3000`. All pages are server-rendered and client-hydrated;
content comes from `src/data/` through `/api/*` routes.

---

## 3. Build for production (web)

```bash
npm run build
npm start
```

---

## 4. Build the Windows Electron app

```bash
npm run build:exe
```

Output lands in `dist-electron/`:

- `DOR101 Setup 2.0.0.exe` — installer
- `DOR101-Portable-2.0.0.exe` — portable build

Windows SmartScreen may warn about unsigned software: **More info → Run anyway**.
The app requires no database, no API keys, and collects no data.

---

## 5. Use it on a phone (PWA)

DOR101 is installable as a Progressive Web App:

```bash
npm run build
npm start
```

Open the site on your phone, then **Add to Home Screen**. `public/manifest.json`
and the service worker provide the offline shell and emergency numbers.

For a native wrapper, build an Expo/React Native app that calls the same routes
(`/api/news`, `/api/map`, `/api/stats`, `/api/report`) — content is API-driven.

---

## 6. Update content without touching UI

All content lives in `src/data/`:

| File | Content |
|---|---|
| `programs.ts` | HUD FY2026 AMI + FMR, SNAP, RAFT, BHA status, MBTA fares, hotlines |
| `housing.ts` | Income-restricted listings, BPDA projects |
| `food.ts` / `resources.ts` | Pantries, meals, community organizations |
| `map.ts` | Map layers and transit lines |
| `faq.ts` / `neighborhoods.ts` | Answers and neighborhood profiles |

Edit the record (including its `lastVerified`/`asOf` date) and redeploy —
never edit UI components for content changes.

---

## 7. Quality gates

```bash
npm run lint
npm run typecheck
npm test          # unit tests
npm run build
npm run test:e2e  # Playwright (needs `npx playwright install chromium` first)
```

---

## 8. Deploy

This is a Next.js App Router app with API routes — deploy to Vercel (or any Node
host) for full functionality. Static export would break `/api/*`.

Release builds are automated by `.github/workflows/release.yml` when a `v*` tag
is pushed (Windows only). CI runs lint, typecheck, unit tests, build, and e2e on
every push/PR via `.github/workflows/ci.yml`.
