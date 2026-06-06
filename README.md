# DOR101 — Dorchester 101

> **Your neighborhood. Your rights. Your future.**

DOR101 is a free, open-source community resource hub built exclusively for the residents of Dorchester, Boston, Massachusetts — with a focus on lower-income families and individuals who need clear, verified information about housing, food assistance, healthcare, legal help, and community services.

---

## 🏠 What Is DOR101?

DOR101 aggregates verified data from authoritative Boston housing, food, healthcare, and social services sources and presents it in plain, respectful, and accessible language across **9 languages**. Every phone number, address, and data point is verified against official sources. The app never collects personal information, never requires an account, and never charges a fee.

**Built for:** Renters and families in Dorchester neighborhoods — Fields Corner, Grove Hall, Uphams Corner, Savin Hill, Codman Square, Lower Mills, Port Norfolk, Four Corners, Ashmont, and the Mattapan border zone.

---

## ✨ Features

### Core Pages
| Page | Description |
|------|-------------|
| **Dashboard** | Community overview with KPI stats, live news, emergency hotlines, and satellite map preview |
| **Housing Projects** | Every BPDA-approved development in Dorchester with unit counts, AMI breakdowns, and status tracking |
| **Affordable Housing** | Income-restricted housing listings, AMI calculator, step-by-step application guide |
| **Market Trends** | Real-time rental and sale price data with interactive charts — sourced from Zillow, Redfin, and HUD |
| **Map** | Satellite map (Leaflet + ESRI) with 6 filterable resource layers and live MBTA transit predictions |
| **Food Resources** | Food pantries, hot meals, SNAP/EBT guide — all with hours, requirements, and directions |
| **Neighborhood Guide** | Expandable profiles for every Dorchester sub-neighborhood with transit, schools, and demographics |
| **Financial Tools** | Rent burden calculator, AMI eligibility screener, document checklist builder |
| **News** | Auto-refreshing news from Dorchester Reporter, Boston Globe, WBUR, and GBH News |
| **Resource Directory** | Verified organizations sorted by category — housing, legal, food, healthcare, and more |
| **FAQ** | Comprehensive answers to the most common questions for low-income families |
| **Settings** | Language, theme, font size, accessibility controls |

### Technical Features
- **9 languages**: English, Spanish, Haitian Creole, Portuguese, Vietnamese, Cape Verdean Creole, Somali, Mandarin Chinese, Arabic (with RTL support)
- **Real-time MBTA integration**: Live transit predictions refreshing every 30 seconds
- **Live notifications**: Housing waitlist openings, transit alerts, food resource updates
- **Dark mode**: System-aware with manual toggle
- **Accessibility**: WCAG 2.1 AA — large touch targets, keyboard navigation, screen reader compatible
- **Satellite map**: ESRI World Imagery with Red Line and Fairmount Line routes
- **Auto-refresh**: News (5 min), market data (5 min), transit (30 sec), notifications (1 min)

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 (strict mode) |
| Database | PostgreSQL via Drizzle ORM |
| Styling | Tailwind CSS 4 |
| Maps | Leaflet + react-leaflet + ESRI satellite tiles |
| Charts | Recharts |
| Animation | Framer Motion |
| State | Zustand |
| Icons | Lucide React |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 15+ (or use the provided Docker configuration)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/dor101.git
cd dor101

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Push database schema
npx drizzle-kit push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
```

No API keys are required. All data is fetched from free, public government APIs and open data sources.

---

## 📊 Data Sources

All data in DOR101 is sourced from verified, authoritative sources:

| Source | Data | URL |
|--------|------|-----|
| Zillow Research | Rental prices (ZORI) | [zillow.com/research/data](https://www.zillow.com/research/data/) |
| Redfin Data Center | Sale prices, inventory | [redfin.com/news/data-center](https://www.redfin.com/news/data-center/) |
| HUD User | Fair Market Rents, AMI limits | [huduser.gov](https://www.huduser.gov/portal/datasets/fmr.html) |
| MBTA API v3 | Transit predictions, alerts | [api-v3.mbta.com](https://api-v3.mbta.com/) |
| Boston Open Data | Housing inventory, permits | [data.boston.gov](https://data.boston.gov/) |
| BPDA | Development projects | [bostonplans.org](https://www.bostonplans.org/) |
| Boston Housing Authority | Public housing, Section 8 | [bostonhousing.org](https://www.bostonhousing.org/) |
| U.S. Census ACS | Demographics, income data | [census.gov](https://data.census.gov/) |
| Greater Boston Food Bank | Food distribution sites | [gbfb.org](https://www.gbfb.org/) |

---

## 🌍 Languages

DOR101 supports 9 languages spoken in the Dorchester community:

| Language | Code | Direction |
|----------|------|-----------|
| English | `en` | LTR |
| Spanish (Español) | `es` | LTR |
| Haitian Creole (Kreyòl Ayisyen) | `ht` | LTR |
| Portuguese (Português) | `pt` | LTR |
| Vietnamese (Tiếng Việt) | `vi` | LTR |
| Cape Verdean Creole (Kriolu) | `kea` | LTR |
| Somali (Soomaali) | `so` | LTR |
| Mandarin Chinese (普通话) | `zh` | LTR |
| Arabic (العربية) | `ar` | RTL |

---

## 🔒 Privacy & Security

DOR101 is designed with privacy as a core principle:

- **No personal data collected** — ever
- **No accounts required**
- **No analytics or tracking** — no Google Analytics, no Sentry, no Mixpanel
- **No cookies** beyond essential localStorage for user preferences (language, theme, font size)
- **No external telemetry**
- **All settings stored locally** on the user's device
- **All API calls** go to public government data sources only
- **No API keys stored in client-side code**

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/                # API routes (news, market-data, mbta, notifications)
│   ├── affordable-housing/ # Affordable housing page
│   ├── food/               # Food resources page
│   ├── map/                # Full satellite map page
│   ├── market-trends/      # Market data & charts
│   ├── neighborhood/       # Dorchester neighborhood guide
│   ├── news/               # Live news feed
│   ├── projects/           # BPDA housing projects
│   ├── resources/          # Community resource directory
│   ├── settings/           # User preferences
│   ├── tools/              # Financial calculators
│   ├── faq/                # FAQ page
│   └── page.tsx            # Dashboard (home)
├── components/
│   ├── layout/             # Sidebar, Header, MainLayout
│   ├── dashboard/          # StatCard, QuickLinks, EmergencyBanner
│   ├── map/                # DorchesterMap (Leaflet)
│   └── ui/                 # Card, Button, Badge, Logo, etc.
├── db/                     # Drizzle ORM schema & connection
├── lib/                    # Utilities, i18n translations
└── stores/                 # Zustand state management
```

---

## 🏗 Building for Production

```bash
npm run build
npm start
```

---

## 🤝 Contributing

Contributions are welcome. Please ensure:

1. All data points are verified against official sources
2. No placeholder or fabricated data
3. All strings are added to the translation system (`src/lib/i18n.ts`)
4. TypeScript strict mode passes (`npm run typecheck`)
5. Production build succeeds (`npm run build`)

---

## 📄 License

MIT License. See [LICENSE](./LICENSE) for details.

---

## 🙏 Acknowledgments

DOR101 was built to serve the Dorchester community. We acknowledge and thank the following organizations whose data and services make this app possible:

- Boston Housing Authority
- Boston Planning & Development Agency (BPDA)
- Mayor's Office of Housing
- Greater Boston Legal Services
- Greater Boston Food Bank
- Project Bread
- Codman Square Neighborhood Development Corporation
- Dorchester Bay Economic Development Corporation
- VietAID
- Action for Boston Community Development (ABCD)
- City Life / Vida Urbana
- MBTA
- U.S. Department of Housing and Urban Development (HUD)

---

**DOR101 — Dorchester 101**
*Your neighborhood. Your rights. Your future.*
