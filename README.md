<p align="center">
  <img src="docs/media/hero-4k.jpg" width="100%" alt="DOR101 — Boston skyline across Dorchester Bay at dusk. Your neighborhood. Your rights. Your future." />
</p>

<h1 align="center">DOR101 — Dorchester 101</h1>

<p align="center"><strong>Your neighborhood. Your rights. Your future.</strong></p>

<p align="center">
  <a href="https://github.com/Nikoxkx/Dorchester-101/releases/latest"><img alt="Version 4.0.0" src="https://img.shields.io/badge/version-4.0.0-14304F?style=for-the-badge&labelColor=0F1720"></a>
  <a href="LICENSE"><img alt="MIT licence" src="https://img.shields.io/badge/licence-MIT-C8102E?style=for-the-badge&labelColor=0F1720"></a>
  <img alt="9 languages" src="https://img.shields.io/badge/languages-9-E3B23C?style=for-the-badge&labelColor=0F1720">
  <img alt="No tracking" src="https://img.shields.io/badge/tracking-none-2F7A4C?style=for-the-badge&labelColor=0F1720">
  <img alt="Lint: 0 warnings" src="https://img.shields.io/badge/eslint-0_warnings-2F7A4C?style=for-the-badge&labelColor=0F1720">
</p>

DOR101 is a free, open-source guide to help in **Dorchester, Boston**: housing you can afford, food when money runs short, the bus or train that gets you there, and the legal rights that protect you as a tenant. Every number on the site is traced to the public authority that published it, every listing shows the date a resident last checked it, and the whole thing works in nine languages with **no account, no ads and no data collection**.

It ships as a website (installable as a PWA and usable offline) and as a Windows desktop application.

---

## Table of contents

1. [What's new in 4.0](#whats-new-in-40)
2. [Download & install](#download--install)
3. [Features](#features)
4. [Languages & accessibility](#languages--accessibility)
5. [Data sources](#data-sources)
6. [Technology](#technology)
7. [Architecture](#architecture)
8. [For developers](#for-developers)
9. [Configuration](#configuration)
10. [Testing & quality](#testing--quality)
11. [Privacy & security](#privacy--security)
12. [Contributing](#contributing)
13. [Image credits & licence](#image-credits--licence)

---

## What's new in 4.0

### Latest fix pass (4.1)

| Area | Change |
|------|--------|
| **News page layout repaired** | The "Where this comes from" note was nested *inside* the article/sidebar flex row, where it was squeezed into a third column and overlapped the filter panel at wide sizes. It is now a full-width block below both. The header no longer prints the page title twice (kicker + heading), and changing a filter or time window keeps the current list on screen (stale-while-revalidate) instead of collapsing to skeletons — only the very first load shows placeholders. |
| **No more needless refreshing** | The news panel polls at most once every five minutes (the server holds each feed mix for fifteen), only in a visible tab, and silent polls no longer flash an "updating" state over the list. The manual refresh button still spins honestly. |
| **Permissions asked plainly** | A dismissible dashboard card (also in Settings → Permissions & alerts) explains and requests the three optional browser capabilities: system **notifications** (wired to urgent transit/food notices when the tab is hidden), one-shot **geolocation** (map Locate + door-to-door directions), and **persistent offline storage**. Each row shows the browser's live verdict; nothing is required. |
| **Download the Windows app from the site** | `/api/download` resolves the newest GitHub release server-side (CSP keeps the browser same-origin) and the dashboard hero, the install banner and the About page offer the actual `.exe` — installer and portable — straight from the release. If GitHub is unreachable the button falls back to the last published release and says so. |
| **Project site imagery** | Aerial tiles for housing projects now try both Esri hosts per tile before giving up, and the stitched composite matches the 3:2 frame exactly (it was 4×3 tiles in a 3:2 box, which cropped and mis-scaled the picture). |
| **Map size always correct** | A ResizeObserver on the map canvas calls `invalidateSize` when the sidebar collapses or the layout reflows — previously only window resizes were handled, leaving grey gutters and offset clicks. |
| **AMI ladder survives outages** | HUD FY2026 Section 8 income limits (50% row cross-checked against two independent republications of the FY2026 table, plus the $171,400 area median) serve as a verified snapshot when huduser.gov is unreachable, so `/api/income-limits`, the market page's AMI card and the tools calculators stay populated and are marked "snapshot". |
| **Reproducible installs** | The lockfile's `es-to-primitive@1.3.4` entry carried pre-1.3 dependency metadata, so `npm ci` produced a tree whose ESLint chain could not even load. The entry is re-resolved from the registry (`es-abstract-get` included); `npm run lint` runs again with 0 warnings. Service-worker cache version bumped to v4.1.0. |
| **Live MBTA without an API key** | Arrivals and service alerts now come from the MBTA's **public GTFS-realtime CDN feeds** (`cdn.mbta.com/realtime/*.pb`). The v3 JSON API stays as an optional, faster path — but no longer requires a key; it was returning empty panels because anonymous v3 traffic is capped at 20 requests/minute across all consumers. |
| **Live HUD and wage data** | The AMI ladder, Fair Market Rent chart and the minimum-wage affordability card are read **from the publisher's own files at request time**: huduser.gov FY workbooks (xlsx) and the Commonwealth's statute page. No figure is copied into the repo, and when a source is unreachable the site says so instead of showing a stale number. |
| **Verified news feeds** | The news tab reads the four feeds that are actually live: Dorchester Reporter (`/feed/`), City of Boston news (`/rss/news`), WBUR (`rss.wbur.org`) and the Boston Globe's ARC outbound feed. Removed feeds that returned 404 or empty content (GBH, La Colmena, MBTA announcements) rather than shipping dead links. |
| **Self-healing map basemaps** | Every map and map preview walks a small list of public tile providers (Esri World Imagery on `services`/`server`, OSM streets) and switches automatically when one is unreachable, so a blocked tile host can never leave a blank rectangle. A street-style fallback also covers the satellite/hybrid views. |
| **Honest stops inventory** | `/api/mbta?type=stops` no longer returns an empty list when the JSON API is throttled — it falls back to the bundled GTFS station reference (labelled `timetable`) and upgrades to the full live list when an MBTA key is configured. |
| **News never goes blank** | When every requested publisher feed is unreachable (offline preview sandbox, publisher outage), `/api/news` serves a **verified point-in-time snapshot** of the same feeds — real stories, real URLs, real dates, captured 2026-09-06 — and the UI shows an amber "snapshot" note instead of pretending the stories are live. Live data always takes priority. |
| **Market page survives outages** | HUD FY27 Fair Market Rents for the Boston metro (verified copy of the published workbook) are shown only when huduser.gov is unreachable, marked as a snapshot; the Census metrics continue to say "unavailable" rather than substituting figures. |
| **Wrong-geography fix** | The Census fetcher was requesting **county 017 (Middlesex)** while the page label and the HUD fetcher said Suffolk County/Boston. It now requests **county 025** for both, with a unit test pinning the FIPS pair. |
| **Dependency hygiene** | Replaced the deprecated `xlsx` package (unmaintained, advisory-flagged) with `read-excel-file`, upgraded Next.js to 16.3.4 and pruned a stale axios dependency. `npm audit --omit=dev` (the shipped web app) reports **0 vulnerabilities**; `serverExternalPackages` keeps the workbook reader out of the server bundle so the market route compiles. The remaining advisories are all in the dev-only Electron packaging toolchain. |
| **Map preview never collapses** | The dashboard's `ssr:false` map loader now owns its height, so the pre-hydration skeleton can no longer render a zero-height blank box. |

### 4.0 launch

| Area | Change |
|------|--------|
| **Seven colour palettes** | Harbor (default), **Black & white**, Forest, Brick, Slate, Sand and Violet. Each has a light and a dark version, keeps the same contrast ratios, and is applied to the whole site — cards, buttons, charts, map controls — not just the header. Settings → Appearance. |
| **Door-to-door transit directions** | Every place on the map has a **Bus / train route** button. It asks the browser for your location once and opens Google Maps with the full route from where you stand, using live MBTA times. Apple Maps and walking routes are one tap away. |
| **Photographic brand** | The logo, favicon, PWA icons and the link-preview card are built from a real photograph of the Boston skyline seen across Dorchester Bay (Wikimedia Commons, CC BY-SA 3.0), not a generated illustration. |
| **Shareable & indexable** | A 1200×630 Open Graph / Twitter card (`/og.png`), `robots.txt`, `sitemap.xml`, canonical URLs and schema.org `WebSite` + `Organization` JSON-LD on every page. Pasting a link into iMessage, WhatsApp, Slack or X shows the logo, description and a preview. |
| **Clean dashboard map** | The dashboard map preview is now imagery only. Symbols and route lines belong to the full map page, where they are drawn correctly and cannot overflow neighbouring content. |
| **Zero-warning codebase** | Every `react-hooks/set-state-in-effect` and `exhaustive-deps` warning was fixed properly (lazy initialisers, `useSyncExternalStore`, render-time comparisons) rather than suppressed. `npm run lint` reports 0 errors, 0 warnings. |
| Also | Glass/transparent surface toggle, per-project site imagery with "no render published" fallbacks, neighbourhood photographs, housing primer, source badges with hover previews, PlaceSheet redesign, stronger settings contrast, console-error clean-up. |

---

## Download & install

### Web / PWA

Open the deployed site, then use your browser's **Install** / **Add to Home Screen** option. DOR101 registers a service worker that pre-caches the app shell, the directory data, source badges and icons, so the directory, map places, FAQ and hotlines keep working with no signal. Live MBTA predictions and news naturally need a connection.

### Windows desktop

Download from [GitHub Releases](https://github.com/Nikoxkx/Dorchester-101/releases/latest):

| File | Use it when |
|------|-------------|
| `DOR101 Setup 4.0.0.exe` | You want Start Menu and Desktop shortcuts. |
| `DOR101-Portable-4.0.0.exe` | You are on a library or shelter computer, or a USB stick — no install, no admin rights. |

> Windows SmartScreen may warn that the build is unsigned. Choose **More info → Run anyway**. No database, API key or configuration is required.

---

## Features

<p align="center"><img src="docs/media/banner-savin-hill.jpg" width="100%" alt="Dorchester Bay from Savin Hill" /></p>

### Housing

* **Affordable housing directory** — income-restricted listings with an AMI calculator that tells you which bracket (30 / 50 / 60 / 80 / 100 %) your household lands in and what you can actually apply for.
* **Housing projects** — every BPDA-approved and under-construction development in Dorchester with unit counts, income breakdown, developer, approval date, official filing links and, where the developer published one, the site render. Where no render exists the card says so instead of guessing.
* **Housing primer** — Section 8, BHA public housing, Metrolist, inclusionary units, lotteries and the Massachusetts right-to-counsel pilot, in plain language, with links to the primary sources.
* **Market trends** — HUD Fair Market Rents and Section 8 income limits read live from huduser.gov, Census ACS (when the Bureau's API key is configured) and the median household income series for Suffolk County from the St. Louis Fed (SAIPE), with an AMI ladder labelled with the fiscal year it came from.
* **Financial tools** — rent-burden calculator, eligibility screener, document checklist.

<p align="center"><img src="docs/media/banner-fields-corner.jpg" width="100%" alt="Fields Corner station on the Red Line" /></p>

### Map & transit

* Satellite, street and hybrid views (Esri World Imagery and OpenStreetMap).
* Six resource layers — housing, food, health, legal, education, community — with category pins and a **PlaceSheet** panel that never overlaps other map controls.
* **Live MBTA departures** for the Red Line (Ashmont and Braintree branches), Fairmount Line and the bus routes that serve Dorchester, from the MBTA's public GTFS-realtime feed (the v3 JSON API is used only when a key is configured).
* Route geometry from MBTA shapes with an offline fallback path for each line, and service alerts from the authority's real-time alert feed.
* Transit, walking and Apple Maps directions from your location.

<p align="center"><img src="docs/media/banner-ashmont.jpg" width="100%" alt="Ashmont station from Peabody Square" /></p>

### Food, health, legal & community

* **Food** — pantries, hot meals, community fridges, mobile markets, with hours, languages spoken, whether ID is needed, and a SNAP / WIC / HIP eligibility guide.
* **Resource directory** — organisations by category, each with a *last verified* date, a source badge and a "report a problem" button that pre-fills a GitHub issue.
* **Emergency hotlines** pinned to the dashboard: 911, 311, 211, the BHA emergency line, Mass 2-1-1 shelter, Safelink and the 988 crisis line.
* **News** — live feed from the Dorchester Reporter, WBUR, GBH and the Globe's Dorchester coverage, filterable by topic.
* **FAQ** — questions residents actually asked, answered with citations.

<p align="center"><img src="docs/media/banner-uphams-corner.jpg" width="100%" alt="S. B. Pierce Building at Uphams Corner" /></p>

### Neighbourhood guide

Profiles of Fields Corner, Savin Hill, Uphams Corner, Ashmont, Codman Square, Grove Hall, Four Corners, Neponset, Lower Mills, Bowdoin–Geneva, Meeting House Hill, Columbia Point and Harbor Point — history, transit, landmarks, and a photograph from Wikimedia Commons that appears only while that profile is open.

### Personalisation & settings

* Seven colour palettes × light / dark / system.
* Solid or glass (translucent) surfaces.
* Four text sizes, dyslexia-friendly font, reduced motion, high contrast.
* Read-aloud for any page using the browser's speech engine, in the language you selected.
* Language, palette and every other preference is stored on the device only.

---

## Languages & accessibility

| | Language | Code | Notes |
|-|----------|------|-------|
| 🇺🇸 | English | `en` | source strings |
| 🇲🇽 | Spanish | `es` | |
| 🇭🇹 | Haitian Creole | `ht` | |
| 🇧🇷 | Portuguese | `pt` | |
| 🇻🇳 | Vietnamese | `vi` | |
| 🇨🇳 | Chinese (Simplified) | `zh` | |
| 🇸🇦 | Arabic | `ar` | full right-to-left layout |
| 🇸🇴 | Somali | `so` | |
| 🇨🇻 | Cape Verdean Creole | `kea` | |

The nine languages are the languages Boston Public Schools reports as most spoken in Dorchester homes. A Vitest suite fails the build if any locale is missing a key that English has, so a feature cannot ship half-translated.

Accessibility: WCAG 2.2 AA contrast in every palette, full keyboard navigation, skip links, a polite live region for status changes, `prefers-reduced-motion` and `prefers-contrast` honoured, focus-visible rings throughout, semantic landmarks on every page, and a print stylesheet for the directory and hotlines.

---

## Data sources

Every figure carries a badge naming its source; hover or tap the badge to see what the source is and when the data was pulled. Nothing is sourced from scraped commercial listings, social media or anonymous forums.

| Source | What DOR101 uses it for |
|--------|-------------------------|
| **U.S. Census Bureau — ACS 5-year** | Population, income, rent burden, languages spoken (via the Census API when a key is configured; the app reports an honest "unavailable" otherwise) |
| **HUD User (huduser.gov workbooks)** | Fair Market Rents and Section 8 income limits, read live from the FY xlsx files |
| **MBTA GTFS-realtime (cdn.mbta.com)** | Live arrivals, service alerts and trip updates — no API key |
| **MBTA V3 API** | Optional enrichment (full stop/shape inventory, richer fields) when `MBTA_API_KEY` is set |
| **Federal Reserve Bank of St. Louis (FRED)** | Annual median household income for Suffolk County (Census SAIPE derived series, no key) |
| **Mass.gov** | The Massachusetts minimum wage and service rate, read from the Commonwealth's statute page |
| **Boston Housing Authority** | Public housing, Section 8, waitlist status |
| **Boston Planning & Development Agency** | Development projects, Article 80 filings, IDP units |
| **Boston.gov / Mayor's Office of Housing** | Metrolist, AMI table, Office of Housing Stability programs |
| **Mass.gov / DHCD / DTA** | RAFT, HomeBASE, SNAP, WIC, HIP |
| **Greater Boston Food Bank** | Pantry network and hours |
| **MassLegalHelp / Greater Boston Legal Services** | Tenant rights, eviction process, right-to-counsel |
| **OpenStreetMap contributors** | Street tiles and geocoding |
| **Esri World Imagery** | Satellite tiles |
| **Wikimedia Commons** | Photographs (each with its author and licence in `public/IMAGE-CREDITS.md`) |
| **Dorchester Reporter, City of Boston, WBUR, The Boston Globe** | News feed (headline, link and excerpt only) — the four feeds are individually verified live |

---

## Technology

<p align="center">
  <a href="https://nextjs.org"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg" width="56" height="56" alt="Next.js" title="Next.js 16" /></a>&nbsp;&nbsp;&nbsp;
  <a href="https://react.dev"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg" width="56" height="56" alt="React" title="React 19" /></a>&nbsp;&nbsp;&nbsp;
  <a href="https://www.typescriptlang.org"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg" width="56" height="56" alt="TypeScript" title="TypeScript 5 (strict)" /></a>&nbsp;&nbsp;&nbsp;
  <a href="https://tailwindcss.com"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg" width="56" height="56" alt="Tailwind CSS" title="Tailwind CSS 4" /></a>&nbsp;&nbsp;&nbsp;
  <a href="https://www.electronjs.org"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/electron/electron-original.svg" width="56" height="56" alt="Electron" title="Electron 33" /></a>&nbsp;&nbsp;&nbsp;
  <a href="https://nodejs.org"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg" width="56" height="56" alt="Node.js" title="Node.js 20+" /></a>&nbsp;&nbsp;&nbsp;
  <a href="https://vitest.dev"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vitest/vitest-original.svg" width="56" height="56" alt="Vitest" title="Vitest" /></a>&nbsp;&nbsp;&nbsp;
  <a href="https://playwright.dev"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/playwright/playwright-original.svg" width="56" height="56" alt="Playwright" title="Playwright" /></a>&nbsp;&nbsp;&nbsp;
  <a href="https://eslint.org"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/eslint/eslint-original.svg" width="56" height="56" alt="ESLint" title="ESLint 9 (flat config)" /></a>&nbsp;&nbsp;&nbsp;
  <a href="https://www.postgresql.org"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg" width="56" height="56" alt="PostgreSQL" title="PostgreSQL (optional)" /></a>&nbsp;&nbsp;&nbsp;
  <a href="https://github.com/features/actions"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/githubactions/githubactions-original.svg" width="56" height="56" alt="GitHub Actions" title="GitHub Actions CI" /></a>&nbsp;&nbsp;&nbsp;
  <a href="https://www.python.org"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg" width="56" height="56" alt="Python" title="Python (i18n tooling)" /></a>
</p>
<p align="center">
  <a href="https://leafletjs.com"><img src="https://leafletjs.com/docs/images/logo.png" height="40" alt="Leaflet" title="Leaflet + react-leaflet" /></a>&nbsp;&nbsp;&nbsp;&nbsp;
  <a href="https://www.openstreetmap.org"><img src="https://upload.wikimedia.org/wikipedia/commons/b/b0/Openstreetmap_logo.svg" height="48" alt="OpenStreetMap" title="OpenStreetMap tiles" /></a>&nbsp;&nbsp;&nbsp;&nbsp;
  <a href="https://www.mbta.com/developers/v3-api"><img src="https://upload.wikimedia.org/wikipedia/commons/6/6a/MBTA.svg" height="48" alt="MBTA" title="MBTA V3 API" /></a>&nbsp;&nbsp;&nbsp;&nbsp;
  <a href="https://recharts.org"><img src="https://raw.githubusercontent.com/recharts/recharts/master/website/src/assets/images/recharts-logo.svg" height="44" alt="Recharts" title="Recharts" /></a>&nbsp;&nbsp;&nbsp;&nbsp;
  <a href="https://zustand-demo.pmnd.rs"><img src="https://raw.githubusercontent.com/pmndrs/zustand/main/examples/demo/public/favicon.ico" height="44" alt="Zustand" title="Zustand" /></a>&nbsp;&nbsp;&nbsp;&nbsp;
  <a href="https://lucide.dev"><img src="https://lucide.dev/logo.light.svg" height="44" alt="Lucide" title="Lucide icons" /></a>&nbsp;&nbsp;&nbsp;&nbsp;
  <a href="https://orm.drizzle.team"><img src="https://orm.drizzle.team/favicon.ico" height="44" alt="Drizzle ORM" title="Drizzle ORM (optional)" /></a>&nbsp;&nbsp;&nbsp;&nbsp;
  <a href="https://sharp.pixelplumbing.com"><img src="https://sharp.pixelplumbing.com/sharp-logo.svg" height="44" alt="sharp" title="sharp (icon & OG pipeline)" /></a>
</p>

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | **Next.js 16**, App Router, React 19 | Server components for the data-heavy pages, route handlers for the MBTA / news proxies, `metadata` API for SEO. |
| Language | **TypeScript 5**, `strict` | Every dataset is typed; a wrong AMI column fails to compile. |
| Styling | **Tailwind CSS 4** + CSS custom properties | Palettes, surfaces and dark mode are token swaps on `<html>`; components never hard-code a colour. |
| State | **Zustand** with `persist` | Preferences survive reloads; nothing leaves the device. |
| Maps | **Leaflet 1.9** / **react-leaflet 5** | Esri World Imagery + OpenStreetMap tiles, MBTA shape polylines, custom SVG pins. |
| Charts | **Recharts** | Market and demographic charts that inherit the palette. |
| Icons | **Lucide** | Consistent stroke icons; source badges are hand-drawn SVGs in `public/sources/`. |
| i18n | Hand-rolled typed dictionaries | 9 locales, `TranslationKey` union, parity test, `scripts/i18n-add.py` helper. |
| Offline | Service worker (`public/sw.js`) | Versioned cache of shell, data, badges and icons; stale-while-revalidate for the rest. |
| Desktop | **Electron 33** + electron-builder | NSIS installer and portable exe. |
| Images | **sharp** | Generates the logo set, PWA icons and Open Graph card from the source photograph. |
| Database | **PostgreSQL** + **Drizzle ORM** (optional) | Only for deployments that want to edit listings through an admin UI; the default build is fully static JSON. |
| Testing | **Vitest**, **Playwright**, **ESLint 9** | Unit + i18n parity, end-to-end, lint at 0 warnings. |
| CI | **GitHub Actions** | typecheck → lint → test → build on every push. |

---

## Architecture

```
Dorchester-101/
├── .github/workflows/          CI: typecheck, lint, test, build
├── docs/media/                 4K README imagery (generated by sharp from Commons photos)
├── electron/                   main process, preload, builder config
├── e2e/                        Playwright specs
├── public/
│   ├── icons/                  PWA icons (photographic logo, 192–1024 px, maskable)
│   ├── img/                    neighbourhood & project photos (see IMAGE-CREDITS.md)
│   ├── sources/                one SVG badge per data source
│   ├── logo.png, og.png        brand mark and link-preview card
│   ├── manifest.json, sw.js    PWA manifest and versioned service worker
│   └── IMAGE-CREDITS.md        author + licence for every photograph
├── scripts/
│   └── i18n-add.py             add a key to all nine locales at once
└── src/
    ├── app/                    routes (App Router)
    │   ├── api/                mbta/, news/, og/ route handlers (server-side proxies)
    │   ├── housing/ projects/ market/ map/ food/ resources/ news/ faq/ about/ settings/
    │   ├── layout.tsx          metadata, JSON-LD, providers
    │   ├── robots.ts sitemap.ts
    │   └── globals.css         design tokens, palettes, surfaces, print
    ├── components/
    │   ├── layout/             Sidebar, Header, ProjectNote, footer
    │   ├── map/                DorchesterMap, MapCanvas, MapPreview, PlaceSheet, pins
    │   ├── housing/ projects/ dashboard/ sources/ search/ a11y/ pwa/ providers/ ui/
    ├── data/                   typed datasets: resources, transit, projects, neighborhoods, sources
    ├── hooks/                  useResolvedPrefs, useOnline, useReadAloud, useMediaPreferences…
    ├── i18n/                   en.ts (source of truth) + locales/*.ts + config
    ├── lib/                    geo (haversine, directions URLs), mbta client, site constants
    ├── stores/appStore.ts      Zustand: language, theme, palette, surface, font, a11y
    └── db/                     Drizzle schema (optional)
```

**Rendering model.** Pages are server components that import typed JSON datasets; only interactive islands (map, search, settings, charts) are client components. The MBTA and news feeds are fetched by route handlers on the server so the browser never talks to a third party directly and API keys stay server-side.

**Theming model.** `DorchesterProviders` writes `data-theme`, `data-palette`, `data-surface`, `data-font-size` and `dir` onto `<html>` from the store. `globals.css` defines the tokens (`--color-bg-*`, `--color-text-*`, `--color-accent-*`, `--color-border`, `--color-on-accent`) once per palette × light/dark. Components reference tokens only, which is what makes a whole-site palette a 40-line CSS block instead of a refactor.

**Offline model.** `sw.js` has a `VERSION` constant; bumping it invalidates every cache on the next visit. Shell and data are cache-first, API routes are network-only with a friendly offline message, everything else is stale-while-revalidate.

---

## For developers

### Requirements

* Node.js 20 or later (22 recommended)
* npm 10+
* Python 3 (only for `scripts/i18n-add.py`)
* PostgreSQL 15+ (optional, only if you enable the database)

### Quick start

```bash
git clone https://github.com/Nikoxkx/Dorchester-101.git
cd Dorchester-101
npm ci
npm run dev          # http://localhost:3000
```

### Commands

| Command | What it does |
|---------|--------------|
| `npm run dev` | Next.js dev server with Turbopack |
| `npm run build` | Production build (also validates metadata, sitemap, robots) |
| `npm run start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint 9 flat config — must be 0 errors / 0 warnings |
| `npm run test` | Vitest unit tests incl. i18n parity |
| `npm run test:e2e` | Playwright end-to-end |
| `npm run electron:dev` | Run the desktop shell against the dev server |
| `npm run build:exe` | Windows installer (`dist-electron/`) |
| `npm run build:portable` | Windows portable exe |

### Adding a translated string

```bash
cat > key.json <<'EOF'
{ "settings.palette.forest": { "en": "Forest", "es": "Bosque", "ht": "Forè", "pt": "Floresta",
  "vi": "Rừng", "zh": "森林", "ar": "غابة", "so": "Kayn", "kea": "Floresta" } }
EOF
python3 scripts/i18n-add.py --from key.json --apply
```

The key becomes part of the `TranslationKey` union immediately, so `t('settings.palette.forest')` type-checks and the parity test passes.

### Regenerating brand assets

The logo set and Open Graph card are generated from `public/img/dorchester-bay-sunset.jpg` with sharp. The recipes live in the git history of `public/icons/` and `public/og.png`; rerun them whenever the source photograph or wordmark changes, then bump `VERSION` in `public/sw.js`.

---

## Configuration

All variables are optional; the site runs with none of them.

| Variable | Default | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Canonical origin for `metadataBase`, sitemap, robots, JSON-LD and the OG image URL. **Set this in production** or social previews will point at localhost. |
| `NEXT_PUBLIC_APP_VERSION` | `4.0.0` | Shown in About and the footer. |
| `MBTA_API_KEY` | — | Raises the MBTA rate limit from 20 to 1000 req/min. Server-side only. |
| `DATABASE_URL` | — | Enables the Drizzle/PostgreSQL admin path. |

---

## Testing & quality

* **Type safety** — TypeScript `strict`; every dataset and translation key is typed.
* **Lint** — ESLint 9 with `next/core-web-vitals` and `react-hooks` (including the React 19 `set-state-in-effect` rule). Zero warnings.
* **Unit** — Vitest (`src/__tests__/`): API route validation, app store, opening-hours logic, transit data integrity, i18n parity across all nine locales.
* **E2E** — Playwright (`e2e/app.spec.ts`) smoke-tests the main routes.
* **Data review** — every resource carries a *last verified* date shown in the UI; `lastReviewedOn()` feeds the sitemap so crawlers see real change dates.

---

## Privacy & security

* No accounts, cookies, analytics, fingerprinting, or third-party scripts.
* Preferences live in `localStorage` on the device and can be wiped from Settings → Reset.
* The **Bus / train route** button asks for your location only when you tap it, uses it once to build a Google or Apple Maps link, and never stores or transmits it.
* Third-party data (MBTA, news) is fetched by the server, so those providers never see the visitor's IP or browser.
* Content Security Policy, `Referrer-Policy: strict-origin-when-cross-origin` and `Permissions-Policy` headers are set in `next.config.ts`.
* The Electron build disables `nodeIntegration`, enables `contextIsolation` and loads only the bundled app.

---

## Contributing

1. **Verify first.** Every new listing, figure or claim needs a link to the authority that published it and a `lastVerified` date. Nothing from social media, ads or anonymous forums.
2. **Translate everything.** Use `scripts/i18n-add.py`; the build fails on a missing key.
3. **Use tokens, not colours.** Components reference `var(--color-…)`; never a hex value. Test your change in Black & white and at least one other palette, light and dark.
4. **No overlap.** Popups, sheets and toasts must not cover map controls, navigation or each other. Animations respect `prefers-reduced-motion`.
5. **Photos** come from Wikimedia Commons or an official publisher, with author and licence added to `public/IMAGE-CREDITS.md`. If no photo exists for a place, say so in the UI rather than substituting a look-alike.
6. Run `npm run typecheck && npm run lint && npm run test && npm run build` before opening a pull request.

---

## Image credits & licence

Photographs are from Wikimedia Commons and are credited individually — author, licence and source URL — in [`public/IMAGE-CREDITS.md`](public/IMAGE-CREDITS.md). The hero image and logo use *Boston skyline from Dorchester Bay* by Sswonk, CC BY-SA 3.0. Section banners in this README are the same Commons photographs with a caption overlay; the caption text is set smaller and letter-spaced so it never collides with the section label. Technology logos in this README are the trademarks of their respective projects and are used for identification only. Source badges in `public/sources/` are original icons drawn for DOR101 and do not reproduce any agency's trademark.

Code is released under the **MIT licence** — see [LICENSE](LICENSE). Third-party components keep their own licences:

| Component | Licence |
|-----------|---------|
| [Leaflet](https://github.com/Leaflet/Leaflet) (map engine) | BSD-2-Clause |
| [react-leaflet](https://github.com/PaulLeCam/react-leaflet) | MIT |
| [gtfs-realtime-bindings](https://github.com/MobilityData/gtfs-realtime-bindings) (MBTA protobuf feeds) | Apache-2.0 |
| [protobufjs](https://github.com/protobufjs/protobuf.js) | BSD-3-Clause |
| [SheetJS `xlsx`](https://github.com/SheetJS/sheetjs) (HUD workbooks) | Apache-2.0 |
| [Recharts](https://github.com/recharts/recharts) | MIT |
| [Framer Motion](https://github.com/framer/motion) | MIT |
| [Lucide icons](https://lucide.dev) | ISC |
| [Zod](https://zod.dev), [SWR](https://swr.vercel.app), [Zustand](https://github.com/pmndrs/zustand), [date-fns](https://date-fns.org), [Cheerio](https://cheerio.js.org), [rss-parser](https://github.com/rbren/rss-parser) | MIT |
| Fonts (Public Sans, Fraunces, Atkinson Hyperlegible, IBM Plex Mono, Noto Sans Arabic) | SIL Open Font License 1.1 (fontsource packages) |
| **OpenStreetMap** | Tiles © OpenStreetMap contributors, ODbL; attribution is shown on every map |
| **Esri World Imagery / World Street Map** | Esri terms of use; attribution is shown on every map |
| Wikimedia Commons photographs | CC BY-SA 3.0 / CC BY 2.0 as credited in `public/IMAGE-CREDITS.md` |

Map and chart attribution is rendered in-app, not only in this file, so the licences travel with the data.

---

## Acknowledgments

DOR101 exists because public agencies and community organisations publish their data openly: the Boston Housing Authority, the BPDA, the Mayor's Office of Housing, the Office of Housing Stability, the MBTA, HUD, the U.S. Census Bureau, the Greater Boston Food Bank, Project Bread, Greater Boston Legal Services, MassLegalHelp, City Life / Vida Urbana, CSNDC, DBEDC, VietAID, ABCD, the Dorchester Reporter, WBUR and GBH — and the Wikimedia Commons photographers who documented the neighbourhood.

<p align="center"><strong>DOR101 — Dorchester 101</strong><br/><em>Your neighborhood. Your rights. Your future.</em></p>
