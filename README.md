<div align="center">

  <img src="public/icon.svg" width="110" height="110" alt="DOR101 mark — a cobalt address plate with a knocked-out D" />

# DOR101 — Dorchester, Boston

**Every program that touches your block, on one board.**

Housing · Food · Transit · Tenant rights — a free community directory for
Dorchester with real phone numbers, dated sources, nine languages, no account,
no tracking.

</div>

---

## What this is

DOR101 is the neighborhood's own information board. It answers the questions
people actually ask on porches, at bus stops, and in front of the fridge:

- *"Is the Section 8 list open?"* — no, but public housing is, and here is the
  exact portal and phone number.
- *"Where can I eat tonight?"* — a searchable list of pantries and hot meals,
  with hours checked on a per-site date.
- *"How much rent can I afford?"* — a calculator that runs in your browser and
  never uploads your income.
- *"What is being built on that lot?"* — every BPDA development in the
  neighborhood, with its affordable-unit count.
- *"Who do I call when the heat is off?"* — hotlines, legal aid, and housing
  court, in plain English, Spanish, Haitian Creole, Portuguese, Vietnamese,
  Cape Verdean Kriolu, Somali, Mandarin, and Arabic.

### Standing rules

1. **No accounts, no ads, no tracking.** Nothing is collected; nothing is sold.
2. **Dates on everything.** Every figure carries the date it was verified.
3. **Numbers you can dial.** If an entry has no working phone or source link,
   it does not ship.
4. **Direct to the agency.** Outbound links go to the office that runs the
   program — never to a referral middleman.

---

## The design language — a "street index", not a template

The interface is built to feel like a municipal wayfinding system from the
year after print — information you trust at a glance, not a gallery page.

| System | Choice | Why |
|---|---|---|
| **Mark** | A cobalt address plate with a knocked-out slab-serif **D** | Reads at favicon size, prints on a receipt, and says "place + directory" without a picture of anything |
| **Display type** | **Barlow Condensed** (signage grotesque) | Condensed caps at 60–120 px are the visual identity of transit maps and municipal boards |
| **Body type** | **IBM Plex Sans** | Humanist, engineered for screens, calm at long paragraphs |
| **Meta type** | **IBM Plex Mono** | Dates, numbers, and file-like labels get the monospace "printed record" feel |
| **Palette** | Porcelain `#F4F6F8` paper, ink-navy `#111A2C` type, cobalt `#1748E2` actions, signal gold `#F4C400` highlights, alert red `#D22630` reserved for urgency | Cool paper + deep navy reads civic and printed; one saturated blue carries all primary actions; gold marks the few moments that need a human eye |
| **Shape** | 1–2 px corners, 1 px rules, no drop shadows, no gradients | A paper record with ink rules — nothing floats, everything is filed |
| **Motion** | 140 ms color/border transitions, arrow nudges on hover, nothing decorative | Motion is feedback, not decoration |
| **Icons** | Hand-drawn 24 px stroke set (`src/components/ui/icons.tsx`) — one weight, square caps, no fills | A single consistent line system instead of an icon library's mixed metaphors |

The signal stripe — cobalt, gold, red, four pixels tall — runs across the top
of the header and above the footer: a quiet reference to the MBTA map and the
Boston city flag, and the only place three colors touch.

Every page opens with the same masthead grammar: a monospace dateline
(`01 — Housing · AMI bands · waitlists · applications`), an uppercase condensed
headline, a two-sentence lede, and a heavy ink rule. Interior sections reuse
numbered lists, bordered tables, and status chips instead of stacked cards —
so the eye always knows what is *current*, what is *a record*, and what is
*an action*.

Fonts are self-hosted (`@fontsource`) — the production build never depends on
the Google Fonts network, and readers get identical type offline and in the
desktop app.

---

## What's inside

| Page | What it does | Where the data comes from |
|---|---|---|
| `/` | Program-status board, live news, Red Line fares, map preview | HUD, BHA, Mass.gov, MBTA, RSS |
| `/affordable-housing` | Income-restricted listings, waitlist status, AMI table, rent calculator | BPDA, BHA, HUD AMI/FMR, property managers |
| `/food` | Pantries & meals by neighborhood, SNAP amounts & apply links | Site-level verification + USDA/DTA |
| `/map` | Layered map: housing, food, transit, health, legal, community — live MBTA predictions on station click | Bundled verified pins + MBTA v3 API |
| `/projects` | BPDA development pipeline with affordable counts | BPDA public record |
| `/market-trends` | 24-month rent & sale series, rent-by-bedroom, affordability math | Public listing aggregates |
| `/neighborhood` | Squares & corridors, Red Line / Fairmount access, who represents you | City + MBTA |
| `/tools` | Rent-burden, AMI, and benefit calculators (all client-side) | HUD schedules |
| `/news` | Dorchester-matched headlines, no paywalled republishing | RSS feeds |
| `/resources` | Legal aid, clinics, community orgs with verified numbers | Organization-level checks |
| `/faq` | Straight answers on rights, deposits, heat, eviction, vouchers | Statutes + agency guidance |
| `/settings` | Language (9), theme, type size, reduce-motion — all local-only | — |

Desktop app adds **Directory → Refresh All** and **Generate Report** (opens
`/?report=1`, which prints a household snapshot from the dashboard).

---

## Content freshness — nothing is secretly hard-coded

The site's contract is: *every claim on screen states its source and its date.*

- **Program numbers** (`AMI`, `FMR`, `SNAP`, `RAFT`, BHA status, MBTA fares)
  live in one typed file, `src/data/programs.ts`, imported by every page and
  API route. Change a figure once and the whole site — including the report
  engine and the status board — follows.
- **Directory entries** (housing, food, resources, map pins, projects) carry
  `lastVerified` / `asOf` / `source` fields that render next to the data.
- **Live routes** (`/api/news`, `/api/mbta`, `/api/market-data`) fetch from
  upstream on each request and cache briefly; nothing about them is fabricated.
- The freshness handbook (see `CONTRIBUTING`) describes how to re-verify a
  figure: call the agency, update the date, ship.

### Verification workflow

1. Find the figure (e.g. BHA Section 8 status) in `src/data/programs.ts`.
2. Confirm it with the agency — every record lists its source URL and phone.
3. Update the value **and** its `asOf` / `lastReviewed` date in the same commit.
4. `npm test` guards the invariants (AMI math, FMR, SNAP amounts, fare levels)
   so a wrong edit fails loudly.

---

## Tech

- **Next.js 16 (App Router)** — static pages, dynamic `/api/*` routes
- **React 19 + TypeScript**, Tailwind CSS v4 design tokens in `globals.css`
- **Leaflet** (`react-leaflet`) for the neighborhood map
- **Recharts** for market series; **Zustand** for local preferences;
  **i18next** for nine languages
- **Playwright + Vitest** for e2e and unit tests
- **Electron + electron-builder** for the Windows desktop shell
- Zero runtime CDNs: fonts, icons, and the service worker are first-party

### Layout

```
src/
  app/            pages, /api routes, error/loading/not-found, PWA registration
  components/     layout chrome, dashboard, map, transit, ui atoms
  data/           typed, dated, sourced content (the "content layer")
  hooks/          useApi (SWR) + media queries
  lib/            i18n (9 languages), utils, validators, logger, cache
  stores/         local-only preferences (Zustand + persist)
public/           icon, manifest, service worker, offline page
electron/         desktop shell (main, preload, builder config)
```

## Development

```bash
npm install
npm run dev          # http://localhost:3000
npm run lint         # eslint
npm run typecheck    # tsc --noEmit
npm test             # vitest (data invariants, i18n, API)
npm run build        # production build
npm run build:exe    # Windows desktop build → dist-electron/
```

Update content? Edit the data files in `src/data/` — never page components for
copy changes.

## Privacy

There is no login, no analytics, no third-party script, and no advertising on
any route. Preferences are stored in `localStorage` on your device. The PWA
works offline with cached pages; nothing is uploaded.

## License

MIT — fork it, audit it, run your own copy. Pull requests that add verified
Dorchester resources are welcome.
