# DOR101 — App Build Instructions

This repository contains both the web application (Next.js 16 App Router) and the Electron desktop wrapper. If you want to build and distribute from your own computer — or create a mobile/web app for college-facing presentations — follow these steps exactly.

---

## 1. Clone and install

```bash
git clone https://github.com/Nikoxkx/Dorchester-101.git
cd Dorchester-101
npm install
```

Requirements: Node.js 18+, npm, (optional) PostgreSQL 15+ if you want the database-backed features.

---

## 2. Run the web app locally

```bash
npm run dev
```

Open `http://localhost:3000`. All pages — including the new `/college-access` pathway — are fully server-rendered and client-hydrated.

---

## 3. Build for production (web)

```bash
npm run build
npm start
```

Output is in `.next/`.

---

## 4. Build the Windows Electron desktop app

```bash
npm run build:exe
```

Files will be in `dist-electron/`: installer (`DOR101 Setup 1.2.0.exe`) and portable (`DOR101-Portable-1.2.0.exe`). This is the exact command used for releases.

Note: Windows SmartScreen may warn about unsigned software. Click “More info” → “Run anyway.” The app requires no database, no API keys, and collects zero data.

---

## 5. Creating a mobile / PWA version from your computer

If you want a mobile app to show alongside the site — for example, a college-admissions presentation — the cleanest path is a Progressive Web App (PWA) rather than a native binary (which requires Apple Developer or Google Play accounts).

### Option A: PWA (preferred — works on any phone)

```bash
npm run build
# Serve `.next/` with a static server
npx serve .next -l 3000
```

Then open `http://your-ip:3000` on your phone, add to home screen, and it behaves like a native app. The site already includes `manifest.json` and `sw.js`.

### Option B: React Native / Expo (if you want native iOS/Android)

Because this repository is pure Next.js / TypeScript, you can wrap it using `react-native-web` or build a separate Expo app that points to the API routes (`/api/news`, `/api/map`, `/api/stats`). Example scaffold:

```bash
npx create-expo-app Dorchester101-Mobile --template blank-typescript
cd Dorchester101-Mobile
npm install axios
```

Then create screens that fetch from `http://localhost:3000/api/news` (or deploy the web app to Vercel and point to the live URL). The content is API-driven, so no hardcoded data needs to be rewritten.

---

## 6. Updating data without touching code

All content lives in `src/data/` (e.g., `college.ts`, `programs.ts`, `map.ts`). If you need to update a phone number or add a new shelter, edit the JSON/TS object and redeploy — never edit UI components for content changes.

---

## 7. Testing all new components

```bash
npm run test
npm run test:e2e
```

The `/college-access` page, redesigned homepage feature, and updated navigation are covered by the existing Playwright suite in `e2e/`.

---

## 8. Deploy to GitHub Pages / Vercel

Because this is a Next.js App Router site with API routes, deploy to Vercel for full functionality (API routes run server-side). Static export (`output: 'export'`) will break `/api/*` routes.

---

If any build step fails, check `next.config.ts` for `output: 'export'` — it must be removed for API routes to work.
