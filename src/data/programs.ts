/**
 * Sourced program figures for Dorchester / Boston.
 * Pages should read these through API routes, not copy numbers inline.
 */

export const PROGRAM_META = {
  lastReviewed: '2026-09-06',
  zipCodes: ['02121', '02122', '02124', '02125'] as const,
};

/** HUD FY2026 income limits — Boston-Cambridge-Quincy, MA-NH HMFA */
export const HUD_AMI_FY2026 = {
  label: 'HUD FY2026',
  effectiveDate: '2025-04-01',
  area: 'Boston-Cambridge-Quincy, MA-NH HUD Metro FMR Area',
  source: 'HUD User Income Limits (FY2026)',
  sourceUrl: 'https://www.huduser.gov/portal/datasets/il.html',
  byHouseholdSize: {
    1: { ami100: 120000, ami80: 96000, ami60: 72000, ami50: 60000, ami30: 36000 },
    2: { ami100: 137200, ami80: 109700, ami60: 82320, ami50: 68600, ami30: 41150 },
    3: { ami100: 154300, ami80: 123400, ami60: 92580, ami50: 77150, ami30: 46300 },
    4: { ami100: 171400, ami80: 137100, ami60: 102840, ami50: 85700, ami30: 51400 },
    5: { ami100: 185200, ami80: 148100, ami60: 111120, ami50: 92600, ami30: 55550 },
    6: { ami100: 198900, ami80: 159050, ami60: 119340, ami50: 99450, ami30: 59650 },
    7: { ami100: 212500, ami80: 170050, ami60: 127560, ami50: 106300, ami30: 63750 },
    8: { ami100: 226300, ami80: 181000, ami60: 135780, ami50: 113150, ami30: 67850 },
  } as Record<number, { ami100: number; ami80: number; ami60: number; ami50: number; ami30: number }>,
};

/** HUD FY2026 Fair Market Rents — same metro */
export const HUD_FMR_FY2026 = {
  effectiveDate: '2025-10-01',
  source: 'HUD Fair Market Rents FY2026',
  sourceUrl: 'https://www.huduser.gov/portal/datasets/fmr.html',
  studio: 2359,
  oneBed: 2476,
  twoBed: 2941,
  threeBed: 3526,
  fourBed: 3894,
};

/**
 * Published neighborhood rent estimates. These are not live MLS pulls.
 * Label them as estimates with the publisher and month.
 */
export const DORCHESTER_RENT_ESTIMATES = {
  asOf: '2026-02-01',
  source: 'RentCafe Dorchester rental report (Feb 2026); Redfin neighborhood median (Sep 2025)',
  sourceUrl: 'https://www.rentcafe.com/average-rent-market-trends/us/ma/boston/dorchester/',
  averageAllTypes: 2859,
  studio: 2355,
  oneBed: 2559,
  twoBed: 3278,
  threeBed: 4269,
  neighborhoodMedian: 2950,
  yoyChangePercent: -7.3,
};

export const DORCHESTER_SALE_ESTIMATES = {
  asOf: '2026-06-01',
  source: 'Redfin / public MLS summaries for Dorchester ZIP 02121–02125',
  sourceUrl: 'https://www.redfin.com/neighborhood/1938/MA/Boston/Dorchester/housing-market',
  medianSale: 649000,
  condo: 492000,
  singleFamily: 725000,
  multiFamily: 935000,
  yoyChangePercent: 4.1,
  activeListings: 162,
  newListings30d: 48,
  avgDaysOnMarket: 27,
  monthsSupply: 1.4,
};

export const DORCHESTER_INCOME = {
  medianHousehold: 82953,
  asOf: '2024',
  source: 'U.S. Census Bureau ACS (reported neighborhood median)',
  sourceUrl: 'https://data.census.gov',
};

/** SNAP FY2026 (Oct 1, 2025 – Sep 30, 2026) */
export const SNAP_FY2026 = {
  fiscalYear: 'FY2026',
  source: 'USDA FNS COLA; Massachusetts DTA',
  sourceUrl: 'https://www.mass.gov/snap',
  applyUrl: 'https://dtaconnect.eohhs.mass.gov',
  phone: '1-877-382-2363',
  grossLimitPercentFpl: 200,
  maxMonthly: {
    1: 298,
    2: 546,
    3: 785,
    4: 994,
    5: 1183,
    6: 1421,
    7: 1571,
    8: 1789,
  } as Record<number, number>,
};

export const RAFT_PROGRAM = {
  name: 'RAFT — Residential Assistance for Families in Transition',
  maxBenefit: 7000,
  period: 'rolling 12 months',
  incomeLimit: 'At or below 50% AMI (60% AMI if fleeing domestic violence)',
  source: 'Metro Housing|Boston / Mass.gov RAFT',
  sourceUrl: 'https://www.mass.gov/raft',
  applyUrl: 'https://www.mass.gov/guides/residential-assistance-for-families-in-transition-raft-program',
  note: 'The $10,000 cap ended in 2023. Current cap is $7,000 per household in a 12-month period. Processing often takes several weeks.',
};

export const BHA_STATUS = {
  asOf: '2026-07-30',
  source: 'Boston Housing Authority',
  sourceUrl: 'https://www.bostonhousing.org',
  applyUrl: 'https://boston.myhousing.com',
  phone: '(617) 988-4000',
  statusLine: '(617) 988-3400',
  section8TenantBased: 'closed',
  publicHousing: 'open',
  projectBased: 'open_priority_one',
  note: 'BHA is not accepting new tenant-based Section 8 (Housing Choice Voucher) applications. Public housing, some project-based voucher, and Mod Rehab lists remain open. BHA does not keep a callback list for when Section 8 reopens — watch bostonhousing.org.',
};

export const MBTA_FARES = {
  asOf: '2026-08-01',
  source: 'MBTA Fares',
  sourceUrl: 'https://www.mbta.com/fares',
  subway: 2.4,
  localBus: 1.7,
  reducedSubway: 1.1,
  dayPass: 11,
  weekPass: 22.5,
  monthlyLink: 90,
  fairmountNote: 'Fairmount Line in Dorchester is Zone 1A — same $2.40 subway fare from South Station.',
};

export const LIHEAP = {
  name: 'LIHEAP / Fuel Assistance',
  applyPhone: '(617) 357-6000',
  applyOrg: 'ABCD',
  sourceUrl: 'https://www.mass.gov/fuel-assistance',
  season: 'November–April',
  note: 'Heating benefits typically $200–$600. Apply through ABCD. Utility shut-off protection runs Nov 15–Mar 15 if you tell the company you cannot pay.',
};

export const HOTLINES = [
  {
    id: 'food',
    name: 'Project Bread FoodSource Hotline',
    phone: '1-800-645-8333',
    tel: '18006458333',
    hours: 'Mon–Fri 8 AM–5 PM',
    blurb: 'Food pantries, SNAP help, 180+ languages.',
  },
  {
    id: '211',
    name: 'Mass 211',
    phone: '2-1-1',
    tel: '211',
    hours: '24/7',
    blurb: 'Housing, utilities, childcare, disaster help.',
  },
  {
    id: 'bha',
    name: 'Boston Housing Authority',
    phone: '(617) 988-4000',
    tel: '6179884000',
    hours: 'Mon–Fri 8:30 AM–5 PM',
    blurb: 'Public housing applications and waitlist status.',
  },
  {
    id: 'gbls',
    name: 'Greater Boston Legal Services',
    phone: '(617) 603-1700',
    tel: '6176031700',
    hours: 'Intake Mon–Fri 9 AM–12:30 PM',
    blurb: 'Free eviction defense if you qualify on income.',
  },
] as const;
