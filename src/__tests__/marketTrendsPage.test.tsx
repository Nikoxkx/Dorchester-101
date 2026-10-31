/**
 * The Market trends page, rendered.
 *
 * The API tests prove the payload is populated; this proves the page puts it on
 * the screen. It drives the real route handler to build the payload, hands it to
 * the real page through `fetch('/api/market-data')`, and then looks for the
 * figures in the DOM — because "the endpoint returns 2,129" and "the reader can
 * see $2,129" are not the same claim, and the bug this section shipped with was
 * a page full of em-dashes behind a perfectly reasonable-looking API.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useAppStore } from '@/stores/appStore';
import { LANGUAGES } from '@/i18n/config';
import { dictionaries } from '@/i18n';
import { formatCurrency, formatPercent, formatYear } from '@/i18n/formatters';
import { makeTranslator } from '@/i18n/runtime';

// The site frame needs a Next router (`usePathname`) and a real matchMedia;
// neither exists in jsdom, and neither has anything to do with whether the
// market section fills in. Render the section on its own.
vi.mock('@/components/layout/MainLayout', () => ({
  MainLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import MarketTrendsPage from '@/app/market-trends/page';
import { GET } from '@/app/api/market-data/route';
import { globalCache } from '@/lib/cache';

/** data.census.gov table bodies for Suffolk County, ACS 5-year 2020–2024. */
const TABLES: Record<string, [string[], (string | null)[]]> = {
  B19013: [['GEO_ID', 'B19013_001E', 'B19013_001M', 'NAME'], ['0500000US25025', '95631', '1765', 'Suffolk County, Massachusetts']],
  B25058: [['GEO_ID', 'B25058_001E', 'B25058_001M', 'NAME'], ['0500000US25025', '1955', '25', 'Suffolk County, Massachusetts']],
  B25064: [['GEO_ID', 'B25064_001E', 'B25064_001M', 'NAME'], ['0500000US25025', '2129', '24', 'Suffolk County, Massachusetts']],
  B25077: [['GEO_ID', 'B25077_001E', 'B25077_001M', 'NAME'], ['0500000US25025', '705800', '8139', 'Suffolk County, Massachusetts']],
  B25088: [['B25088_001E', 'B25088_002E', 'B25088_002M', 'NAME'], ['2425', '2962', '46', 'Suffolk County, Massachusetts']],
  B25003: [['NAME', 'B25003_001E', 'B25003_002E', 'B25003_003E'], ['Suffolk County, Massachusetts', '327167', '119335', '207832']],
  B25071: [['GEO_ID', 'B25071_001E', 'B25071_001M', 'NAME'], ['0500000US25025', '31.0', '0.5', 'Suffolk County, Massachusetts']],
  B25070: [
    ['B25070_001E', 'B25070_002E', 'B25070_003E', 'B25070_004E', 'B25070_005E', 'B25070_006E', 'B25070_007E', 'B25070_008E', 'B25070_009E', 'B25070_010E', 'B25070_011E'],
    ['207832', '9635', '15134', '21992', '23937', '23998', '19645', '14681', '16938', '51483', '10389'],
  ],
};

const realFetch = globalThis.fetch;

/** Publishers answer; everything else (HUD, mass.gov) is unreachable. */
function stubPublishers(): void {
  globalCache.clear();
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const site = /data\.census\.gov\/api\/access\/data\/table\?id=ACSDT5Y\d{4}\.(B\d+)/.exec(url);
      if (site && TABLES[site[1]]) {
        return new Response(JSON.stringify({ response: { data: TABLES[site[1]], tableName: site[1] } }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        });
      }
      return new Response('', { status: 502 });
    })
  );
}

/** Builds the real payload, then points the page's own fetch at it. */
async function serveRouteToPage(): Promise<void> {
  stubPublishers();
  const payload = await (await GET()).json();
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/api/market-data')) {
        return new Response(JSON.stringify(payload), { status: 200, headers: { 'content-type': 'application/json' } });
      }
      return realFetch(input as never);
    })
  );
}

beforeEach(() => {
  globalCache.clear();
  delete process.env.CENSUS_API_KEY;
  // jsdom reports zero size, so recharts never measures a chart; that is fine —
  // the numbers under test are the ones printed beside the charts.
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  act(() => useAppStore.getState().setLanguage('en'));
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  globalCache.clear();
});

describe('Market trends page', () => {
  it('switches the snapshot labels, source status and geography in every language', async () => {
    await serveRouteToPage();
    render(<MarketTrendsPage />);
    await waitFor(() => expect(screen.getByText('Live from Census')).toBeTruthy(), { timeout: 4000 });
    for (const { code } of LANGUAGES) {
      act(() => useAppStore.getState().setLanguage(code));
      expect(screen.getByText(dictionaries[code]['market.rentLabel'])).toBeTruthy();
      expect(screen.getByText(dictionaries[code]['market.incomeLabel'])).toBeTruthy();
      expect(screen.getByText(dictionaries[code]['market.renterNote'])).toBeTruthy();
      expect(screen.getByText(dictionaries[code]['market.liveCensus'])).toBeTruthy();
      expect(screen.getByText(dictionaries[code]['market.geographyIntro'])).toBeTruthy();
      expect(screen.getByRole('tablist', { name: dictionaries[code]['market.metric'] })).toBeTruthy();
      expect(screen.getByRole('tab', { name: dictionaries[code]['market.rentTab'] })).toBeTruthy();
      expect(screen.getByText(dictionaries[code]['market.renters30'])).toBeTruthy();
      expect(screen.getByText(dictionaries[code]['market.renters40'])).toBeTruthy();
      expect(screen.getByText(dictionaries[code]['market.distributionNote'])).toBeTruthy();
      expect(screen.getByText(dictionaries[code]['market.trendExplain'])).toBeTruthy();
      expect(screen.getByText(dictionaries[code]['market.affordabilityExplain'])).toBeTruthy();
      expect(screen.getByText(dictionaries[code]['market.growthExplain'])).toBeTruthy();
      expect(screen.getByText(dictionaries[code]['market.rentByType'])).toBeTruthy();
      expect(screen.getByRole('img', { name: dictionaries[code]['market.distributionAria'] })).toBeTruthy();
      const t = makeTranslator(dictionaries[code], code);
      expect(screen.getByText(t('market.sourceHud'))).toBeTruthy();
      expect(screen.getByText(t('market.sourceWage'))).toBeTruthy();
      expect(screen.getByText(t('market.listingsReason'))).toBeTruthy();
      expect(screen.getByText(t('market.reportMismatch'))).toBeTruthy();
      expect(screen.getByRole('link', { name: t('market.aboutLink') }).getAttribute('href')).toBe('/about');
      for (const key of ['market.portalMetro', 'market.portalNavigator', 'market.portalHome', 'market.portalBha'] as const) {
        expect(screen.getByRole('link', { name: t(key) })).toBeTruthy();
      }
      expect(screen.getByText(t('market.accessSite'), { exact: false })).toBeTruthy();
      if (code !== 'en') expect(screen.getByRole('note').textContent).toContain(dictionaries[code]['lang.someEnglish']);
    }
    act(() => useAppStore.getState().setLanguage('en'));
  }, 15_000); // One rendered chart is switched through all nine locales.

  it('localizes the income-limit estimates and labels them as estimates', async () => {
    stubPublishers();
    const payload = await (await GET()).json();
    payload.ami.table = { '1-person household': 95000, '2-person household': 108000 };
    payload.ami.snapshot = true;
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(payload), { status: 200 })));
    render(<MarketTrendsPage />);
    await waitFor(() => expect(screen.getByText('1-person household')).toBeTruthy());
    for (const { code } of LANGUAGES) {
      act(() => useAppStore.getState().setLanguage(code));
      const t = makeTranslator(dictionaries[code], code);
      expect(screen.getByText(t('market.householdSize', { count: 1 }))).toBeTruthy();
      expect(screen.getByText(t('market.householdSize', { count: 2 }))).toBeTruthy();
      expect(screen.getByText(t('market.amiExplanation'), { exact: false })).toBeTruthy();
      expect(screen.getByText(t('market.amiSnapshotNote'), { exact: false })).toBeTruthy();
      expect(screen.getByRole('heading', { name: `${t('housing.amiCalculator')} · ${t('market.incomeLimitsTitle', { year: formatYear(payload.ami.effectiveYear, code) })}` })).toBeTruthy();
      const estimate = t('market.eightyEstimate', { amount: formatCurrency(76000, code) });
      expect(Array.from(document.querySelectorAll('p')).some((node) => node.textContent === estimate)).toBe(true);
    }
  });

  it('does not claim the income-limit workbook loaded when no values are available', async () => {
    stubPublishers();
    const payload = await (await GET()).json();
    payload.ami.table = {};
    payload.ami.snapshot = false;
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(payload), { status: 200 })));
    render(<MarketTrendsPage />);
    await waitFor(() => expect(screen.getByText(dictionaries.en['market.amiUnavailable'])).toBeTruthy());
    expect(screen.queryByText(dictionaries.en['market.amiLiveNote'], { exact: false })).toBeNull();
    expect(screen.getByRole('heading', { name: `${dictionaries.en['housing.amiCalculator']} · ${dictionaries.en['market.unavailable']}` })).toBeTruthy();
    expect(screen.queryByText(/income-limit estimate/)).toBeNull();
    act(() => useAppStore.getState().setLanguage('ar'));
    expect(screen.getByText(dictionaries.ar['market.amiUnavailable'])).toBeTruthy();
  });

  it('labels an unknown portal as English rather than pretending it was translated', async () => {
    stubPublishers();
    const payload = await (await GET()).json();
    payload.listings.officialPortals.push({ label: 'New program portal', url: 'https://example.org' });
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(payload), { status: 200 })));
    useAppStore.getState().setLanguage('es');
    render(<MarketTrendsPage />);
    const link = await screen.findByRole('link', { name: 'New program portal' });
    expect(link.querySelector('[lang="en"]')?.textContent).toBe('New program portal');
    expect(screen.getByRole('note').textContent).toContain(dictionaries.es['lang.someEnglish']);
  });

  it('uses ACS 30%-and-above bins and does not call 40% severe HUD burden', async () => {
    useAppStore.getState().setLanguage('en');
    await serveRouteToPage();
    render(<MarketTrendsPage />);
    await waitFor(() => expect(screen.getByText('Live from Census')).toBeTruthy(), { timeout: 4000 });
    expect(screen.getByText('Renters paying 30% or more')).toBeTruthy();
    expect(screen.getByText(/above 50% severely cost-burdened/)).toBeTruthy();
    expect(screen.queryByText(/40% and above \(severely burdened\)/)).toBeNull();
    fireEvent.click(screen.getByRole('tab', { name: dictionaries.en['market.burdenTab'] }));
    expect(screen.getByRole('tab', { name: dictionaries.en['market.burdenTab'] }).getAttribute('aria-selected')).toBe('true');
    expect(screen.getByText(dictionaries.en['market.trendBurdenExplain'], { exact: false })).toBeTruthy();
  });

  it('translates the no-chart state when trend data is missing', async () => {
    stubPublishers();
    const payload = await (await GET()).json();
    payload.series.points = [];
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(payload), { status: 200 })));
    useAppStore.getState().setLanguage('es');
    render(<MarketTrendsPage />);
    await waitFor(() => expect(screen.getAllByText(dictionaries.es['market.noChart']).length).toBeGreaterThan(0));
    useAppStore.getState().setLanguage('en');
  });

  it('describes a negative gap as a surplus over the guideline, not an unpaid rent', async () => {
    stubPublishers();
    const payload = await (await GET()).json();
    payload.derived.affordableRentAtWage = { wageCents: 5000, monthly: 2600 };
    payload.derived.gapPercent = -22.1;
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(payload), { status: 200 })));
    useAppStore.getState().setLanguage('es');
    render(<MarketTrendsPage />);
    const t = makeTranslator(dictionaries.es, 'es');
    const expected = t('market.gapSurplus', {
      rent: formatCurrency(2129, 'es'),
      percent: formatPercent(0.221, 'es', 1),
    });
    await waitFor(() => expect(screen.getByText(/En esta comparación, la cantidad de la pauta/)).toBeTruthy());
    expect(screen.getByText(/En esta comparación, la cantidad de la pauta/).textContent).toBe(expected);
    expect(screen.getByText(t('market.budgetMethod'))).toBeTruthy();
    expect(screen.getByText(/Con el salario mínimo de Massachusetts/).textContent).toBe(t('market.wageGuideline', {
      wage: formatCurrency(50, 'es', { cents: true }),
      amount: formatCurrency(2600, 'es'),
    }));
    useAppStore.getState().setLanguage('en');
  });

  it('prints the Census figures instead of em-dashes', async () => {
    await serveRouteToPage();
    render(<MarketTrendsPage />);

    // The four snapshot cards.
    await waitFor(() => expect(screen.getByText('$2,129')).toBeTruthy(), { timeout: 4000 });
    expect(screen.getByText('$95,631')).toBeTruthy();
    expect(screen.getByText('$705,800')).toBeTruthy();
    expect(screen.getByText('63.5%')).toBeTruthy();

    // The "what this means for your budget" row.
    expect(screen.getAllByText('31.0%').length).toBeGreaterThan(0);
    expect(screen.getByText('52.0%')).toBeTruthy();
    expect(screen.getByText('34.7%')).toBeTruthy();

    // And the panel says the read was live, not a stand-in.
    expect(screen.getByText('Live from Census')).toBeTruthy();
    expect(screen.queryByText(dictionaries.en['market.noChart'])).toBeNull();
  });

  it('names the vintage and the geography it read', async () => {
    await serveRouteToPage();
    render(<MarketTrendsPage />);

    await waitFor(() => expect(screen.getByText('Live from Census')).toBeTruthy(), { timeout: 4000 });
    expect(screen.getByText(/Suffolk County, Massachusetts/)).toBeTruthy();
    expect(screen.getAllByText(/ACS 5-year 2020–2024/).length).toBeGreaterThan(0);
    // The citation says which endpoint produced the figures.
    expect(screen.getAllByText(/data\.census\.gov table service/).length).toBeGreaterThan(0);
  });

  it('says a capture is a capture when the Bureau is unreachable', async () => {
    globalCache.clear();
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/api/market-data')) {
        vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 502 })));
        const body = await (await GET()).json();
        vi.stubGlobal(
          'fetch',
          vi.fn(async () => new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } }))
        );
        return new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } });
      }
      return new Response('', { status: 502 });
    }));

    render(<MarketTrendsPage />);

    await waitFor(() => expect(screen.getAllByText('Verified capture').length).toBeGreaterThan(0), { timeout: 4000 });
    // The headline figures are still there, and labelled as a capture.
    expect(screen.getByText('$2,129')).toBeTruthy();
    expect(screen.getAllByText(/verified capture|Verified capture/i).length).toBeGreaterThan(0);
  });
});
