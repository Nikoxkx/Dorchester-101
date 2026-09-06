<p align="center">
  <img src="public/icon.svg" width="96" height="96" alt="DOR101 mark — three Dorchester rowhouses on a pine tile" />
</p>

<h1 align="center">DOR101 — The Dot desk</h1>

<p align="center">
  <strong>Your neighborhood. Your rights. Your future.</strong><br />
  The free, open-source neighborhood desk for Dorchester, Boston — housing, food,
  transit, tenant rights, and the agencies behind them.
</p>

<p align="center">
  <a href="#whats-on-the-desk">What's on the desk</a> ·
  <a href="#features">Features</a> ·
  <a href="#for-developers">For developers</a> ·
  <a href="#privacy">Privacy</a> ·
  <a href="#license">License</a>
</p>

---

## What this is

Dorchester is Boston's largest and most diverse neighborhood — 10 ZIP codes of
triple-deckers, squares, and the Red Line — and the information its residents
need (waitlist status, pantry hours, rent help, tenant rights) is scattered
across agency sites, PDFs, and rumor.

DOR101 is one desk for all of it:

- **Real phone numbers and real application links** — every listing verified against
  BPDA, BHA, HUD, or the organization itself, with the verification date shown.
- **Dated, attributed figures** — HUD FY2026 AMI and FMRs, SNAP allotments, RAFT caps,
  MBTA fares, BHA waitlist status. When a number changes, we change it and re-date it.
- **No account, no tracking, no ads.** Preferences live in your browser's local storage.
- **Nine languages**, including Haitian Creole, Cape Verdean Creole, Somali, and
  Vietnamese — with Arabic right-to-left layout.
- **Works on any screen** — phone, tablet, desktop, or the packaged Windows app.
  Installable as a PWA that keeps the emergency numbers on a bad-T-ride day.

This is not a city office, a housing authority, a law firm, or a newsroom. It is a
neighborhood desk: neighbors keeping the numbers straight, with sources.

---

## What's on the desk

| Area | What you'll find |
|---|---|
| **Dashboard** | Verified "today" status board (BHA, RAFT, SNAP, FMR), emergency hotlines, live news, Red Line board, and a one-page snapshot generator |
| **Affordable housing** | Income-restricted listings with open/closed waitlist badges, AMI band filter, FY2026 AMI tables, and application links |
| **Housing projects** | BPDA-tracked developments across Dorchester — units, AMI breakdowns, status, developer, BPDA links |
| **Market trends** | Published rent and sale estimates for ZIPs 02121–02125 with 24-month charts and a plain-English affordability read |
| **Food resources** | Pantries, hot meals, mobile markets with hours and open-now badges, plus SNAP/EBT numbers and the FoodSource hotline |
| **Neighborhood guide** | Every square — Fields Corner, Codman, Ashmont, Savin Hill, Uphams Corner, Lower Mills, and more — plus transit and tenant-rights primers |
| **Financial tools** | Rent-burden and AMI calculators that run entirely in your browser, and a document checklist for applications |
| **Map** | Satellite/street/hybrid map with six resource layers and live MBTA predictions refreshed every 30 seconds |
| **News** | Keyword-filtered feeds from the Dorchester Reporter, Boston.gov, WBUR, and GBH — the Dot's news, not the whole city's |
| **Directory** | Verified community organizations by category (housing, legal, health, food, jobs, family, emergency) |
| **FAQ** | Straight answers on Section 8, SNAP, eviction, RAFT, heat — each with sources |
| **Snapshot report** | `/api/report` — enter household size and income; get your AMI band, 2BR FMR rent burden, and which desk listings apply to you |

Everything content-ish lives in `src/data/` with its source and date. The UI never
invents a number.

---

## Design

DOR101 was visually rebuilt in September 2026 around a *community-greenline*
identity — street-level and civic, not corporate:

- **Palette:** warm paper `#F6F7F4`, pine `#0F2820`, transit red `#D7261E`,
  harbor `#1E6FA5`, leaf `#217A4C`, amber `#B7791F`.
- **Type:** Archivo for display and labels (tight, confident, readable at a glance),
  Atkinson Hyperlegible for body text (built for legibility), system monospace for
  dates and figures.
- **Mark:** three Dorchester rowhouses on a pine tile — a skyline that fits in a
  favicon and on a Windows installer.
- Rounded cards, pill actions, clear spacing, full dark mode, reduced-motion
  support, and print styles.

No gradients-as-decoration, no stock-photo hero, no tracking pixels.

---

## Supported languages

English, Spanish, Haitian Creole, Portuguese, Vietnamese, Cape Verdean Creole,
Somali, Mandarin Chinese, and Arabic (RTL). Translations cover the interface;
untranslated phrases fall back to English so nothing ever renders as a missing key.

---

## Download the desktop app

Windows builds (installer + portable) are published to
[GitHub Releases](https://github.com/Nikoxkx/Dorchester-101/releases/latest):

- **`DOR101 Setup 2.0.0.exe`** — standard installation with Start Menu and Desktop shortcuts
- **`DOR101-Portable-2.0.0.exe`** — no installation; runs from a USB drive

The desktop app embeds the Next.js build and serves it locally — same desk, same
privacy, no browser tabs needed. Native menus include **Refresh All** and
**Generate Report** (opens the snapshot generator on the dashboard).

> Windows SmartScreen may warn about unsigned software: **More info → Run anyway**.
> No database, API keys, or configuration required.

---

## For developers

### Requirements

- Node.js 20+ and npm
- PostgreSQL 15+ only if you self-host the optional database layer (the app runs
  fine without it — all data routes serve from `src/data/` plus public APIs)

### Quick start

```bash
git clone https://github.com/Nikoxkx/Dorchester-101.git
cd Dorchester-101
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Working on the web app only? You can skip the Electron binary download
(`ELECTRON_SKIP_BINARY_DOWNLOAD=1 npm install`) — everything except packaging
the Windows exe still works.

### Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build (web) |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript validation |
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | Playwright end-to-end tests |
| `npm run electron:dev` | Desktop app against the dev server |
| `npm run build:exe` | Build the Windows installer + portable exe |
| `npm run build:portable` | Build only the portable exe |

### Project structure

```
Dorchester-101/
├── .github/workflows/    # CI (lint, typecheck, tests, build, e2e) + release
├── electron/             # Desktop shell: main process, preload, menu, IPC
├── public/               # icon, manifest, service worker, offline page
├── scripts/              # Release helpers
└── src/
    ├── app/              # Next.js App Router pages + /api routes
    │   └── api/          # housing, food, map, mbta, news, stats, report…
    ├── components/       # Layout, dashboard, map, and UI components
    ├── data/             # Verified content: programs, listings, sites, orgs
    ├── hooks/            # useApi, useMediaQuery
    ├── lib/              # i18n (9 languages), utils, hours, cache, format tokens
    ├── stores/           # Zustand preferences (local only)
    └── types/            # Electron bridge types
```

### Data model

All published figures live in `src/data/`:

- `programs.ts` — HUD FY2026 AMI/FMR, SNAP, RAFT, BHA status, MBTA fares, LIHEAP, hotlines
- `housing.ts` — income-restricted listings and BPDA development projects
- `food.ts`, `resources.ts` — verified sites and organizations with hours and languages
- `map.ts` — map layers and transit lines
- `faq.ts`, `neighborhoods.ts` — answers and neighborhood profiles

Update a number → change it in the data file (with its `lastVerified`/`asOf` date) →
redeploy. Never hardcode figures in UI components.

### Updating translations

Add new UI strings to `src/lib/i18n.ts` under the English dictionary, then add
overrides per language. `useTranslation(language).t('key', fallback)` resolves
per-language → English → fallback, so a missing phrase never renders as a raw key.

---

## Data sources

All figures cite their source and date on-page. Core sources:

- HUD User — FY2026 income limits and Fair Market Rents (Boston-Cambridge-Quincy HMFA)
- Boston Housing Authority — waitlist status and applications (boston.myhousing.com)
- BPDA / Boston.gov — development projects and city services
- MBTA API v3 — predictions and alerts for the Red Line, Fairmount, and Dorchester buses
- Mass.gov / EOHLC — RAFT program rules
- USDA SNAP / Massachusetts DTA — allotments and applications
- RentCafe and Redfin — published neighborhood market estimates (labeled as estimates)
- Dorchester Reporter, WBUR, GBH — news feeds
- Community organizations — Project Bread, Mass 211, GBLS, ABCD, CSNDC, VietAID, City Life / Vida Urbana, and others (each verified and dated in `src/data/`)

---

## Privacy

- No personal data collected or transmitted
- No accounts, passwords, or sessions
- No analytics, tracking pixels, or ads
- Preferences are stored in `localStorage` on your device only
- Server calls target public government APIs; news is fetched and filtered server-side
- See [Privacy](src/app/privacy/page.tsx) and [Terms](src/app/terms/page.tsx) in the app

---

## Contributing

1. Verify every number against the cited public source before changing it
2. Record the check date (`lastVerified` / `asOf`) with each update
3. Add UI strings to `src/lib/i18n.ts`
4. Keep `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` green
5. Describe the change and its source clearly in the pull request

---

## License

MIT — see [LICENSE](LICENSE).

---

## Acknowledgments

DOR101 exists because the organizations of Dorchester publish their information and
answer their phones: Boston Housing Authority, BPDA, HUD, MBTA, Project Bread,
Mass 211, Greater Boston Legal Services, Greater Boston Food Bank, ABCD, CSNDC,
VietAID, City Life / Vida Urbana, Metro Housing|Boston, the Dorchester Reporter,
WBUR, and GBH. This desk is just the index. Check with them before you act —
waitlists, hours, and eligibility move fast.

---

**DOR101 — The Dot desk.** Free. Verified. Yours.
