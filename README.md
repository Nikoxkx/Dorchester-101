<img width="3840" height="2160" alt="pasquale-scionti-new2" src="https://github.com/user-attachments/assets/57187705-8866-4763-a6e5-f8cfb5f5b9f1" />

# DOR101 — Dorchester 101

**Your neighborhood. Your rights. Your future.**

DOR101 is a **free, open-source community resource hub** for residents of Dorchester, Boston, Massachusetts. It brings together verified information on housing, food assistance, healthcare, legal aid, transit, and neighborhood services — in plain language, across **9 languages**, with no account required and no data collection.

Available as a **Windows desktop app** and as a **web application** for developers and contributors.

---

## 📥 Download (Windows Desktop)

Download the latest version from [**GitHub Releases**](https://github.com/Nikoxkx/Dorchester-101/releases/latest):

| Download | Best for | File |
|----------|----------|------|
| **Installer** ⭐ | Everyday use — adds Start Menu and Desktop shortcuts | `DOR101 Setup 1.2.0.exe` |
| **Portable** | USB drives or machines without install rights | `DOR101-Portable-1.2.0.exe` |

### Install in 3 Steps

1. Download `DOR101 Setup 1.2.0.exe` from [Releases](https://github.com/Nikoxkx/Dorchester-101/releases/latest)
2. Run the installer and follow the prompts
3. Open **DOR101** from your Desktop or Start Menu

**Portable version:** Double-click `DOR101-Portable-1.2.0.exe` — no installation needed.

> **Windows SmartScreen:** The app is not code-signed. If prompted, click **More info → Run anyway**.

No database, API keys, or configuration files are required. Just download and run!

---

## 🆕 What's New in v1.2.0

### 🔴 Critical Fixes
| Fix | Description |
|-----|-------------|
| **Real News from RSS Feeds** | News now fetches from actual sources — Dorchester Reporter, Boston.gov, WBUR, GBH, Boston Globe |
| **Dynamic Notifications** | Notifications update automatically based on date, season, and day of week |
| **Complete Translation System** | ALL text on ALL pages now translates when you change language |
| **No Caching Old Data** | Always shows fresh content — never stale version |

### 🟢 New Features
| Feature | Description |
|---------|-------------|
| **Map Style Switching** | Choose between Satellite, Street, or Hybrid map views |
| **Persistent Settings** | Your language, theme, and map style are saved and restored |
| **Notification Memory** | Read notifications won't show again — even after closing the app |
| **Live Data Updates** | News, market data, MBTA times, and notifications update automatically |
| **Cache Busting** | Service worker ensures you always see the latest version |

### 🔵 Infrastructure
| Tool | Description |
|------|-------------|
| **CI/CD Pipeline** | GitHub Actions with automatic lint, type check, test, and build |
| **Unit Tests** | Vitest with React Testing Library |
| **E2E Tests** | Playwright for full application testing |
| **API Documentation** | OpenAPI 3.0 spec available at `/api/docs` |
| **Error Handling** | Winston logger, Zod validation, graceful degradation |
| **In-Memory Cache** | TTL-based caching for all API responses |

---

## 🎯 What DOR101 Provides

Built for renters and families across Dorchester — Fields Corner, Grove Hall, Uphams Corner, Savin Hill, Codman Square, Lower Mills, Port Norfolk, Four Corners, Ashmont, and the Mattapan border.

| Section | What You Get |
|---------|--------------|
| 🏠 **Dashboard** | Community overview, KPI stats, live news, emergency hotlines, map preview |
| 🏗️ **Housing Projects** | BPDA-approved developments with unit counts, AMI breakdowns, status |
| 💰 **Affordable Housing** | Income-restricted listings, AMI calculator, application guide |
| 📊 **Market Trends** | Rental and sale price charts (Zillow, Redfin, HUD) |
| 🗺️ **Map** | Interactive map with Satellite/Street/Hybrid styles, 6 resource layers, MBTA predictions |
| 🍎 **Food Resources** | Pantries, hot meals, SNAP/EBT guide with hours and directions |
| 🏘️ **Neighborhood Guide** | Profiles for every Dorchester sub-neighborhood |
| 🧮 **Financial Tools** | Rent burden calculator, AMI screener, document checklist |
| 📰 **News** | Real-time news from Dorchester Reporter, Boston Globe, WBUR, GBH |
| 📋 **Resource Directory** | Verified organizations by category |
| ❓ **FAQ** | Answers for low-income families |
| ⚙️ **Settings** | Language, theme, font size, accessibility |

---

## ✨ Highlights

- 🌐 **9 Languages** — English, Spanish, Haitian Creole, Portuguese, Vietnamese, Cape Verdean Creole, Somali, Mandarin Chinese, Arabic (RTL)
- 🚇 **Live MBTA Data** — Red Line and Fairmount Line predictions (30-second refresh)
- 🌙 **Dark Mode** — System-aware with manual toggle
- ♿ **Accessibility** — WCAG 2.1 AA targets, keyboard navigation, screen reader support
- 🔒 **Privacy-First** — No accounts, no analytics, no personal data collection

---

## 🛠️ For Developers

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- npm (included with Node.js)
- PostgreSQL 15+ *(optional — only needed for database-backed deployments)*

### Quick Start (Web)

```bash
git clone https://github.com/Nikoxkx/Dorchester-101.git
cd Dorchester-101
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build Windows EXE

```bash
npm install
npm run build:exe
```

Output:

| Artifact | Location |
|----------|----------|
| **Installer** | `dist-electron/DOR101 Setup 1.2.0.exe` |
| **Portable** | `dist-electron/DOR101-Portable-1.2.0.exe` |
| **Unpacked App** | `dist-electron/win-unpacked/DOR101.exe` |

### All Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js development server |
| `npm run build` | Production build (web) |
| `npm run start` | Run production server |
| `npm run typecheck` | TypeScript validation |
| `npm run lint` | ESLint |
| `npm run test` | Run unit tests (Vitest) |
| `npm run test:run` | Run tests once |
| `npm run test:e2e` | Run E2E tests (Playwright) |
| `npm run electron:dev` | Run Electron wrapper (after build) |
| `npm run build:exe` | Build Windows installer + portable `.exe` |
| `npm run build:portable` | Build portable `.exe` only |

---

## 🏗️ Tech Stack

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
| Testing | Vitest + Playwright |
| CI/CD | GitHub Actions |

---

## 📡 Data Sources

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
| [Dorchester Reporter](https://www.dotnews.com/) | Local news |
| [WBUR](https://www.wbur.org/) | Public radio news |
| [GBH News](https://www.wgbh.org/news) | Public media news |

---

## 🔒 Privacy

- ✅ No personal data collected
- ✅ No accounts or sign-in
- ✅ No analytics, tracking, or telemetry
- ✅ Preferences stored locally only (language, theme, font size)
- ✅ API calls go to public government data sources only

---

## 📁 Project Structure

```
DOR101/
├── .github/
│   └── workflows/      # CI/CD pipelines
├── electron/
│   ├── main.js         # Electron main process
│   ├── builder.config.js # Windows packaging config
│   └── assets/         # App icons
├── src/
│   ├── app/            # Pages and API routes
│   │   ├── api/        # API endpoints (news, notifications, etc.)
│   │   ├── projects/   # Housing projects page
│   │   ├── map/        # Interactive map page
│   │   └── ...         # Other pages
│   ├── components/     # UI, layout, map, dashboard components
│   ├── db/             # Drizzle schema (optional)
│   ├── lib/            # Utilities, i18n, logger, cache
│   └── stores/          # Zustand state management
├── e2e/                # Playwright E2E tests
├── src/__tests__/      # Unit tests
└── dist-electron/       # Build output (generated)
```

---

## 🤝 Contributing

1. Verify all data against official sources — no fabricated content
2. Add UI strings to `src/lib/i18n.ts` for new copy
3. Ensure `npm run typecheck` and `npm run build` pass
4. Open a pull request with a clear description

---

## 📜 License

MIT — see [LICENSE](LICENSE).

---

## 🙏 Acknowledgments

DOR101 is built to serve the Dorchester community. Thanks to the Boston Housing Authority, BPDA, Mayor's Office of Housing, Greater Boston Legal Services, Greater Boston Food Bank, Project Bread, CSNDC, DBEDC, VietAID, ABCD, City Life / Vida Urbana, MBTA, HUD, Dorchester Reporter, WBUR, and GBH for the public data and services that make this project possible.

---

**DOR101 — Dorchester 101**  
*Your neighborhood. Your rights. Your future.*

[![GitHub release](https://img.shields.io/github/v/release/Nikoxkx/Dorchester-101?style=flat-square)](https://github.com/Nikoxkx/Dorchester-101/releases/latest)
[![License](https://img.shields.io/github/license/Nikoxkx/Dorchester-101?style=flat-square)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-18%2B-brightgreen?style=flat-square)](https://nodejs.org/)
