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

/** Suffolk County, Massachusetts == the City of Boston. */
export const GEO_SUFFIX = 'state:25';
export const GEO_COUNTY = 'county:017';

export const ACS_VINTAGES = ['2023', '2022', '2021'] as const;

export const ACS_VARIABLES = {
  medianHouseholdIncome: 'B19013_001E',
  medianContractRent: 'B25047_001E',
  medianGrossRent: 'B25058_001E',
  medianOwnerCostsMortgage: 'B25070_001E',
  medianPropertyValue: 'B25077_001E',
  renterOccupiedUnits: 'B25003_002E',
  ownerOccupiedUnits: 'B25003_001E',
  occupiedUnitsTotal: 'B25002_001E',
  rentBurdenTotal: 'B25071_001E',
  rentBurden30to35: 'B25071_007E',
  rentBurden35to40: 'B25071_008E',
  rentBurden40to50: 'B25071_009E',
  rentBurden50Plus: 'B25071_010E',
  grossRentMedian: 'B25058_001E',
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
  B25047_001E: 'Median contract rent',
  B25058_001E: 'Median gross rent',
  B25070_001E: 'Median owner costs with a mortgage',
  B25077_001E: 'Median selected home value',
  B25003_001E: 'Owner-occupied housing units',
  B25003_002E: 'Renter-occupied housing units',
  B25002_001E: 'Occupied housing units',
  B25071_001E: 'Renter households, income basis',
  B25071_007E: 'Renter households paying 30-35% of income on rent',
  B25071_008E: 'Renter households paying 35-40% of income on rent',
  B25071_009E: 'Renter households paying 40-50% of income on rent',
  B25071_010E: 'Renter households paying 50% or more of income on rent',
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
      vintage: `ACS 5-year 2019-${vintage.slice(2, 4)}`,
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
}

export function deriveMetrics(estimates: Record<string, AcsEstimate>): DerivedMetrics {
  const v = (key: keyof typeof ACS_VARIABLES) => estimates[ACS_VARIABLES[key]]?.value ?? null;
  const renter = v('renterOccupiedUnits');
  const total = v('occupiedUnitsTotal');
  const renterShare = renter !== null && total ? Math.round((renter / total) * 1000) / 10 : null;

  const burdenBase = v('rentBurdenTotal');
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

  return {
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
