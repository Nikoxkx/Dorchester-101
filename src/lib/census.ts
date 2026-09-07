/**
 * US Census Bureau American Community Survey reader.
 *
 * Dorchester does not have its own tab in ACS, so the honest unit of analysis
 * is Suffolk County, which is coterminous with the City of Boston. The library
 * requests a fixed variable set, tolerates a missing vintage, and never fills a
 * gap with a plausible-looking number: an absent estimate stays absent and the
 * caller must show that.
 *
 * ── Why there are three readers ────────────────────────────────────────────
 * On 12 May 2026 the Census Bureau began requiring an API key on **every**
 * request to `api.census.gov`; an unkeyed call now returns the
 * `data/missing_key.html` page instead of JSON. A site that only knew that one
 * endpoint therefore went silently blank — which is exactly the "Live data is
 * unavailable" panel the market page used to show. So the readers are ordered:
 *
 *  1. `api.census.gov` with `CENSUS_API_KEY`, when an operator has set one.
 *     Highest fidelity (one request for the whole variable set) and the only
 *     path that can read vintages in bulk.
 *  2. `data.census.gov`'s own table service — the same Census Bureau, the same
 *     published tables, no key. This is the path a plain deploy uses.
 *  3. Census Reporter's ACS mirror, keyless, for the case where the Bureau's
 *     own hosts are both unreachable.
 *
 * Every path is the American Community Survey; the response says which endpoint
 * answered so the citation on the page can be checked.
 */

import { globalCache, CACHE_TTL } from './cache';

const CENSUS_API_BASE = 'https://api.census.gov/data';
/** data.census.gov's public table service. No key. Same published tables. */
const CENSUS_SITE_TABLE = 'https://data.census.gov/api/access/data/table';
/** Keyless ACS mirror run by Census Reporter (a redistribution of ACS). */
const CENSUS_REPORTER = 'https://api.censusreporter.org/1.0/data/show';

const TIMEOUT_MS = 12_000;
/** In-flight request cap, so a cold serverless instance cannot fan out 60 at once. */
const POOL_SIZE = 8;
/** Headline set: eight tables, must finish inside the route's budget. */
const SNAPSHOT_DEADLINE_MS = 20_000;
/** Trend series: 13 vintages x 4 tables. A slow publisher loses points, not the page. */
const SERIES_DEADLINE_MS = 18_000;

/**
 * Suffolk County, Massachusetts == the City of Boston.
 * FIPS 25025 (state 25, county 025). `county:017` would be Middlesex County,
 * which is not Boston — a wrong-geography bug is worse than no data, so this is
 * asserted in a unit test alongside the API URL.
 */
export const GEO_SUFFIX = 'state:25';
export const GEO_COUNTY = 'county:025';
/** The same county in the UCGID syntax data.census.gov's table service uses. */
export const GEO_UCGID = '050XX00US25025';
/** The same county in Census Reporter's GEOID syntax. */
export const GEO_REPORTER = '05000US25025';

/**
 * Optional. Since May 2026 `api.census.gov` rejects unkeyed calls, so a key
 * unlocks the fastest reader — but it is optional: without one the site reads
 * the same tables from data.census.gov.
 */
export function censusApiKey(): string {
  return (process.env.CENSUS_API_KEY ?? process.env.NEXT_PUBLIC_CENSUS_API_KEY ?? '').trim();
}

export function hasCensusApiKey(): boolean {
  return censusApiKey().length > 0;
}

/**
 * Newest 5-year vintage first. The loop in `fetchBostonAcs` returns the first
 * vintage that answers, so a deployed server reads the newest published
 * release (2020–2024, published December 2025) and falls back one year only if
 * that table is briefly unavailable — the site never shows a stale year as
 * "current" just because the list was not updated.
 */
export const ACS_VINTAGES = ['2024', '2023', '2022', '2021'] as const;

/**
 * ACS detailed-table variables. Each id was checked against the published
 * variable list. The previous set had several wrong ids — B25047 is *plumbing
 * facilities*, B25003_002 is *owner*-occupied, B25058 is *contract* not gross
 * rent — which is how a dashboard reports a plausible number that means
 * something else.
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

/** The detailed tables those variables live in — one request each on the site service. */
export const ACS_TABLES = ['B19013', 'B25058', 'B25064', 'B25088', 'B25077', 'B25003', 'B25070', 'B25071'] as const;

/** A vintage is worth showing only if its three headline figures all arrived. */
const HEADLINE_VARIABLES = [
  ACS_VARIABLES.medianGrossRent,
  ACS_VARIABLES.medianHouseholdIncome,
  ACS_VARIABLES.medianPropertyValue,
] as const;

export type CensusChannel = 'census-api' | 'census-site' | 'census-reporter' | 'census-cache' | 'census-snapshot' | 'unavailable';

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
  source: CensusChannel;
  /** True when nothing live answered and the committed capture is shown. */
  snapshot?: boolean;
  /** True when served from this instance's memory rather than a fresh read. */
  fromCache?: boolean;
  /** Which endpoint produced the figures, named for the citation. */
  access?: string;
  estimates: Record<string, AcsEstimate>;
  error?: string;
}

interface RawRow extends Array<string | null> {}

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
export function normalizeAcsValue(raw: string | number | null | undefined): number | null {
  if (raw === undefined || raw === null || raw === '') return null;
  const n = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isFinite(n)) return null;
  if (n <= -1111111111 || n >= 2222222222) return null;
  if (n === -666666666 || n === -888888888 || n === -999999999 || n === -222222222) return null;
  return n;
}

/**
 * Turns a `[header, row]` pair into estimates.
 *
 * The header carries an `E` (estimate) and an `M` (margin of error) column per
 * variable, plus `EA`/`MA` *annotation* columns whose values are footnote text.
 * Only the exact `E`/`M` suffix is read; the old `endsWith('M')` test let
 * `B25064_001MA` through and created a phantom variable per annotation.
 */
export function estimatesFromRows(header: Array<string | null>, row: Array<string | number | null>): Record<string, AcsEstimate> {
  const estimates: Record<string, AcsEstimate> = {};
  header.forEach((column, index) => {
    if (typeof column !== 'string') return;
    const match = /^(B\d+_\d+)(E|M)$/.exec(column);
    if (!match) return;
    const [, base, kind] = match;
    // Keyed by the estimate id (`B25064_001E`); the `M` column fills the same
    // slot, which is why a margin of error is never mistaken for an estimate.
    const id = `${base}E`;
    const slot = (estimates[id] ??= { variable: id, label: LABELS[id] ?? id, value: null, marginOfError: null });
    const value = normalizeAcsValue(row[index]);
    if (kind === 'M') slot.marginOfError = value;
    else slot.value = value;
  });
  return estimates;
}

/** Merges a later read over an earlier one, cell by cell, without dropping MOEs. */
function mergeEstimates(target: Record<string, AcsEstimate>, incoming: Record<string, AcsEstimate>): void {
  for (const [base, entry] of Object.entries(incoming)) {
    const slot = (target[base] ??= { variable: base, label: entry.label, value: null, marginOfError: null });
    if (entry.value !== null) slot.value = entry.value;
    if (entry.marginOfError !== null) slot.marginOfError = entry.marginOfError;
    if (!slot.label || slot.label === base) slot.label = entry.label;
  }
}

async function fetchJson(url: string, timeoutMs = TIMEOUT_MS): Promise<unknown | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { accept: 'application/json', 'user-agent': 'DOR101 community hub (open-source; github.com/Nikoxkx/Dorchester-101)' },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    // The keyless endpoints answer HTML for a rejected query, and `res.ok` is
    // not a promise of JSON — parse defensively instead of throwing upstream.
    const text = await res.text();
    const trimmed = text.trimStart();
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return null;
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Runs `work` over `items` with at most `limit` promises in flight, and stops
 * starting new work after `deadlineMs`. A trend chart is 52 small requests; a
 * publisher having a slow day has to cost the page a few points on the line,
 * not the whole request, so the deadline is a hard stop rather than a retry.
 */
async function pooled<T, R>(
  items: readonly T[],
  limit: number,
  work: (item: T) => Promise<R | null>,
  deadlineMs?: number
): Promise<Array<R | null>> {
  const results: Array<R | null> = new Array<R | null>(items.length).fill(null);
  const startedAt = Date.now();
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      if (deadlineMs !== undefined && Date.now() - startedAt > deadlineMs) continue;
      results[index] = await work(items[index]);
    }
  });
  await Promise.all(runners);
  return results;
}

function hasHeadline(estimates: Record<string, AcsEstimate>): boolean {
  return HEADLINE_VARIABLES.every((variable) => estimates[variable]?.value !== null && estimates[variable]?.value !== undefined);
}

const vintageLabel = (vintage: string) => `ACS 5-year ${Number(vintage) - 4}–${vintage}`;

/* ── Reader 1: api.census.gov, with a key ─────────────────────────────────── */

async function readFromCensusApi(vintage: string, variables: readonly string[]): Promise<Record<string, AcsEstimate> | null> {
  const key = censusApiKey();
  if (!key) return null;
  const withMoe = [...new Set([...variables, ...variables.map((v) => v.replace(/E$/, 'M'))])];
  const select = ['NAME', ...withMoe].join(',');
  const url = `${CENSUS_API_BASE}/${vintage}/acs/acs5?get=${select}&for=${GEO_COUNTY}&in=${GEO_SUFFIX}&key=${encodeURIComponent(key)}`;
  const json = (await fetchJson(url)) as RawRow[] | null;
  if (!Array.isArray(json) || json.length < 2) return null;
  return estimatesFromRows(json[0], json[1]);
}

/* ── Reader 2: data.census.gov's table service, no key ────────────────────── */

export function censusSiteTableUrl(vintage: string, table: string): string {
  return `${CENSUS_SITE_TABLE}?id=ACSDT5Y${vintage}.${table}&g=${GEO_UCGID}`;
}

async function readTableFromCensusSite(vintage: string, table: string): Promise<Record<string, AcsEstimate> | null> {
  const json = (await fetchJson(censusSiteTableUrl(vintage, table))) as
    | { response?: { data?: RawRow[] } }
    | null;
  const data = json?.response?.data;
  if (!Array.isArray(data) || data.length < 2) return null;
  return estimatesFromRows(data[0], data[1]);
}

async function readFromCensusSite(vintage: string, tables: readonly string[] = ACS_TABLES): Promise<Record<string, AcsEstimate> | null> {
  const parts = await pooled(tables, POOL_SIZE, (table) => readTableFromCensusSite(vintage, table), SNAPSHOT_DEADLINE_MS);
  const estimates: Record<string, AcsEstimate> = {};
  let found = 0;
  for (const part of parts) {
    if (!part) continue;
    found++;
    mergeEstimates(estimates, part);
  }
  return found === 0 ? null : estimates;
}

/* ── Reader 3: Census Reporter's ACS mirror, no key ───────────────────────── */

async function readFromCensusReporter(vintage: string, tables: readonly string[] = ACS_TABLES): Promise<Record<string, AcsEstimate> | null> {
  const url = `${CENSUS_REPORTER}/acs${vintage}_5yr?table_ids=${tables.join(',')}&geo_ids=${GEO_REPORTER}`;
  const json = (await fetchJson(url)) as
    | { data?: Record<string, Record<string, { estimate?: Record<string, number>; error?: Record<string, number> }>> }
    | null;
  const geo = json?.data?.[GEO_REPORTER];
  if (!geo) return null;
  const estimates: Record<string, AcsEstimate> = {};
  for (const [table, block] of Object.entries(geo)) {
    for (const [column, value] of Object.entries(block.estimate ?? {})) {
      // Reporter keys drop the underscore and the suffix: `B25064001` → `B25064_001E`,
      // so they land in the same slot the Bureau's own readers use.
      const id = column.startsWith(table) ? `${table}_${column.slice(table.length)}E` : column;
      const slot = (estimates[id] ??= { variable: id, label: LABELS[id] ?? id, value: null, marginOfError: null });
      slot.value = normalizeAcsValue(value);
      slot.marginOfError = normalizeAcsValue(block.error?.[column]);
    }
  }
  return Object.keys(estimates).length === 0 ? null : estimates;
}

/**
 * Verified point-in-time capture of the ACS 5-year 2020–2024 estimates for
 * Suffolk County, Massachusetts, read from data.census.gov on 6 September 2026
 * (tables B19013, B25058, B25064, B25077, B25088, B25003, B25070, B25071 —
 * `https://data.census.gov/table?g=0500000US25025&y=2024`).
 *
 * It is a bridge for an outage, never a substitute for a live read: the
 * response is flagged `snapshot` and the page says so next to the figures.
 * Regenerate with `node scripts/refresh-acs-snapshot.mjs`.
 */
/* SNAPSHOT:BEGIN — regenerated by scripts/refresh-acs-snapshot.mjs */
export const ACS_SNAPSHOT = {
  vintage: '2024',
  geography: 'Suffolk County, Massachusetts',
  capturedAt: '2026-09-07T00:03:19.492Z',
  /** [estimate, margin of error] per variable. */
  estimates: {
    B19013_001E: [95_631, 1_765],
    B25003_001E: [327_167, 1_440],
    B25003_002E: [119_335, 2_329],
    B25003_003E: [207_832, 2_448],
    B25058_001E: [1_955, 25],
    B25064_001E: [2_129, 24],
    B25070_001E: [207_832, 2_448],
    B25070_002E: [9_635, 836],
    B25070_003E: [15_134, 1_033],
    B25070_004E: [21_992, 1_320],
    B25070_005E: [23_937, 1_377],
    B25070_006E: [23_998, 1_425],
    B25070_007E: [19_645, 1_196],
    B25070_008E: [14_681, 1_271],
    B25070_009E: [16_938, 1_171],
    B25070_010E: [51_483, 1_624],
    B25070_011E: [10_389, 997],
    B25071_001E: [31, 0.5],
    B25077_001E: [705_800, 8_139],
    B25088_001E: [2_425, 51],
    B25088_002E: [2_962, 46],
    B25088_003E: [1_046, 29],
  } as Record<string, [number, number | null]>,
} as const;
/* SNAPSHOT:END */

function snapshotEstimates(): Record<string, AcsEstimate> {
  const out: Record<string, AcsEstimate> = {};
  for (const [variable, [value, marginOfError]] of Object.entries(ACS_SNAPSHOT.estimates)) {
    out[variable] = { variable, label: LABELS[variable] ?? variable, value, marginOfError: marginOfError ?? null };
  }
  return out;
}

const CHANNEL_ACCESS: Record<string, string> = {
  'census-api': 'api.census.gov (American Community Survey 5-year)',
  'census-site': 'data.census.gov table service (American Community Survey 5-year)',
  'census-reporter': 'api.censusreporter.org (American Community Survey 5-year mirror)',
  'census-snapshot': 'verified capture of data.census.gov, ACS 5-year 2020–2024',
};

const READERS: Array<{ channel: CensusChannel; read: (vintage: string) => Promise<Record<string, AcsEstimate> | null> }> = [
  { channel: 'census-api', read: (vintage) => readFromCensusApi(vintage, Object.values(ACS_VARIABLES)) },
  { channel: 'census-site', read: (vintage) => readFromCensusSite(vintage) },
  { channel: 'census-reporter', read: (vintage) => readFromCensusReporter(vintage) },
];

export async function fetchBostonAcs(): Promise<AcsResponse> {
  const cacheKey = 'census:bos:acs';
  const cached = globalCache.get<AcsResponse>(cacheKey);
  // Serve the warm copy first: ACS republishes once a year, and hitting the
  // Bureau on every page view is how a community site gets rate-limited.
  if (cached && cached.source !== 'census-snapshot' && cached.source !== 'unavailable') {
    return { ...cached, fromCache: true };
  }

  for (const reader of READERS) {
    if (reader.channel === 'census-api' && !hasCensusApiKey()) continue;
    for (const vintage of ACS_VINTAGES) {
      const estimates = await reader.read(vintage);
      if (!estimates || !hasHeadline(estimates)) continue;
      const response: AcsResponse = {
        vintage: vintageLabel(vintage),
        geography: 'Suffolk County, Massachusetts',
        retrievedAt: new Date().toISOString(),
        source: reader.channel,
        access: CHANNEL_ACCESS[reader.channel],
        estimates,
      };
      globalCache.set(cacheKey, response, CACHE_TTL.MARKET_DATA);
      return response;
    }
  }

  if (cached) return { ...cached, source: 'census-cache', fromCache: true };

  // Nothing answered anywhere. The verified capture keeps the page readable and
  // is labelled as a capture; a blank dashboard helps no one make a decision.
  const fallback: AcsResponse = {
    vintage: vintageLabel(ACS_SNAPSHOT.vintage),
    geography: `${ACS_SNAPSHOT.geography} (City of Boston)`,
    retrievedAt: ACS_SNAPSHOT.capturedAt,
    source: 'census-snapshot',
    snapshot: true,
    access: CHANNEL_ACCESS['census-snapshot'],
    estimates: snapshotEstimates(),
    error: `The Census Bureau could not be reached on any of its endpoints. These are the published ${vintageLabel(ACS_SNAPSHOT.vintage)} estimates for Suffolk County, captured ${ACS_SNAPSHOT.capturedAt.slice(0, 10)}; live figures return on the next successful fetch.`,
  };
  // Two minutes, not two hours: a snapshot is a bridge, and the live read
  // should retake the page at the next poll.
  globalCache.set(cacheKey, fallback, 2 * 60_000);
  return fallback;
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

export type AcsSeriesResponse = {
  points: AcsSeriesPoint[];
  source: CensusChannel;
  retrievedAt: string;
  fromCache?: boolean;
  access?: string;
};

export const ACS_SERIES_VINTAGES = ['2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'] as const;

const SERIES_TABLES = ['B25064', 'B19013', 'B25077', 'B25071'] as const;

function seriesPointFromEstimates(vintage: string, estimates: Record<string, AcsEstimate>): AcsSeriesPoint {
  const at = (variable: string) => estimates[variable]?.value ?? null;
  return {
    vintage: `${Number(vintage) - 4}–${vintage}`,
    year: Number(vintage),
    medianGrossRent: at('B25064_001E'),
    medianIncome: at('B19013_001E'),
    medianHomeValue: at('B25077_001E'),
    medianRentBurden: at('B25071_001E'),
  };
}

/**
 * Reads the same four headline variables from every published 5-year vintage.
 * Consecutive vintages overlap by four years, so the line is smooth by
 * construction and should be read as a trend, not as year-on-year change; the
 * page says so beside the chart.
 */
export async function fetchBostonAcsSeries(): Promise<AcsSeriesResponse> {
  const cacheKey = 'census:bos:series';
  const cached = globalCache.get<AcsSeriesResponse>(cacheKey);
  if (cached && cached.points.length > 0 && cached.source !== 'unavailable') {
    return { ...cached, fromCache: true };
  }

  const readVintage = async (vintage: string, read: (v: string) => Promise<Record<string, AcsEstimate> | null>): Promise<AcsSeriesPoint | null> => {
    const estimates = await read(vintage);
    return estimates ? seriesPointFromEstimates(vintage, estimates) : null;
  };

  const attempts: Array<{ channel: CensusChannel; read: (vintage: string) => Promise<Record<string, AcsEstimate> | null> }> = [
    ...(hasCensusApiKey()
      ? [{ channel: 'census-api' as const, read: (v: string) => readFromCensusApi(v, SERIES_TABLES.map((t) => `${t}_001E`)) }]
      : []),
    { channel: 'census-site', read: (v: string) => readFromCensusSite(v, SERIES_TABLES) },
    { channel: 'census-reporter', read: (v: string) => readFromCensusReporter(v, SERIES_TABLES) },
  ];

  for (const attempt of attempts) {
    const results = await pooled(ACS_SERIES_VINTAGES, POOL_SIZE, (vintage) => readVintage(vintage, attempt.read), SERIES_DEADLINE_MS);
    const points = results.filter((point): point is AcsSeriesPoint => point !== null);
    if (points.length >= 3) {
      const response: AcsSeriesResponse = {
        points,
        source: attempt.channel,
        retrievedAt: new Date().toISOString(),
        access: CHANNEL_ACCESS[attempt.channel],
      };
      globalCache.set(cacheKey, response, CACHE_TTL.MARKET_DATA);
      return response;
    }
  }

  if (cached && cached.points.length > 0) return { ...cached, source: 'census-cache', fromCache: true };
  return { points: [], source: 'unavailable', retrievedAt: new Date().toISOString() };
}
