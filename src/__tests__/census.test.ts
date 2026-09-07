/**
 * The Census reader.
 *
 * These tests exist because of a real outage: on 12 May 2026 the Census Bureau
 * began requiring an API key on every `api.census.gov` request, and a site that
 * only knew that one endpoint went blank — the market page and the home-page
 * rent card both read "Live data is unavailable". So the contract under test is
 * not "can it parse a row" but "does the market section still fill in when the
 * endpoint it used to rely on refuses to answer".
 *
 * Every fixture below is the shape the publisher actually returns, captured
 * from data.census.gov for Suffolk County (FIPS 25025) on 6 September 2026.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ACS_SNAPSHOT,
  ACS_TABLES,
  GEO_COUNTY,
  GEO_REPORTER,
  GEO_SUFFIX,
  GEO_UCGID,
  censusSiteTableUrl,
  deriveMetrics,
  estimatesFromRows,
  fetchBostonAcs,
  fetchBostonAcsSeries,
  hasCensusApiKey,
  normalizeAcsValue,
} from '@/lib/census';
import { globalCache } from '@/lib/cache';

/** Real `data.census.gov` table responses: shuffled headers, EA/MA annotation columns. */
const TABLE_ROWS: Record<string, [string[], (string | null)[]]> = {
  B19013: [
    ['GEO_ID', 'B19013_001E', 'B19013_001M', 'B19013_001EA', 'B19013_001MA', 'NAME'],
    ['0500000US25025', '95631', '1765', null, null, 'Suffolk County, Massachusetts'],
  ],
  B25058: [
    ['GEO_ID', 'B25058_001M', 'B25058_001MA', 'B25058_001E', 'B25058_001EA', 'NAME'],
    ['0500000US25025', '25', null, '1955', null, 'Suffolk County, Massachusetts'],
  ],
  B25064: [
    ['GEO_ID', 'B25064_001MA', 'B25064_001E', 'B25064_001EA', 'B25064_001M', 'NAME'],
    ['0500000US25025', null, '2129', null, '24', 'Suffolk County, Massachusetts'],
  ],
  B25077: [
    ['GEO_ID', 'B25077_001E', 'B25077_001M', 'NAME'],
    ['0500000US25025', '705800', '8139', 'Suffolk County, Massachusetts'],
  ],
  B25088: [
    ['B25088_002M', 'B25088_001E', 'B25088_002E', 'B25088_001M', 'NAME', 'GEO_ID'],
    ['46', '2425', '2962', '51', 'Suffolk County, Massachusetts', '0500000US25025'],
  ],
  B25003: [
    ['NAME', 'B25003_001E', 'GEO_ID', 'B25003_002E', 'B25003_003E', 'B25003_001M', 'B25003_002M', 'B25003_003M'],
    ['Suffolk County, Massachusetts', '327167', '0500000US25025', '119335', '207832', '1440', '2329', '2448'],
  ],
  B25071: [
    ['GEO_ID', 'B25071_001M', 'B25071_001E', 'NAME'],
    ['0500000US25025', '0.5', '31.0', 'Suffolk County, Massachusetts'],
  ],
  B25070: [
    [
      'B25070_009E', 'B25070_005E', 'B25070_007E', 'B25070_001E', 'B25070_003E', 'B25070_011E', 'B25070_006E', 'B25070_008E',
      'B25070_002E', 'B25070_004E', 'B25070_010E', 'B25070_001M', 'NAME', 'GEO_ID',
    ],
    [
      '16938', '23937', '19645', '207832', '15134', '10389', '23998', '14681',
      '9635', '21992', '51483', '2448', 'Suffolk County, Massachusetts', '0500000US25025',
    ],
  ],
};

/** What `api.census.gov` actually answers without a key since May 2026. */
const MISSING_KEY_HTML = `<!DOCTYPE html><html><body><h1>Missing Key</h1>
<p>A valid <i>key</i> must be included with each data API request.</p></body></html>`;

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } });
}

/** Flat variable → value lookup built from the table fixtures above. */
const FLAT_VALUES: Record<string, string | null> = Object.fromEntries(
  Object.values(TABLE_ROWS).flatMap(([header, row]) =>
    header
      .map((column, index) => [column, row[index]] as const)
      .filter(([column]) => /^(B\d+_\d+)(E|M)$/.test(column))
  )
);

/** A fetch that answers like the publishers: keyed API, keyless site, keyed-out API. */
function stubFetch(options: { keyedApi?: boolean } = {}) {
  const calls: string[] = [];
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    calls.push(url);

    if (url.startsWith('https://api.census.gov/')) {
      // Since 12 May 2026 an unkeyed call is answered with an HTML notice, not JSON.
      if (!options.keyedApi) return new Response(MISSING_KEY_HTML, { status: 200, headers: { 'content-type': 'text/html' } });
      const get = new URL(url).searchParams.get('get') ?? '';
      const wanted = get.split(',').filter((column) => column && column !== 'NAME');
      return jsonResponse([['NAME', ...wanted], ['Suffolk County, Massachusetts', ...wanted.map((column) => FLAT_VALUES[column] ?? null)]]);
    }

    const site = /data\.census\.gov\/api\/access\/data\/table\?id=ACSDT5Y(\d{4})\.(B\d+)/.exec(url);
    if (site) {
      const entry = TABLE_ROWS[site[2]];
      if (!entry) return jsonResponse({ code: 400, description: `There is no table with the ID: ${site[0]}` });
      return jsonResponse({ response: { data: entry, objectId: `ACSDT5Y${site[1]}.${site[2]}`, tableName: site[2] } });
    }

    if (url.startsWith('https://api.censusreporter.org/')) return jsonResponse({ error: 'stub: mirror unreachable' });
    return new Response('', { status: 502 });
  });
  vi.stubGlobal('fetch', fetchMock);
  return { fetchMock, calls };
}

beforeEach(() => {
  globalCache.clear();
  delete process.env.CENSUS_API_KEY;
  delete process.env.NEXT_PUBLIC_CENSUS_API_KEY;
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  globalCache.clear();
});

describe('geography configuration', () => {
  it('queries Suffolk County, Massachusetts, in every syntax the endpoints use', () => {
    // 025 is Suffolk (the City of Boston). 017 would be Middlesex — a
    // wrong-geography number is worse than no number at all.
    expect(GEO_SUFFIX).toBe('state:25');
    expect(GEO_COUNTY).toBe('county:025');
    expect(GEO_UCGID).toBe('050XX00US25025');
    expect(GEO_REPORTER).toBe('05000US25025');
    expect(censusSiteTableUrl('2024', 'B25064')).toBe(
      'https://data.census.gov/api/access/data/table?id=ACSDT5Y2024.B25064&g=050XX00US25025'
    );
  });

  it('covers every detailed table the dashboard shows', () => {
    expect([...ACS_TABLES].sort()).toEqual(['B19013', 'B25003', 'B25058', 'B25064', 'B25070', 'B25071', 'B25077', 'B25088'].sort());
    for (const table of ACS_TABLES) expect(TABLE_ROWS[table], `fixture missing for ${table}`).toBeDefined();
  });
});

describe('ACS value normalisation', () => {
  it('keeps real estimates, including decimals and zero', () => {
    expect(normalizeAcsValue('2129')).toBe(2129);
    expect(normalizeAcsValue('31.0')).toBe(31);
    expect(normalizeAcsValue('0')).toBe(0);
    expect(normalizeAcsValue(95631)).toBe(95631);
  });

  it('refuses to turn an ACS "no estimate" sentinel into a number', () => {
    for (const sentinel of ['-666666666', '-888888888', '-999999999', '-222222222', '2222222222', '-1111111112', '', 'null']) {
      expect(normalizeAcsValue(sentinel), sentinel).toBeNull();
    }
    expect(normalizeAcsValue(null)).toBeNull();
    expect(normalizeAcsValue(undefined)).toBeNull();
  });
});

describe('estimatesFromRows', () => {
  it('pairs each estimate with its margin of error and ignores annotation columns', () => {
    const estimates = estimatesFromRows(...TABLE_ROWS.B25058);
    // The old parser tested `endsWith('M')`, so `B25058_001MA` (an annotation
    // footnote) created a phantom variable next to the real one.
    expect(Object.keys(estimates)).toEqual(['B25058_001E']);
    expect(estimates['B25058_001E']).toMatchObject({ value: 1955, marginOfError: 25, label: 'Median contract rent' });
  });

  it('reads a table whose columns arrive in publisher order, not variable order', () => {
    const estimates = estimatesFromRows(...TABLE_ROWS.B25070);
    expect(estimates['B25070_001E']?.value).toBe(207832);
    expect(estimates['B25070_010E']?.value).toBe(51483);
    expect(estimates['B25070_011E']?.value).toBe(10389);
    expect(Object.keys(estimates)).toHaveLength(11);
  });
});

describe('fetchBostonAcs fallback chain', () => {
  it('reads the same tables from data.census.gov when api.census.gov refuses an unkeyed call', async () => {
    const { calls } = stubFetch();
    expect(hasCensusApiKey()).toBe(false);

    const acs = await fetchBostonAcs();

    expect(acs.source).toBe('census-site');
    expect(acs.snapshot).toBeUndefined();
    expect(acs.vintage).toBe('ACS 5-year 2020–2024');
    expect(acs.estimates['B25064_001E']?.value).toBe(2129);
    expect(acs.estimates['B19013_001E']?.marginOfError).toBe(1765);
    expect(acs.access).toContain('data.census.gov');
    // The keyless path never needs the endpoint that now demands a key.
    expect(calls.filter((url) => url.startsWith('https://api.census.gov/'))).toHaveLength(0);
    expect(calls.filter((url) => url.includes('data.census.gov'))).toHaveLength(ACS_TABLES.length);
  });

  it('prefers api.census.gov, and sends the key, when an operator has set one', async () => {
    process.env.CENSUS_API_KEY = 'test-key-1234';
    const { calls } = stubFetch({ keyedApi: true });

    const acs = await fetchBostonAcs();

    expect(hasCensusApiKey()).toBe(true);
    expect(acs.source).toBe('census-api');
    const apiCalls = calls.filter((url) => url.startsWith('https://api.census.gov/'));
    expect(apiCalls.length).toBeGreaterThan(0);
    // One request carries the whole variable set — that is the point of the key.
    expect(apiCalls).toHaveLength(1);
    expect(apiCalls[0]).toContain('key=test-key-1234');
    expect(apiCalls[0]).toContain('for=county:025&in=state:25');
  });

  it('treats the missing-key HTML page as a failure rather than as data', async () => {
    const { fetchMock } = stubFetch();
    // Even if every publisher is down, the reader must not invent a rent.
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes('data.census.gov')) return new Response(MISSING_KEY_HTML, { status: 200 });
        return fetchMock(input as never);
      })
    );

    const acs = await fetchBostonAcs();

    expect(acs.source).toBe('census-snapshot');
    expect(acs.snapshot).toBe(true);
    // The capture is real published data, so the cards still fill in.
    expect(acs.estimates['B25064_001E']?.value).toBe(ACS_SNAPSHOT.estimates.B25064_001E[0]);
    expect(acs.error).toMatch(/captured \d{4}-\d{2}-\d{2}/);
  });

  it('serves the warm copy instead of re-asking the Bureau on every page view', async () => {
    const { fetchMock } = stubFetch();
    const first = await fetchBostonAcs();
    const second = await fetchBostonAcs();

    expect(second.source).toBe(first.source);
    expect(second.fromCache).toBe(true);
    // Eight table reads, once — not eight per request.
    expect(fetchMock.mock.calls.filter(([input]) => String(input).includes('data.census.gov'))).toHaveLength(ACS_TABLES.length);
  });
});

describe('fetchBostonAcsSeries', () => {
  it('reads one point per published vintage from the keyless endpoint', async () => {
    stubFetch();
    const series = await fetchBostonAcsSeries();

    expect(series.source).toBe('census-site');
    expect(series.points.length).toBeGreaterThanOrEqual(13);
    const newest = series.points[series.points.length - 1];
    expect(newest).toMatchObject({
      year: 2024,
      vintage: '2020–2024',
      medianGrossRent: 2129,
      medianIncome: 95631,
      medianHomeValue: 705800,
      medianRentBurden: 31,
    });
    // Nothing is interpolated: a vintage that did not answer is simply absent.
    for (const point of series.points) expect(point.year).toBeGreaterThanOrEqual(2012);
  });

  it('reports unavailable rather than drawing a line it cannot source', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 502 })));
    const series = await fetchBostonAcsSeries();
    expect(series.source).toBe('unavailable');
    expect(series.points).toHaveLength(0);
  });
});

describe('deriveMetrics on the published Suffolk County figures', () => {
  const metrics = deriveMetrics(
    Object.fromEntries(
      Object.entries(ACS_SNAPSHOT.estimates).map(([variable, [value, marginOfError]]) => [
        variable,
        { variable, label: variable, value, marginOfError: marginOfError ?? null },
      ])
    )
  );

  it('reports the headline numbers the market page shows', () => {
    expect(metrics.medianGrossRent).toBe(2129);
    expect(metrics.medianContractRent).toBe(1955);
    expect(metrics.medianIncome).toBe(95631);
    expect(metrics.medianHomeValue).toBe(705800);
    expect(metrics.medianRentBurden).toBe(31);
  });

  it('counts renters as a share of occupied homes, not of all homes', () => {
    // 207,832 renter-occupied of 327,167 occupied.
    expect(metrics.renterShare).toBe(63.5);
  });

  it('excludes households ACS could not compute from the burden denominator', () => {
    // (19645 + 14681 + 16938 + 51483) / (207832 - 10389) = 52.0%
    expect(metrics.burden30).toBe(52);
    // (16938 + 51483) / 197443 = 34.7%
    expect(metrics.burden40).toBe(34.7);
    expect(metrics.burdenDistribution).toHaveLength(9);
    expect(metrics.burdenDistribution?.reduce((sum, bin) => sum + bin.share, 0)).toBeCloseTo(100, 0);
  });

  it('prices a move-in as first month plus deposit, in months of income', () => {
    // 2 × $2,129 ÷ ($95,631 / 12) = 0.5 months
    expect(metrics.moveInCost).toBe(0.5);
  });
});

describe('the committed capture', () => {
  it('is internally consistent, because there is no live read behind it to disagree with', () => {
    const at = (variable: string) => ACS_SNAPSHOT.estimates[variable]?.[0] ?? null;
    const bins = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((n) => at(`B25070_${String(n).padStart(3, '0')}E`) ?? 0);
    expect(bins.reduce((a, b) => a + b, 0)).toBe(at('B25070_001E'));
    expect(at('B25003_003E')).toBe(at('B25070_001E'));
    expect(at('B25003_002E')! + at('B25003_003E')!).toBe(at('B25003_001E'));
    // Gross rent is contract rent plus utilities, so it must be the larger figure.
    expect(at('B25064_001E')!).toBeGreaterThan(at('B25058_001E')!);
  });

  it('names its vintage and capture date so the page can label it', () => {
    expect(ACS_SNAPSHOT.vintage).toMatch(/^\d{4}$/);
    expect(ACS_SNAPSHOT.geography).toContain('Suffolk');
    expect(new Date(ACS_SNAPSHOT.capturedAt).toISOString()).toBe(ACS_SNAPSHOT.capturedAt);
  });
});

describe('the label on the home-page rent card', () => {
  it('names the figure the card actually shows', async () => {
    const { en } = await import('@/i18n/en');
    // The "Dorchester at a glance" card shows ACS B25064 — median gross rent
    // for all unit sizes. It used to read "Median two bedroom rent", a number
    // the site never had, which is how a card contradicts its own detail panel.
    expect(en['stats.medianRent']).toMatch(/gross rent/i);
    expect(en['stats.medianRent']).not.toMatch(/bedroom|two bedroom|2 br/i);
    // B25077 is the owner's estimate of value, not a recorded sale price.
    expect(en['stats.medianSale']).toMatch(/value/i);
    expect(en['stats.medianSale']).not.toMatch(/sale price/i);
  });
});
