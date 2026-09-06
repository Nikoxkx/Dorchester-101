# DOR101 — Dorchester resources, live

> **Housing, food, transit, and rights for the Dot — with the source and the date on every number.**
>
> Free, open-source, privacy-first. No account. No tracking. No personal data leaves your device. 9 languages. Works offline. Ships as a web app (PWA) and a Windows desktop app from one codebase.

---

## What this is

DOR101 is a community resource hub for Dorchester, Boston — most of our neighbors are low-income and immigrant families navigating HUD income limits, BHA waitlists, SNAP paperwork, and MBTA disruptions, often in their second or third language. DOR101 puts the verified numbers and the phone numbers in one place:

- **Affordable housing** — income-restricted listings with waitlist status, an AMI calculator that computes against current HUD FY2026 limits, and a step-by-step application guide.
- **Housing projects** — BPDA-recorded developments, filterable and sortable, with unit counts, AMI breakdowns, and a detail view per project.
- **Market trends** — published rent/sale data with the source and as-of date on every chart (never presented as a live feed when it isn't one).
- **Food resources** — pantries and hot meals with parsed weekly hours ("open now" computed, not guessed), SNAP/EBT guide, directions, Project Bread hotline.
- **Map** — satellite/street tiles, toggleable resource layers, live MBTA predictions, MBTA service alerts.
- **Neighborhood guide** — a real profile per sub-neighborhood (Fields Corner, Savin Hill, Uphams Corner, Codman Square, and more), transit guide, tenant-rights basics.
- **Financial tools** — rent-burden calculator, AMI screener, document checklist. All math runs on-device; nothing you type is sent anywhere.
- **News** — live RSS aggregation from outlets that cover the neighborhood, pushed in real time.
- **Resource directory** — verified organizations by category with phones, languages, and last-verified dates.

## Privacy, stated plainly

- No accounts, no sign-ups, no analytics, no third-party trackers.
- Favorites, language, theme, text size, and checklist checkmarks are stored **only** in your browser's local storage (or Electron's local storage on desktop).
- The only network calls are to this app's own API routes and to public government data sources (MBTA API v3) plus RSS feeds from named news outlets.
- The document checklist and calculators never transmit what you enter.

## Real-time by design

One server-sent-events channel (`/api/notifications/stream`) pushes:

- **MBTA service alerts** for the Red Line, Fairmount Line, and main Dorchester buses (30-second server-side polling, diffed — clients only hear about changes);
- **new articles** in the news aggregation;
- **verified-dataset changes** (food hours, BPDA project records, program statuses).

Clients fall back to interval polling automatically when SSE can't connect (offline desktop, restrictive networks). MBTA predictions keep their 30-second refresh, wired through the same layer. Everything degrades to cached data offline — the service worker precaches the resource directory and food data, because unreliable data plans are a fact of life for this audience, not an edge case.

## Languages — full parity, enforced

English, Español, Kreyòl Ayisyen, Português, Tiếng Việt, Kriolu (Cape Verdean Creole), Soomaali, 中文, العربية (RTL).

Every dictionary is typed `Record<TranslationKey, string>` against the canonical English set — **a missing key in any language fails `tsc` and CI**, so partial translations cannot ship. Arabic flips the whole layout via CSS logical properties (`margin-inline-start`, `inset-inline-*`) — there are no LTR-only hard-coded directions. Numbers, dates, and currency format through `Intl` per locale (currency is always USD; this is Boston).

## Design system — Liquid Glass, black and white

Apple's Liquid Glass material, adapted for the web, in a strict black-and-white palette:

- **Two layers, strictly separated.** Glass belongs to the *control layer only* — nav bar, tab bar, sidebar, sheets, toasts, command palette, menus. Content (text, tables, charts, map tiles, forms) is always flat and opaque, at full contrast. No frosted content cards on a frosted background, ever.
- **Two glass weights.** `glass-regular` (36px blur, 170% saturation, `rgba(255,255,255,.68)` / `rgba(0,0,0,.62)`, specular top edge) for large chrome; `glass-clear` (18px blur, more transparent) for buttons, pills, and small controls. Both are translucent enough that the backdrop visibly shifts their tint.
- **True black dark mode** (`#000000`) and true white light — no off-blacks, no gray-on-gray.
- **Functional color only.** System red for emergencies, green for "available now," amber for pending. No brand gradients anywhere.
- **Squircles for real.** `corner-shape: superellipse(2.4)` where supported (Chromium 139+), with clean radius fallbacks elsewhere. Named radius scale: `xs/sm/md/lg/xl`.
- **Spring physics.** Framer Motion springs for every transition (controls `300/30`, sheets `220/26`); the nav and tab bars shrink on scroll-down and expand on scroll-up. `prefers-reduced-motion` and an in-app toggle remove decorative motion; `prefers-reduced-transparency` and an in-app toggle replace glass with solid surfaces.
- **Type scale follows Dynamic Type ratios** in `rem`, so the text-size setting scales the entire scale, not just body copy. System font stack (SF Pro → Inter → Segoe → Roboto); no webfont downloads.
- **One icon family** (Lucide) at one stroke weight throughout.

## Data integrity rules

1. Every number on screen names its source and shows an as-of/last-verified date — on the surface, not in a code comment.
2. If a source has no live feed, the UI says so ("published estimate," "last verified …") rather than dressing stale data as current. Rent/sale figures are labeled published estimates from named providers.
3. Nothing is invented. If it can't be traced to HUD, MBTA, BPDA, BHA, Census/ACS, Boston Open Data, or a named organization, it isn't shown.

## The stack

Next.js 16 (App Router) · TypeScript strict · Tailwind CSS 4 (CSS-first tokens) · Framer Motion springs · Zustand (persisted locally) · Leaflet + react-leaflet + Esri/CARTO tiles · Recharts · rss-parser · Node SSE. Electron 33 wraps the same app for Windows (spawns its own local Next server — fully offline-capable, never needs a database; Postgres/Drizzle remains optional and unused by default).

```bash
npm install
npm run dev            # web at localhost:3000
npm run test:run       # unit tests (calculators, parsers, i18n parity)
npm run build && npm start
npm run test:e2e       # Playwright + axe-core (EN, dark mode, RTL Arabic)
npm run electron:dev   # desktop
npm run build:exe      # Windows installer
```

## Accessibility

WCAG 2.2 AA is the bar, not the stretch goal: keyboard-navigable throughout (focus-visible rings everywhere, including on glass), skip link, focus-trapped sheets, `role`-correct menus and tabs, screen-reader text for icon-only controls, `aria-live` for filter results and notifications, axe-core sweeps in CI across light, dark, and RTL Arabic, and minimum-scale zoom never disabled.

## Repo layout

```
src/app/                 routes (pages + API route handlers)
src/components/glass/    the glass primitives (Surface, Sheet, Controls, Menu, Toaster)
src/components/layout/   sidebar, header, tab bar, palette, saved sheet
src/lib/i18n/            one typed dictionary per language (en is canonical)
src/lib/                 motion tokens, notifications builder, news parser, realtime hub
src/data/                sourced, dated datasets (HUD, MBTA, BPDA, food, resources)
public/logos/            partner marks + sourcing manifest (see below)
electron/                desktop shell (local server, no DB required)
```

### Organization logos — the honesty rule

Partner organizations are represented by their **real marks only**. `public/logos/MANIFEST.md` lists each organization, the exact file to drop in, the verified source URL, and its license status (U.S. government seals are public-domain works; community organizations' marks come from their own press pages). **Zillow and Redfin get text attribution, not their logos** — their brand guidelines restrict this kind of use, and mistyping that tradeoff for a school project would be worse than a wordmark. Until a mark's file is added, the UI renders a plain typographic chip — never a generated or approximated logo.

## Known limitations (stated, not hidden)

- **Boston Globe** is absent from the news aggregation: it discontinued public RSS feeds in 2023. Dorchester Reporter, Bay State Banner, Boston.gov, WBUR, and GBH cover the neighborhood.
- **Rent/sale figures** are published estimates (RentCafe, Redfin summaries, HUD FMR), not a live MLS feed — no open API exists without keys; the UI labels them as estimates with their month.
- **BPDA project records** are a curated, dated directory of significant Dorchester developments, linked to each project page — not a live scrape of Article 80 filings (no stable public feed); each record links to bostonplans.org.
- **FAQ long-form answers** are currently English-only prose; a per-answer note (in all 9 languages) offers the free 2-1-1 interpretation line, and translating legal-adjacent text responsibly is the next content milestone — machine-translating eviction guidance without review would be worse than being honest about the gap.
- **Partner logos** require manual addition per the manifest (licensing-safe sourcing); text chips render until then.
- **Somali, Kriolu, and Kreyòl strings** were written carefully for this rebuild but deserve review by native-speaker community members before being called final.

## What's next

1. Community translation review (Somali, Kriolu, Kreyòl, Vietnamese) with named reviewers.
2. Real logos per the manifest, and a "data sources" page aggregating every as-of date.
3. BPDA Article 80 filings via the Boston Open Data portal (CKAN) once a stable dataset key is confirmed.
4. Print-dedicated one-pagers per resource for appointment packets.

## License

MIT — see [LICENSE](LICENSE). Data belongs to its named sources; always confirm waitlists, hours, and eligibility with the agency before acting.
