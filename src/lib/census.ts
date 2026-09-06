/**
 * US Census Bureau American Community Survey reader.
 *
 * Dorchester does not have its own tab in ACS, so the honest unit of analysis
 * is Suffolk County, which is coterminous with the City of Boston. The library
 * requests a fixed variable set, tolerates a missing vintage, and never fills a
 * gap with a plausible-looking number: an absent estimate stays absent and the
 * caller must show that.
 */

import { globalCache, CACHE_TTL } from './cache';

const CENSUS_BASE = 'https://api.census.gov/data';
const TIMEOUT_MS = 8_000;

/**
 * Suffolk County, Massachusetts == the City of Boston.
 * FIPS 25025 (state 25, county 025). `county:017` would be Middlesex County,
 * which is not Boston — a wrong-geography bug is worse than no data, so this is
 * asserted in a unit test alongside the API URL.
 */
export const GEO_SUFFIX = 'state:25';
export const GEO_COUNTY = 'county:025';

/**
 * Newest 5-year vintage first. The loop in `fetchBostonAcs` returns the first
 * vintage that answers, so a deployed server reads the newest published
 * release (2020–2024, published December 2025) and falls back one year only if
 * that table is briefly unavailable — the site never shows a stale year as
 * "current" just because the list was not updated.
 */
export const ACS_VINTAGES = ['2024', '2023', '2022', '2021'] as const;

/**
 * ACS detailed-table variables. Each id was checked against the 2023 variable
 * list (api.census.gov/data/2023/acs/acs5/variables.html). The previous set
 * had several wrong ids — B25047 is *plumbing facilities*, B25003_002 is
 * *owner*-occupied, B25058 is *contract* not gross rent — which is how a
 * dashboard reports a plausible number that means something else.
 */
export const ACS_VARIABLES = {
  medianHouseholdIncome: 'B19013_001E',
  medianContractRent: 'B25058_001E',
  medianGrossRent: 'B25064_001E',
  medianOwnerCostsMortgage: 'B25088_002E',
  medianPropertyValue: 'B25077_001E',
  occupiedUnitsTotal: 'B25003_001E',
  ownerOccupiedUnits: 'B25003_002E',
  renterOccupiedUnits: 'B25003_003E',
  /** Gross rent as a percentage of household income, B25070: bins 002–010. */
  rentBurdenTotal: 'B25070_001E',
  rentBurdenUnder10: 'B25070_002E',
  rentBurden10to15: 'B25070_003E',
  rentBurden15to20: 'B25070_004E',
  rentBurden20to25: 'B25070_005E',
  rentBurden25to30: 'B25070_006E',
  rentBurden30to35: 'B25070_007E',
  rentBurden35to40: 'B25070_008E',
  rentBurden40to50: 'B25070_009E',
  rentBurden50Plus: 'B25070_010E',
  rentBurdenNotComputed: 'B25070_011E',
  /** Median of that same distribution, as a single percentage. */
  medianRentBurden: 'B25071_001E',
} as const;

export interface AcsEstimate {
  variable: string;
  label: string;
  value: number | null;
  marginOfError: number | null;
}

export interface AcsResponse {
  vintage: string;
  geography: string;
  retrievedAt: string;
  source: 'census-live' | 'census-cache' | 'unavailable';
  estimates: Record<string, AcsEstimate>;
  error?: string;
}

interface RawRow extends Array<string> {}

const LABELS: Record<string, string> = {
  B19013_001E: 'Median household income',
  B25058_001E: 'Median contract rent',
  B25064_001E: 'Median gross rent',
  B25088_002E: 'Median monthly owner costs, with a mortgage',
  B25077_001E: 'Median value, owner-occupied units',
  B25003_001E: 'Occupied housing units',
  B25003_002E: 'Owner-occupied housing units',
  B25003_003E: 'Renter-occupied housing units',
  B25070_001E: 'Renter households (rent-burden universe)',
  B25070_002E: 'Rent under 10% of income',
  B25070_003E: 'Rent 10–14.9% of income',
  B25070_004E: 'Rent 15–19.9% of income',
  B25070_005E: 'Rent 20–24.9% of income',
  B25070_006E: 'Rent 25–29.9% of income',
  B25070_007E: 'Rent 30–34.9% of income',
  B25070_008E: 'Rent 35–39.9% of income',
  B25070_009E: 'Rent 40–49.9% of income',
  B25070_010E: 'Rent 50% or more of income',
  B25070_011E: 'Rent burden not computed',
  B25071_001E: 'Median gross rent as a percentage of household income',
};

/**
 * ACS uses sentinels for "no estimate". Collapsing them to 0 would silently
 * turn "not published" into "zero rent burden", which is how dashboards lie.
 */
export function normalizeAcsValue(raw: string | undefined): number | null {
  if (raw === undefined || raw === null || raw === '') return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  if (n <= -1111111111 || n >= 2222222222) return null;
  if (n === -666666666 || n === -888888888 || n === -999999999 || n === -222222222) return null;
  return n;
}

async function fetchJson(url: string): Promise<{ data: RawRow[] } | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { accept: 'application/json' }, cache: 'no-store' });
    if (!res.ok) return null;
    const json = (await res.json()) as unknown;
    if (!Array.isArray(json) || json.length < 2) return null;
    return { data: json as RawRow[] };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchBostonAcs(): Promise<AcsResponse> {
  const cacheKey = 'census:bos:acs';
  const cached = globalCache.get<AcsResponse>(cacheKey);

  const vars = Object.values(ACS_VARIABLES);
  const uniqueVars = [...new Set([...vars, ...vars.map((v) => v.replace('E', 'M'))])];
  const select = ['NAME', ...uniqueVars].join(',');

  for (const vintage of ACS_VINTAGES) {
    const url = `${CENSUS_BASE}/${vintage}/acs/acs5?get=${select}&for=${GEO_COUNTY}&in=${GEO_SUFFIX}`;
    const result = await fetchJson(url);
    if (!result) continue;
    const [header, row] = [result.data[0], result.data[1]];
    const estimates: Record<string, AcsEstimate> = {};
    header.forEach((column: string, index: number) => {
      if (column === 'NAME' || column === 'GEO_ID') return;
      const base = column.replace(/M$/, '');
      const kind = column.endsWith('M') ? 'moe' : 'value';
      const slot = (estimates[base] ??= { variable: base, label: LABELS[base] ?? base, value: null, marginOfError: null });
      const value = normalizeAcsValue(row[index]);
      if (kind === 'moe') slot.marginOfError = value;
      else slot.value = value;
    });

    const response: AcsResponse = {
      vintage: `ACS 5-year ${Number(vintage) - 4}–${vintage}`,
      geography: String(row[header.indexOf('NAME')] ?? 'Suffolk County, Massachusetts'),
      retrievedAt: new Date().toISOString(),
      source: 'census-live',
      estimates,
    };
    globalCache.set(cacheKey, response, CACHE_TTL.MARKET_DATA);
    return response;
  }

  if (cached) return { ...cached, source: 'census-cache' };
  return {
    vintage: 'unavailable',
    geography: 'Suffolk County, Massachusetts (City of Boston)',
    retrievedAt: new Date().toISOString(),
    source: 'unavailable',
    estimates: {},
    error: 'Census API unreachable. No estimate is shown rather than a stand-in.',
  };
}

export interface DerivedMetrics {
  medianGrossRent: number | null;
  medianContractRent: number | null;
  medianIncome: number | null;
  medianOwnerCosts: number | null;
  medianHomeValue: number | null;
  renterShare: number | null;
  /** Share of renter households whose gross rent exceeds 30% / 40% of income. */
  burden30: number | null;
  burden40: number | null;
  /** Months of income needed for a deposit-plus-first-month move-in. */
  moveInCost: number | null;
  /** Median gross rent as a share of income, straight from B25071. */
  medianRentBurden: number | null;
  /** Full B25070 distribution as shares of computed households, for the chart. */
  burdenDistribution: Array<{ bin: string; share: number; households: number }> | null;
}

export function deriveMetrics(estimates: Record<string, AcsEstimate>): DerivedMetrics {
  const v = (key: keyof typeof ACS_VARIABLES) => estimates[ACS_VARIABLES[key]]?.value ?? null;
  const renter = v('renterOccupiedUnits');
  const total = v('occupiedUnitsTotal');
  const renterShare = renter !== null && total ? Math.round((renter / total) * 1000) / 10 : null;

  // The denominator excludes households whose burden ACS could not compute
  // (no cash rent, zero income); including them understates every share.
  const notComputed = v('rentBurdenNotComputed') ?? 0;
  const burdenBase = v('rentBurdenTotal') !== null ? (v('rentBurdenTotal') as number) - notComputed : null;
  const b30 = [v('rentBurden30to35'), v('rentBurden35to40'), v('rentBurden40to50'), v('rentBurden50Plus')];
  const b40 = [v('rentBurden40to50'), v('rentBurden50Plus')];
  const sum = (xs: Array<number | null>): number | null => {
    if (!burdenBase || xs.some((x) => x === null)) return null;
    return (xs as number[]).reduce((a, b) => a + b, 0);
  };
  const pct = (parts: number | null) => (parts === null || !burdenBase ? null : Math.round((parts / burdenBase) * 1000) / 10);

  const grossRent = v('medianGrossRent');
  const income = v('medianHouseholdIncome');
  const moveInCost = grossRent && income ? Math.round(((grossRent * 1 + grossRent) / (income / 12)) * 10) / 10 : null;

  const bins: Array<[string, keyof typeof ACS_VARIABLES]> = [
    ['< 10%', 'rentBurdenUnder10'],
    ['10–15%', 'rentBurden10to15'],
    ['15–20%', 'rentBurden15to20'],
    ['20–25%', 'rentBurden20to25'],
    ['25–30%', 'rentBurden25to30'],
    ['30–35%', 'rentBurden30to35'],
    ['35–40%', 'rentBurden35to40'],
    ['40–50%', 'rentBurden40to50'],
    ['50%+', 'rentBurden50Plus'],
  ];
  const burdenDistribution =
    burdenBase && bins.every(([, key]) => v(key) !== null)
      ? bins.map(([bin, key]) => ({ bin, households: v(key) as number, share: Math.round(((v(key) as number) / burdenBase) * 1000) / 10 }))
      : null;

  return {
    medianRentBurden: v('medianRentBurden'),
    burdenDistribution,
    medianGrossRent: grossRent,
    medianContractRent: v('medianContractRent'),
    medianIncome: income,
    medianOwnerCosts: v('medianOwnerCostsMortgage'),
    medianHomeValue: v('medianPropertyValue'),
    renterShare,
    burden30: pct(sum(b30)),
    burden40: pct(sum(b40)),
    moveInCost,
  };
}

/** One point per ACS vintage for the trend chart. Nothing is interpolated. */
export interface AcsSeriesPoint {
  vintage: string;
  /** Last year of the 5-year window, e.g. 2023 for "2019–2023". */
  year: number;
  medianGrossRent: number | null;
  medianIncome: number | null;
  medianHomeValue: number | null;
  medianRentBurden: number | null;
}

export const ACS_SERIES_VINTAGES = ['2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'] as const;

/**
 * Reads the same four headline variables from every published 5-year vintage.
 * Consecutive vintages overlap by four years, so the line is smooth by
 * construction and should be read as a trend, not as year-on-year change; the
 * page says so beside the chart.
 */
export async function fetchBostonAcsSeries(): Promise<{ points: AcsSeriesPoint[]; source: 'census-live' | 'census-cache' | 'unavailable'; retrievedAt: string }> {
  const cacheKey = 'census:bos:series';
  const cached = globalCache.get<{ points: AcsSeriesPoint[]; retrievedAt: string }>(cacheKey);
  const vars = ['B25064_001E', 'B19013_001E', 'B25077_001E', 'B25071_001E'];
  const select = ['NAME', ...vars].join(',');

  const results = await Promise.all(
    ACS_SERIES_VINTAGES.map(async (vintage) => {
      const url = `${CENSUS_BASE}/${vintage}/acs/acs5?get=${select}&for=${GEO_COUNTY}&in=${GEO_SUFFIX}`;
      const result = await fetchJson(url);
      if (!result) return null;
      const [header, row] = [result.data[0], result.data[1]];
      const at = (variable: string) => normalizeAcsValue(row[header.indexOf(variable)]);
      return {
        vintage: `${Number(vintage) - 4}–${vintage}`,
        year: Number(vintage),
        medianGrossRent: at('B25064_001E'),
        medianIncome: at('B19013_001E'),
        medianHomeValue: at('B25077_001E'),
        medianRentBurden: at('B25071_001E'),
      } satisfies AcsSeriesPoint;
    })
  );
  const points = results.filter((p): p is AcsSeriesPoint => p !== null);
  const retrievedAt = new Date().toISOString();
  if (points.length >= 3) {
    globalCache.set(cacheKey, { points, retrievedAt }, CACHE_TTL.MARKET_DATA);
    return { points, source: 'census-live', retrievedAt };
  }
  if (cached) return { ...cached, source: 'census-cache' };
  return { points: [], source: 'unavailable', retrievedAt };
}
