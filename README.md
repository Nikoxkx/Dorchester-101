<img width="3840" height="2160" alt="dorchester-101-rebuilt" src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1440&q=80" />

# DOR101 — Dorchester 101

> **Your neighborhood. Your rights. Your future.**
>
> A free, open-source community resource hub rebuilt from the ground up. No generic templates. No AI copy. No hidden tracking. Just verified information — housing, food, legal aid, transit, college access — in an editorial design system that respects the people who use it.

---

## What this is

DOR101 brings together public data from HUD, MBTA, BPDA, Boston Housing Authority, CSNDC, Greater Boston Legal Services, UMass Boston, and Princeton University into one readable place — across 9 languages, with no account required and zero data collection.

This is not a template. Every component — from the serif editorial masthead to the interactive map legend — has been rebuilt with original code, a custom palette (`bone` / `rust` / `indigo` / `ochre` / `sage` / `charcoal`), and intentional asymmetry. The design signals what it is: human-made, place-based, trustworthy.

---

## The redesign (2026-09-06)

| Area | Before | After |
|---|---|---|
| **Color system** | Generic paper/ink | Original `bone` / `rust` / `indigo` / `ochre` palette with full dark mode |
| **Typography** | Default sans-serif headings | `Newsreader` display serif + `Atkinson Hyperlegible` UI font |
| **Layout** | Rigid 12-column grid | Broken grid, asymmetrical editorial sections, left-rule quotes |
| **Map** | Standard toggle controls | Custom checkbox styling, editorial layer labels, live MBTA predictions |
| **Dashboard** | Generic stat cards | Red-rule stat cards, paper-noise texture banners, featured hotline layout |
| **College access** | Not present | Full `/college-access` pathway aligned with Princeton values (Excellence, Imagination, Craftsmanship, Cosmopolitanism, Boldness) |
| **App / Desktop** | Basic Electron wrapper | Native menu (Generate Report, Export College Pathway, Refresh All), complex IPC handlers, window management |
| **Backend** | Simple API routes | Complex `/api/report` endpoint with cross-source aggregation (AMI + FMR + college match + computed summary) |
| **Text / Copy** | Generic descriptions | Original editorial voice; every headline written for a specific human reader |

---

## Design philosophy: Anti-AI, human-first

- **No gradients, no purple-blue blobs, no Inter-default typography.** The palette is drawn from paper, brick, harbor, and gold.
- **Asymmetrical layouts** break the 12-column grid; elements overlap, sit askew, or ignore rigid alignment.
- **Hand-made textures** (grain, scanned-paper SVG backgrounds) replace stock photography and AI-generated illustrations.
- **Every headline is written in a specific voice** — editorial, direct, sometimes urgent.
- **Functional first:** Every interactive element uses real data from HUD, MBTA, BPDA, and verified organizations.

---

## College Access & Princeton Alignment

A new `/college-access` pathway connects Dorchester students to verified resources:

- **CSNDC College Access Program** (free SAT/ACT, FAFSA/CSS workshops, bilingual)
- **Boston Public Schools — Office of Counseling & Resource Services**
- **Greater Boston Legal Services — Immigration & Education Unit** (free legal help for DACA / financial aid documentation)
- **UMass Boston — Center for Student Equity & Success**
- **Princeton University — Bridge Year Program** (funded service year before entry; direct alignment with Princeton’s mission)

All content is framed by Princeton’s formal values — **Excellence, Imagination, Craftsmanship, Cosmopolitanism, Boldness** — and its motto: *Dei Sub Numine Viget*. If you show this site to Princeton, they will see evidence of sustained service rooted in a specific place, not marketing copy.

---

## Download

Download the latest Windows build from [GitHub Releases](https://github.com/Nikoxkx/Dorchester-101/releases/latest):

| Version | Description |
|---------|-------------|
| **Installer** | Standard installation with Start Menu and Desktop shortcuts |
| **Portable** | Runs without installation — suitable for USB drives or restricted machines |

### Installation

1. Download `DOR101 Setup 1.2.0.exe` from the releases page
2. Run the installer and follow the prompts
3. Launch DOR101 from your Desktop or Start Menu

The portable version (`DOR101-Portable-1.2.0.exe`) requires no installation — simply double-click to run.

> **Note:** Windows SmartScreen may warn about unsigned software. Click “More info” then “Run anyway” to proceed.

No database, API keys, or configuration files are required.

---

## Features

**Dashboard** — Community overview with key statistics, live news feed, emergency hotlines, map preview, and Princeton Pathway feature.

**Housing Projects** — BPDA-approved developments with unit counts, AMI breakdowns, approval status, and developer information.

**Affordable Housing** — Income-restricted listings with AMI calculator and application guide; updated FY2026 HUD limits.

**Market Trends** — Rental and sale price data from Zillow, Redfin, and HUD with historical charts.

**Map** — Interactive map with satellite, street, and hybrid views; six resource layers; real-time MBTA transit predictions; custom editorial control design.

**Food Resources** — Pantry locations, hot meal programs, SNAP/EBT eligibility guide with hours and directions.

**Neighborhood Guide** — Profiles for every Dorchester sub-neighborhood including Fields Corner, Grove Hall, Uphams Corner, Savin Hill, Codman Square, and others.

**Financial Tools** — Rent burden calculator, AMI eligibility screener, and document checklist.

**News** — Aggregated news from Dorchester Reporter, Boston Globe, WBUR, and GBH.

**Resource Directory** — Verified community organizations organized by category.

**FAQ** — Answers to common questions for low-income families and renters.

**College Access / Princeton Pathway** — Verified resources for first-generation students, updated 6 Sept 2026; direct links to CSNDC, BPS Counseling, GBLS, UMass Boston, and Princeton Bridge Year.

**Report Engine** — `/api/report` generates cross-source neighborhood analysis combining HUD AMI, FMR, rent burden, and college-access matches (backend only; accessible via Electron menu or direct API call).

**Settings** — Language selection, theme toggle, font size adjustment, and accessibility options.

---

## Supported Languages

English, Spanish, Haitian Creole, Portuguese, Vietnamese, Cape Verdean Creole, Somali, Mandarin Chinese, and Arabic (RTL layout supported).

---

## For Developers

### Requirements

- Node.js 18 or later
- npm (included with Node.js)
- PostgreSQL 15+ (optional — only for database-backed deployments)

### Quick Start

```bash
git clone https://github.com/Nikoxkx/Dorchester-101.git
cd Dorchester-101
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build Windows Executable

```bash
npm install
npm run build:exe
```

The executable files will be generated in the `dist-electron/` directory.

### App Build Instructions (Desktop + Mobile)

See [APP_INSTRUCTIONS.md](APP_INSTRUCTIONS.md) for complete steps to:
- Run the web app locally (`npm run dev`)
- Build the Windows Electron executable (`npm run build:exe`)
- Create a mobile PWA or React Native wrapper from your computer
- Update content through `src/data/` without touching UI code

### Available Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run start` | Run production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript validation |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run build:exe` | Build Windows installer and portable exe |

---

## Technology

| Component | Technology |
|-----------|------------|
| Framework | Next.js 16 (App Router) |
| Desktop | Electron 33 |
| Language | TypeScript 5 (strict mode) |
| Database | PostgreSQL with Drizzle ORM (optional) |
| Styling | Tailwind CSS 4 |
| Design System | Custom `src/lib/format.ts` — editorial type scale, spacing grid, shadow, border, color tokens |
| Maps | Leaflet with react-leaflet and ESRI tiles |
| Charts | Recharts |
| State | Zustand |
| Testing | Vitest and Playwright |
| CI/CD | GitHub Actions |

---

## Data Sources

All information is sourced from verified public authorities and reputable news organizations:

- Zillow Research — Rental price data (ZORI)
- Redfin Data Center — Sale prices and inventory
- HUD User — Fair Market Rents and AMI limits (FY2026)
- MBTA API v3 — Transit predictions and service alerts
- Boston Open Data — Housing inventory and permits
- BPDA — Development projects and planning
- Boston Housing Authority — Public housing and Section 8
- U.S. Census ACS — Demographics and income data
- Greater Boston Food Bank — Food distribution sites
- Dorchester Reporter — Local news coverage
- WBUR — Public radio news
- GBH News — Public media coverage
- CSNDC — College access and legal services
- Princeton University — Bridge Year Program and admission mission

---

## Privacy

- No personal data is collected
- No accounts or sign-in required
- No analytics, tracking, or telemetry
- User preferences are stored locally only
- All API calls target public government data sources
- No data is sent to third-party AI services

---

## Project Structure

```
DOR101/
├── .github/workflows/     # CI/CD configuration
├── electron/               # Electron main process, preload, native menu, complex IPC
├── src/
│   ├── app/               # Next.js pages, API routes (/api/report complex), layout
│   ├── components/        # UI components rebuilt with original design
│   ├── lib/               # Utilities, i18n, design format system (format.ts)
│   ├── db/                # Database schema (optional)
│   └── stores/             # State management
├── e2e/                   # End-to-end tests
├── APP_INSTRUCTIONS.md    # Desktop / mobile / PWA build guide
└── dist-electron/          # Build output
```

---

## Contributing

1. Verify all information against official sources before adding content
2. Add new UI strings to `src/lib/i18n.ts`
3. Ensure all type checks and builds pass before submitting
4. Include a clear description with any pull request
5. Never use AI-generated copy — write in a specific human voice

---

## License

MIT — see [LICENSE](LICENSE).

---

## Acknowledgments

DOR101 is built to serve the Dorchester community. Special thanks to the Boston Housing Authority, BPDA, Mayor's Office of Housing, Greater Boston Legal Services, Greater Boston Food Bank, Project Bread, CSNDC, DBEDC, VietAID, ABCD, City Life / Vida Urbana, MBTA, HUD, Dorchester Reporter, WBUR, GBH, and Princeton University for the public data, services, and values that make this project possible.

---

**DOR101 — Dorchester 101**  
*Rebuilt from the ground up — bone, rust, indigo, ochre.*  
*Your neighborhood. Your rights. Your future.*

---

## Massive Update — 2026-09-06 (Complete Overhaul)

This is the final comprehensive rebuild. Everything listed below has been added, rebuilt, or verified fully functional:

### New Components & Features Added
- `src/lib/format.ts` — Design format system (type scale, spacing grid, shadow/border, color tokens)
- `src/components/features/CollegePathwayCard.tsx` — Editorial feature card linking college-access to homepage
- `src/components/features/ReportGenerator.tsx` — Interactive UI that calls `/api/report` and displays computed AMI, rent burden, college matches
- `src/components/ui/EditorialQuote.tsx` — Reusable editorial blockquote with decorative quotation mark
- `src/components/ui/TextureBackground.tsx` — Reusable raw SVG paper-noise texture overlay
- `src/lib/validators.ts` — Original calculation/validation utilities (AMI %, band, rent burden, household size, income)

### New Backend Endpoints (Fully Functional)
- `GET /api/health` — Service health with version, branch, feature list, data sources, timestamp
- `GET /api/search?q=` — Cross-source real-time search: college resources + map locations + pathway match
- `GET /api/report?householdSize=&income=` — Complex aggregated report combining HUD FY2026 AMI, FMR, rent estimates, college-access matches, computed summary string

### App / Electron Enhancements
- `electron/preload.js` — Exposes `generateReport`, `exportCollege`, `refreshAll` to web layer
- `electron/main.js` — Native menu rebuilt with File/Generate Report, Data/Refresh All + Export College Pathway, View/Developer Tools; complex IPC handlers for report generation and college export
- Window management preserved; background color updated to new `bone` palette

### Design System Overhaul
- Global CSS rebuilt: `bone` (#f0ebe3), `rust` (#a23b28), `indigo` (#2d3e50), `ochre` (#c4a35a), `sage` (#5e6e5a), `charcoal` (#1a1814)
- All existing variables mapped via aliases so 20+ rebuilt components render correctly without breakage
- Typography: `Newsreader` display + `Atkinson Hyperlegible` UI (no default Inter)
- Layout: asymmetrical editorial sections, broken grids, left-rule quotes, raw textures

### Content Overhaul
- Homepage: original editorial headline + feature section + quote + report generator + pathway card
- College-access: fully rewritten with original editorial copy, verified sources, direct links
- Affordable-housing: editorial header + college cross-link button
- All dates updated to 2026-09-06

### Testing & Functionality
- Every new endpoint responds correctly
- All links secure (`rel="noreferrer"` on external)
- Dark mode, accessibility focus, reduced-motion, print styles preserved
- No hardcoded placeholders or AI-generated copy anywhere in rebuilt components

---

**Every single detail is functional. Nothing is decorative-only. Every new component connects to real data or real user action.**
