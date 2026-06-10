<img width="3840" height="2160" alt="pasquale-scionti-new2" src="https://github.com/user-attachments/assets/57187705-8866-4763-a6e5-f8cfb5f5b9f1" />

# DOR101 — Dorchester 101

**Your neighborhood. Your rights. Your future.**

DOR101 is a free, open-source community resource hub for residents of Dorchester, Boston, Massachusetts. It brings together verified information on housing, food assistance, healthcare, legal aid, transit, and neighborhood services — in plain language, across **9 languages**, with no account required and no data collection.

Available as a **Windows desktop app** and as a **web application** for developers and contributors.

---

## Download (Windows Desktop)

Download the latest Windows build from [**GitHub Releases**](https://github.com/Nikoxkx/Dorchester-101/releases/latest):

| Download | Best for | File |
|----------|----------|------|
| **Installer** | Everyday use — adds Start Menu and Desktop shortcuts | `DOR101 Setup 1.1.0.exe` |
| **Portable** | USB drives or machines without install rights | `DOR101-Portable-1.1.0.exe` |

### Install in 3 steps

1. Download `DOR101 Setup 1.1.0.exe` from [Releases](https://github.com/Nikoxkx/Dorchester-101/releases/latest)
2. Run the installer and follow the prompts
3. Open **DOR101** from your Desktop or Start Menu

**Portable:** double-click `DOR101-Portable-1.1.0.exe` — no installation needed.

> **Windows SmartScreen:** The app is not code-signed. If prompted, choose **More info → Run anyway**.

No database, API keys, or configuration files are required for the desktop app.

### What's New in v1.1.0

- **Live Data Updates**: News, market data, and notifications now update automatically
- **Persistent Settings**: Language preference is saved and persists across sessions
- **Notification Memory**: Read notifications are remembered and won't show again
- **Real-time Timestamps**: All data shows current dates instead of static dates
- **Bug Fixes**: Various improvements for smoother performance

---

## What DOR101 Provides

Built for renters and families across Dorchester — Fields Corner, Grove Hall, Uphams Corner, Savin Hill, Codman Square, Lower Mills, Port Norfolk, Four Corners, Ashmont, and the Mattapan border.

| Section | What you get |
|---------|--------------|
| **Dashboard** | Community overview, KPI stats, live news, emergency hotlines, map preview |
| **Housing Projects** | BPDA-approved developments with unit counts, AMI breakdowns, status |
| **Affordable Housing** | Income-restricted listings, AMI calculator, application guide |
| **Market Trends** | Rental and sale price charts (Zillow, Redfin, HUD) |
| **Map** | Satellite map with 6 resource layers and MBTA transit predictions |
| **Food Resources** | Pantries, hot meals, SNAP/EBT guide with hours and directions |
| **Neighborhood Guide** | Profiles for every Dorchester sub-neighborhood |
| **Financial Tools** | Rent burden calculator, AMI screener, document checklist |
| **News** | Dorchester Reporter, Boston Globe, WBUR, GBH News |
| **Resource Directory** | Verified organizations by category |
| **FAQ** | Answers for low-income families |
| **Settings** | Language, theme, font size, accessibility |

### Highlights

- **9 languages** — English, Spanish, Haitian Creole, Portuguese, Vietnamese, Cape Verdean Creole, Somali, Mandarin Chinese, Arabic (RTL)
- **Live MBTA data** — Red Line and Fairmount Line predictions (30-second refresh)
- **Dark mode** — system-aware with manual toggle
- **Accessibility** — WCAG 2.1 AA targets, keyboard navigation, screen reader support
- **Privacy-first** — no accounts, no analytics, no personal data collection

---

## For Developers

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- npm (included with Node.js)
- PostgreSQL 15+ *(optional — only needed for database-backed deployments)*

### Quick start (web)

```bash
git clone https://github.com/Nikoxkx/Dorchester-101.git
cd Dorchester-101
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Optional: database setup

For server deployments that use PostgreSQL:

```bash
cp .env.example .env
# Edit DATABASE_URL in .env
npx drizzle-kit push
```

The desktop app runs without a database.

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js development server |
| `npm run build` | Production build (web) |
| `npm run start` | Run production server |
| `npm run typecheck` | TypeScript validation |
| `npm run lint` | ESLint |
| `npm run electron:dev` | Run Electron wrapper (after `npm run build`) |
| `npm run build:exe` | Build Windows installer + portable `.exe` |
| `npm run build:portable` | Build portable `.exe` only |

### Build Windows `.exe` from source

```bash
npm install
npm run build:exe
```

Output:

| Artifact | Location |
|----------|----------|
| Installer | `dist-electron/DOR101 Setup 1.1.0.exe` |
| Portable | `dist-electron/DOR101-Portable-1.1.0.exe` |
| Unpacked app | `dist-electron/win-unpacked/DOR101.exe` |

See [`BUILD.md`](BUILD.md) for detailed build instructions.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Desktop | Electron 33 |
| Language | TypeScript 5 (strict) |
| Database | PostgreSQL + Drizzle ORM *(optional)* |
| Styling | Tailwind CSS 4 |
| Maps | Leaflet + react-leaflet + ESRI tiles |
| Charts | Recharts |
| State | Zustand |

---

## Data Sources

All content is sourced from verified public authorities:

| Source | Data |
|--------|------|
| [Zillow Research](https://www.zillow.com/research/data/) | Rental prices (ZORI) |
| [Redfin Data Center](https://www.redfin.com/news/data-center/) | Sale prices, inventory |
| [HUD User](https://www.huduser.gov/) | Fair Market Rents, AMI limits |
| [MBTA API v3](https://api-v3.mbta.com/) | Transit predictions, alerts |
| [Boston Open Data](https://data.boston.gov/) | Housing inventory, permits |
| [BPDA](https://www.bostonplans.org/) | Development projects |
| [Boston Housing Authority](https://www.bostonhousing.org/) | Public housing, Section 8 |
| [U.S. Census ACS](https://data.census.gov/) | Demographics, income |
| [Greater Boston Food Bank](https://www.gbfb.org/) | Food distribution sites |

---

## Privacy

- No personal data collected
- No accounts or sign-in
- No analytics, tracking, or telemetry
- Preferences stored locally only (language, theme, font size)
- API calls go to public government data sources only

---

## Project Structure

```
src/
├── app/              # Pages and API routes
├── components/       # UI, layout, map, dashboard
├── db/               # Drizzle schema (optional)
├── lib/              # Utilities and i18n
└── stores/           # Zustand state

electron/
├── main.js           # Electron main process
├── builder.config.js # Windows packaging config
└── assets/           # App icons

dist-electron/        # Build output (generated)
```

Releases are published on GitHub — see [Releases](https://github.com/Nikoxkx/Dorchester-101/releases).

---

## Contributing

1. Verify all data against official sources — no fabricated content
2. Add UI strings to `src/lib/i18n.ts` for new copy
3. Ensure `npm run typecheck` and `npm run build` pass
4. Open a pull request with a clear description

---

## License

MIT — see [LICENSE](LICENSE).

---

## Acknowledgments

DOR101 is built to serve the Dorchester community. Thanks to the Boston Housing Authority, BPDA, Mayor's Office of Housing, Greater Boston Legal Services, Greater Boston Food Bank, Project Bread, CSNDC, DBEDC, VietAID, ABCD, City Life / Vida Urbana, MBTA, and HUD for the public data and services that make this project possible.

---

**DOR101 — Dorchester 101**  
*Your neighborhood. Your rights. Your future.*
