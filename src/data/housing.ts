export interface HousingListing {
  id: string;
  propertyName: string;
  address: string;
  neighborhood: string;
  unitTypes: { type: string; count: number; rent: number | null }[];
  amiRequired: number;
  waitlistStatus: 'available' | 'waitlist_open' | 'waitlist_closed' | 'lottery' | 'check_source';
  applicationDeadline: string | null;
  propertyManagerPhone: string;
  applyUrl: string;
  amenities: string;
  transitAccess: string;
  notes: string;
  lastVerified: string;
}

export const HOUSING_LISTINGS: HousingListing[] = [
  {
    id: 'bha-public',
    propertyName: 'Boston Housing Authority — public housing (citywide, includes Dorchester sites)',
    address: 'Apply at 52 Chauncy Street or boston.myhousing.com',
    neighborhood: 'Citywide / Dorchester developments',
    unitTypes: [
      { type: 'Studio–5BR', count: 0, rent: null },
    ],
    amiRequired: 80,
    waitlistStatus: 'waitlist_open',
    applicationDeadline: null,
    propertyManagerPhone: '(617) 988-4000',
    applyUrl: 'https://boston.myhousing.com',
    amenities: 'Varies by development. Rent is income-based (typically ~30% of adjusted income).',
    transitAccess: 'Most BHA Dorchester sites are on the 23/28 buses or Red Line.',
    notes: 'Public housing waitlists are open. Tenant-based Section 8 is closed. You can still apply for public housing, project-based, and Mod Rehab.',
    lastVerified: '2026-07-30',
  },
  {
    id: 'massaccess',
    propertyName: 'MassAccess Housing Registry — Dorchester listings',
    address: 'Search ZIP 02121, 02122, 02124, 02125',
    neighborhood: 'All of Dorchester',
    unitTypes: [
      { type: 'Varies', count: 0, rent: null },
    ],
    amiRequired: 80,
    waitlistStatus: 'check_source',
    applicationDeadline: null,
    propertyManagerPhone: '(800) 421-1223',
    applyUrl: 'https://www.massaccesshousingregistry.org',
    amenities: 'Live lottery and waitlist openings from private and nonprofit owners.',
    transitAccess: 'Filter by T access on MassAccess.',
    notes: 'This is the statewide board for income-restricted openings. DOR101 does not scrape vacancy — open MassAccess for what is actually taking applications today.',
    lastVerified: '2026-09-01',
  },
  {
    id: 'metro-housing',
    propertyName: 'Metro Housing|Boston — RAFT and housing search',
    address: '125 Lincoln Street, 5th Floor, Boston, MA 02111',
    neighborhood: 'Downtown (serves Dorchester)',
    unitTypes: [],
    amiRequired: 50,
    waitlistStatus: 'check_source',
    applicationDeadline: null,
    propertyManagerPhone: '(617) 425-6700',
    applyUrl: 'https://www.metrohousingboston.org',
    amenities: 'RAFT applications, housing search, homelessness prevention.',
    transitAccess: 'South Station / Downtown Crossing',
    notes: 'Regional administrator for RAFT in Boston. Up to $7,000 / 12 months.',
    lastVerified: '2026-06-01',
  },
  {
    id: 'csndc-rentals',
    propertyName: 'CSNDC affordable rentals',
    address: '587 Washington Street, Dorchester, MA 02124',
    neighborhood: 'Codman Square',
    unitTypes: [
      { type: '1–3BR', count: 0, rent: null },
    ],
    amiRequired: 60,
    waitlistStatus: 'waitlist_open',
    applicationDeadline: null,
    propertyManagerPhone: '(617) 825-9797',
    applyUrl: 'https://www.csndc.com',
    amenities: 'Nonprofit-owned family housing in Codman Square.',
    transitAccess: 'Bus 23, 26, 28',
    notes: 'Call CSNDC for current openings. Do not assume a unit is vacant from this directory.',
    lastVerified: '2026-06-01',
  },
  {
    id: 'dbedc-rentals',
    propertyName: 'Dorchester Bay EDC rentals',
    address: '594 Columbia Road, Dorchester, MA 02125',
    neighborhood: 'Uphams Corner',
    unitTypes: [
      { type: '1–3BR', count: 0, rent: null },
    ],
    amiRequired: 60,
    waitlistStatus: 'waitlist_open',
    applicationDeadline: null,
    propertyManagerPhone: '(617) 825-4200',
    applyUrl: 'https://www.dbedc.org',
    amenities: 'Nonprofit rentals along Columbia Road and nearby.',
    transitAccess: 'Fairmount Line — Uphams Corner; bus 15, 41',
    notes: 'Ask about current waitlists and homebuyer classes.',
    lastVerified: '2026-06-01',
  },
];

export interface DevelopmentProject {
  id: string;
  name: string;
  developer: string;
  address: string;
  neighborhood: string;
  totalUnits: number | null;
  incomeRestrictedUnits: number | null;
  amiBreakdown: Record<string, number>;
  status: 'planning' | 'approved' | 'under_construction' | 'complete';
  approvalDate: string | null;
  expectedCompletion: string | null;
  description: string;
  bpdaLink: string;
}

export const DEVELOPMENT_PROJECTS: DevelopmentProject[] = [
  {
    id: 'dot-block',
    name: 'Dot Block',
    developer: 'Samuels & Associates',
    address: '1211–1231 Dorchester Avenue, Dorchester, MA 02125',
    neighborhood: 'Savin Hill',
    totalUnits: 488,
    incomeRestrictedUnits: 79,
    amiBreakdown: { '50': 30, '60': 29, '80': 20 },
    status: 'under_construction',
    approvalDate: '2019-12-12',
    expectedCompletion: null,
    description: 'Large mixed-use project next to Savin Hill station — apartments, retail, and public space. Affordable units are a fraction of the total; watch MassAccess for lotteries.',
    bpdaLink: 'https://www.bostonplans.org/projects/development-projects/dot-block',
  },
  {
    id: 'uphams-mixed',
    name: 'Uphams Corner mixed-use (DBEDC)',
    developer: 'Dorchester Bay EDC',
    address: 'Columbia Road / Uphams Corner, Dorchester, MA 02125',
    neighborhood: 'Uphams Corner',
    totalUnits: 150,
    incomeRestrictedUnits: 150,
    amiBreakdown: { '30': 45, '50': 60, '60': 45 },
    status: 'approved',
    approvalDate: '2023-06-15',
    expectedCompletion: null,
    description: 'Community-development project with income-restricted housing and ground-floor space on Columbia Road. Confirm unit counts on the BPDA project page before citing them.',
    bpdaLink: 'https://www.bostonplans.org/projects/development-projects',
  },
  {
    id: 'fields-tod',
    name: 'Fields Corner station-area housing',
    developer: 'Various (watch BPDA)',
    address: 'Dorchester Avenue at Fields Corner, Dorchester, MA 02122',
    neighborhood: 'Fields Corner',
    totalUnits: null,
    incomeRestrictedUnits: null,
    amiBreakdown: {},
    status: 'planning',
    approvalDate: null,
    expectedCompletion: null,
    description: 'Fields Corner is a BPDA-designated growth area around the Red Line. Individual parcels move in and out of Article 80 review — use bostonplans.org rather than a static count.',
    bpdaLink: 'https://www.bostonplans.org/planning/planning-initiatives/fields-corner',
  },
  {
    id: 'csndc-washington',
    name: 'CSNDC Washington Street housing',
    developer: 'Codman Square NDC',
    address: 'Washington Street, Dorchester, MA 02124',
    neighborhood: 'Codman Square',
    totalUnits: 75,
    incomeRestrictedUnits: 75,
    amiBreakdown: { '30': 25, '50': 25, '60': 25 },
    status: 'complete',
    approvalDate: '2020-03-20',
    expectedCompletion: '2024-08-01',
    description: 'Fully income-restricted family housing from CSNDC. Waitlists, when open, run through the NDC.',
    bpdaLink: 'https://www.bostonplans.org/projects/development-projects',
  },
];
