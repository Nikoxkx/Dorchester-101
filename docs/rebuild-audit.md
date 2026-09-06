# DOR101 Rebuild — Phase 1 Audit (internal note)

Date: 2026-09-06 · Branch: `arena/01a074b2-dorchester-101` · Baseline commit: `6c15e3b`

## What exists (verified by reading the code, not the README)

**Stack (matches hypothesis, plus):** Next.js 16.2.5 App Router, TS 5.9 strict, Tailwind 4.1,
Electron 33 (spawns an internal `next start` on port 3101 — fully self-contained, no DB required),
Postgres/Drizzle wired but optional, Zustand, Leaflet+react-leaflet+ESRI tiles, Recharts,
SWR/React Query both present (only `useApi` custom hook actually used), rss-parser, framer-motion 12.

**Routes (16):** `/`, `/projects`, `/affordable-housing`, `/market-trends`, `/map`, `/food`,
`/neighborhood`, `/tools`, `/news`, `/resources`, `/college-access`, `/faq`, `/settings`,
`/privacy`, `/terms` + error/not-found/loading.

**API routes (17):** news, notifications, mbta, market-data, stats, housing, food, resources,
map, neighborhoods, programs, faq, search, report, docs, health.

**Data layer:** `src/data/*` holds sourced figures (HUD FY2026 AMI/FMR, SNAP, RAFT, LIHEAP,
BHA status, MBTA fares, RentCafe/Redfin estimates) each with `source`, `sourceUrl`, and as-of
dates. Good discipline — keep it.

**What already works better than the spec assumed:**
- **News is NOT a hardcoded mock** — `/api/news` parses live RSS (Dorchester Reporter,
  Boston.gov, WBUR, GBH) with keyword relevance filtering, dedupe, in-memory cache.
  Missing from the spec's list: it already exists; it needs `revalidate`-based caching and
  needs the feed list re-verified.
- Notifications already mix live MBTA alert headers with program notices, but the build is
  server-side per-request and static per payload — **no SSE anywhere** (confirmed defect).
- PWA manifest + service worker exist (network-first, runtime caching only — no data precache).
- 363 unit tests, CI (lint → typecheck → test → build → e2e → deploy), Playwright config.

**Current visual language:** warm "newspaper desk" editorial style — bone/parchment/rust
palette, Atkinson Hyperlegible + Newsreader Google Fonts, 2px radii, serif mastheads.
The rebuild target (Liquid Glass, strict black/white, system SF stack) replaces this entirely.

## Defects found (beyond Section 5's list)

1. **i18n parity violation:** only `en` is complete; es/ht/pt/vi/zh/ar/so/kea are small
   partial dicts merged over English — most UI silently falls back to English. This is the
   largest gap. Fix: per-language modules with keys typed against the `en` dictionary so
   `typecheck` *enforces* parity.
2. `npm ci` fails — lockfile out of sync with package.json (fixed by regenerating).
3. `/api/health` test fails (route returns no `ok` field).
4. 8 lint errors (React Compiler rules: setState-in-effect, value mutation).
5. Formatting hardcodes `en-US` (no per-locale Intl) — `kea` also missing from locale map.
6. No favorites, no Web Share, no print stylesheet, no `/public/logos/` directory at all.
7. No axe-core anywhere; e2e covers only English.
8. `maximumScale: 5` viewport — fine, but `format-detection: telephone=no` while the whole
   app is about calling hotlines is wrong for mobile users; reconsider.
9. Hardcoded layout margins via inline `style` (not RTL-safe `margin-inline`).

## Rebuild plan (phases)

1. ✅ This audit.
2. Design tokens (`@theme` in Tailwind 4 CSS-first config) + glass primitives
   (`GlassSurface/GlassNav/GlassSheet/GlassButton/…`), squircle via `corner-shape` with
   `border-radius` fallback, spring tokens, reduced-motion/transparency fallbacks.
3. Realtime: `/api/notifications/stream` (SSE: MBTA alerts, BPDA filings, food-hour changes),
   `useRealtime` client hook w/ polling fallback for Electron, MBTA wired through the same
   layer, news moved to `revalidate` caching, health fix.
4. Section rebuilds against 6.1 + cross-cutting 6.2 (favorites store, share, print, toasts,
   loading/empty/error states, command palette).
5. i18n restructure + full 9-language parity; Intl formatting; RTL logical properties.
6. PWA/offline: SW precache of resource+food data, real PNG icons, offline page.
7. Tests: calculator + parser units, Playwright EN+AR, axe-core in CI.
8. Electron parity (new palette, offline behavior unchanged).
9. README/docs update.

## Honest constraints to log

- Boston Globe shut down its public RSS feeds (2023) — verify and, if dead, attribute
  headlines via its sitemap or log as limitation with reason.
- Zillow/Redfin: no open API without key → keep published-estimate approach w/ attribution
  text, no logo marks (brand guidelines).
- Somali/Kriolu/Kreyòl translations are written carefully but need community review — noted
  in README as next milestone.
