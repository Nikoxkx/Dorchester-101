<img width="3840" height="2160" alt="pasquale-scionti-new2" src="https://github.com/user-attachments/assets/57187705-8866-4763-a6e5-f8cfb5f5b9f1" />

# DOR101 — Dorchester 101

**Your neighborhood. Your rights. Your future.**

DOR101 is a free, open-source community resource hub for residents of Dorchester, Boston, Massachusetts. It brings together verified information on housing, food assistance, healthcare, legal aid, transit, and neighborhood services — in plain language, across 9 languages, with no account required and no data collection.

Available as a Windows desktop application and as a web application for developers and contributors.

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

> **Note:** Windows SmartScreen may warn about unsigned software. Click "More info" then "Run anyway" to proceed.

No database, API keys, or configuration files are required.

---

## Features

**Dashboard** — Community overview with key statistics, live news feed, emergency hotlines, and map preview.

**Housing Projects** — BPDA-approved developments with unit counts, AMI breakdowns, approval status, and developer information.

**Affordable Housing** — Income-restricted listings with AMI calculator and application guide.

**Market Trends** — Rental and sale price data from Zillow, Redfin, and HUD with historical charts.

**Map** — Interactive map with satellite, street, and hybrid views; six resource layers; real-time MBTA transit predictions.

**Food Resources** — Pantry locations, hot meal programs, SNAP/EBT eligibility guide with hours and directions.

**Neighborhood Guide** — Profiles for every Dorchester sub-neighborhood including Fields Corner, Grove Hall, Uphams Corner, Savin Hill, Codman Square, and others.

**Financial Tools** — Rent burden calculator, AMI eligibility screener, and document checklist.

**News** — Aggregated news from Dorchester Reporter, Boston Globe, WBUR, and GBH.

**Resource Directory** — Verified community organizations organized by category.

**FAQ** — Answers to common questions for low-income families and renters.

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
- HUD User — Fair Market Rents and AMI limits
- MBTA API v3 — Transit predictions and service alerts
- Boston Open Data — Housing inventory and permits
- BPDA — Development projects and planning
- Boston Housing Authority — Public housing and Section 8
- U.S. Census ACS — Demographics and income data
- Greater Boston Food Bank — Food distribution sites
- Dorchester Reporter — Local news coverage
- WBUR — Public radio news
- GBH News — Public media coverage

---

## Privacy

- No personal data is collected
- No accounts or sign-in required
- No analytics, tracking, or telemetry
- User preferences are stored locally only
- All API calls target public government data sources

---

## Project Structure

```
DOR101/
├── .github/workflows/     # CI/CD configuration
├── electron/               # Electron main process and packaging
├── src/
│   ├── app/               # Next.js pages and API routes
│   ├── components/        # UI components and layout
│   ├── db/                # Database schema (optional)
│   ├── lib/               # Utilities and internationalization
│   └── stores/             # State management
├── e2e/                   # End-to-end tests
└── dist-electron/          # Build output
```

---

## Contributing

1. Verify all information against official sources before adding content
2. Add new UI strings to `src/lib/i18n.ts`
3. Ensure all type checks and builds pass before submitting
4. Include a clear description with any pull request

---

## License

MIT — see [LICENSE](LICENSE).

---

## Acknowledgments

DOR101 is built to serve the Dorchester community. Special thanks to the Boston Housing Authority, BPDA, Mayor's Office of Housing, Greater Boston Legal Services, Greater Boston Food Bank, Project Bread, CSNDC, DBEDC, VietAID, ABCD, City Life / Vida Urbana, MBTA, HUD, Dorchester Reporter, WBUR, and GBH for the public data and services that make this project possible.

---

**DOR101 — Dorchester 101**  
*Your neighborhood. Your rights. Your future.*
