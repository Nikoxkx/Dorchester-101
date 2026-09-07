/**
 * The market-data route, end to end.
 *
 * This is the contract both the Market trends page and the home page's
 * "Dorchester at a glance" card are built on, so it is tested at the route
 * rather than at the library: if the payload stops carrying the rent figure,
 * the dashboard shows "Live data is unavailable" no matter how correct the
 * reader is.
 *
 * The fetch stub answers with the publishers' real response shapes — Census
 * table JSON for Suffolk County, and a refusal for everything else — so the
 * route's own assembly of metrics, series, citations and HUD figures is what
 * runs here.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from '@/app/api/market-data/route';
import { globalCache } from '@/lib/cache';
import type { MarketResponse } from '@/app/api/market-data/route';

/** Real data.census.gov table bodies for Suffolk County, ACS 5-year 2020–2024. */
const TABLES: Record<string, [string[], (string | null)[]]> = {
  B19013: [['GEO_ID', 'B19013_001E', 'B19013_001M', 'NAME'], ['0500000US25025', '95631', '1765', 'Suffolk County, Massachusetts']],
  B25058: [['GEO_ID', 'B25058_001M', 'B25058_001E', 'NAME'], ['0500000US25025', '25', '1955', 'Suffolk County, Massachusetts']],
  B25064: [['GEO_ID', 'B25064_001E', 'B25064_001M', 'NAME'], ['0500000US25025', '2129', '24', 'Suffolk County, Massachusetts']],
  B25077: [['GEO_ID', 'B25077_001E', 'B25077_001M', 'NAME'], ['0500000US25025', '705800', '8139', 'Suffolk County, Massachusetts']],
  B25088: [['B25088_001E', 'B25088_002E', 'B25088_002M', 'NAME'], ['2425', '2962', '46', 'Suffolk County, Massachusetts']],
  B25003: [
    ['NAME', 'B25003_001E', 'B25003_002E', 'B25003_003E', 'B25003_003M'],
    ['Suffolk County, Massachusetts', '327167', '119335', '207832', '2448'],
  ],
  B25071: [['GEO_ID', 'B25071_001E', 'B25071_001M', 'NAME'], ['0500000US25025', '31.0', '0.5', 'Suffolk County, Massachusetts']],
  B25070: [
    ['B25070_001E', 'B25070_002E', 'B25070_003E', 'B25070_004E', 'B25070_005E', 'B25070_006E', 'B25070_007E', 'B25070_008E', 'B25070_009E', 'B25070_010E', 'B25070_011E'],
    ['207832', '9635', '15134', '21992', '23937', '23998', '19645', '14681', '16938', '51483', '10389'],
  ],
};

function publishersAnswer(): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      const site = /data\.census\.gov\/api\/access\/data\/table\?id=ACSDT5Y(\d{4})\.(B\d+)/.exec(url);
      if (site && TABLES[site[2]]) {
        return new Response(JSON.stringify({ response: { data: TABLES[site[2]], tableName: site[2] } }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        });
      }
      // HUD, mass.gov, api.census.gov and the mirror: all unreachable.
      return new Response('', { status: 502 });
    })
  );
}

function nothingAnswers(): void {
  vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 502 })));
}

async function payload(): Promise<MarketResponse> {
  const response = await GET();
  expect(response.status).toBe(200);
  return (await response.json()) as MarketResponse;
}

beforeEach(() => {
  globalCache.clear();
  delete process.env.CENSUS_API_KEY;
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  globalCache.clear();
});

describe('/api/market-data', () => {
  it('fills the whole section from the keyless Census endpoint', async () => {
    publishersAnswer();
    const body = await payload();

    expect(body.geography).toContain('Suffolk County');
    expect(body.acs.status).toBe('live');
    expect(body.acs.vintage).toBe('ACS 5-year 2020–2024');
    expect(body.acs.access).toContain('data.census.gov');
    expect(body.acs.keyConfigured).toBe(false);

    // The four headline cards.
    expect(body.acs.metrics.medianGrossRent).toBe(2129);
    expect(body.acs.metrics.medianHomeValue).toBe(705800);
    expect(body.acs.metrics.medianIncome).toBe(95631);
    expect(body.acs.metrics.renterShare).toBe(63.5);

    // The "what this means for your budget" cards.
    expect(body.acs.metrics.medianRentBurden).toBe(31);
    expect(body.acs.metrics.burden30).toBe(52);
    expect(body.acs.metrics.burden40).toBe(34.7);
    expect(body.acs.metrics.burdenDistribution).toHaveLength(9);

    // The raw table, with margins of error, for anyone checking the arithmetic.
    expect(body.acs.raw.medianGrossRent).toMatchObject({ value: 2129, marginOfError: 24, label: 'Median gross rent' });

    // The citation points at the vintage that actually answered.
    expect(body.acs.citation.url).toContain('y=2024');
    expect(body.acs.citation.url).toContain('g=0500000US25025');
  });

  it('returns one trend point per published vintage for the twelve-year chart', async () => {
    publishersAnswer();
    const body = await payload();

    expect(body.series.status).toBe('live');
    expect(body.series.points).toHaveLength(13);
    expect(body.series.points.map((point) => point.year)).toEqual([2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024]);
    // Rent, income, value and burden all arrive, so the affordability and
    // indexed-growth charts have three series each rather than an empty frame.
    for (const point of body.series.points) {
      expect(point.medianGrossRent).not.toBeNull();
      expect(point.medianIncome).not.toBeNull();
      expect(point.medianHomeValue).not.toBeNull();
      expect(point.medianRentBurden).not.toBeNull();
    }
  });

  it('still fills the headline figures when every publisher is down', async () => {
    nothingAnswers();
    const body = await payload();

    // This is the regression the whole reader rewrite exists to prevent: an
    // outage used to blank the section, so there was nothing to read.
    expect(body.acs.status).toBe('snapshot');
    expect(body.acs.snapshot).toBe(true);
    expect(body.acs.metrics.medianGrossRent).toBe(2129);
    expect(body.acs.metrics.burden30).toBe(52);
    expect(body.acs.error).toMatch(/captured \d{4}-\d{2}-\d{2}/);

    // A double outage leaves the charts honest about having nothing to draw.
    expect(body.series.status).toBe('unavailable');
    expect(body.series.points).toHaveLength(0);
  });

  it('keeps the HUD ladder and the official portals in the payload', async () => {
    publishersAnswer();
    const body = await payload();

    // HUD is unreachable here, so the verified capture is served and labelled.
    expect(body.hudFmr.status).toBe('available');
    expect(Object.keys(body.ami.table)).toHaveLength(8);
    expect(body.ami.snapshot).toBe(true);
    expect(body.listings.officialPortals.map((portal) => portal.label)).toEqual([
      'Boston One Stop (city-owned affordable units)',
      'MassAccess (state affordable housing portal)',
      'Go Housing Link (BPDA income-restricted listings)',
    ]);
  });

  it('does not invent an affordability figure when the wage page is unreachable', async () => {
    publishersAnswer();
    const body = await payload();

    // mass.gov is down in this fixture, so the $/hour the card quotes is gone
    // rather than remembered — the page then omits the sentence entirely.
    expect(body.derived.affordableRentAtWage).toBeNull();
    expect(body.derived.gapPercent).toBeNull();
  });

  it('caches at the edge for a day, since ACS republishes once a year', async () => {
    publishersAnswer();
    const response = await GET();
    expect(response.headers.get('cache-control')).toContain('s-maxage=86400');
  });
});
