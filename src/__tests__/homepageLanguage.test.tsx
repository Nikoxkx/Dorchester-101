import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { dictionaries } from '@/i18n';
import { LANGUAGES } from '@/i18n/config';
import { formatCurrency } from '@/i18n/formatters';
import { makeTranslator } from '@/i18n/runtime';
import { useAppStore } from '@/stores/appStore';

vi.mock('@/components/layout/MainLayout', () => ({ MainLayout: ({ children }: { children: React.ReactNode }) => <main>{children}</main> }));
vi.mock('@/components/dashboard/EmergencyBanner', () => ({ EmergencyBanner: () => null }));
vi.mock('@/hooks/useNow', () => ({ useNow: () => Date.parse('2026-10-31T16:00:00Z'), useHydratedNow: () => Date.parse('2026-10-31T16:00:00Z') }));

import DashboardPage from '@/app/page';

const market = {
  geography: 'Suffolk County, Massachusetts',
  acs: {
    status: 'live', vintage: '2020–2024', retrievedAt: '2026-10-31T12:00:00Z',
    metrics: { medianGrossRent: 2000, medianIncome: 100000, renterShare: 62, burden30: 40, burden40: 25 },
  },
  derived: { affordableRentAtWage: { wageCents: 1550, monthly: 806 }, gapPercent: 60 },
};

beforeEach(() => {
  useAppStore.getState().resetAll();
  const state = useAppStore.getState();
  state.setAccessibility('reduceMotion', 'on');
  state.setHomeLayout({ ...state.homeLayout, hidden: state.homeLayout.order.filter((id) => id !== 'glance') });
  vi.stubGlobal('fetch', vi.fn(async (url: string) => new Response(JSON.stringify(
    url.startsWith('/api/market-data') ? market : { articles: [] },
  ), { status: 200, headers: { 'content-type': 'application/json' } })));
});
afterEach(() => vi.unstubAllGlobals());

describe('homepage statistic disclosures', () => {
  it('shows Suffolk County on the unopened rent card and translates the wage example', async () => {
    render(<DashboardPage />);
    await waitFor(() => expect(screen.getByText(/2020–2024.*B25064/)).toBeTruthy());
    let card = screen.getByText(dictionaries.en['stats.medianRent']).parentElement!;
    expect(within(card).getByText(dictionaries.en['glance.rent.geography'])).toBeTruthy();
    expect(within(card).queryByText(/Illustrative 30%/)).toBeNull();
    fireEvent.click(within(card).getByRole('button', { name: dictionaries.en['common.showMore'] }));
    expect(within(card).getByText(/Illustrative 30%.*40 hours.*\$806.*Actual affordability varies/)).toBeTruthy();
    expect(within(card).getByRole('link', { name: dictionaries.en['nav.market'] }).getAttribute('href')).toBe('/market-trends');

    for (const { code } of LANGUAGES) {
      act(() => useAppStore.getState().setLanguage(code));
      const t = makeTranslator(dictionaries[code], code);
      card = screen.getByText(t('stats.medianRent')).parentElement!;
      expect(within(card).getAllByText(t('glance.rent.geography')).length).toBeGreaterThan(0);
      const example = t('glance.rent.wage', { value: formatCurrency(806, code) });
      expect(within(card).getAllByRole('listitem').some((item) => item.textContent === example), code).toBe(true);
      expect(example, code).toContain('30%');
      expect(example, code).toContain('40');
      const geography = t('glance.rent.geography');
      for (const name of ['Suffolk', 'Boston', 'Chelsea', 'Revere', 'Winthrop', 'Dorchester']) {
        expect(geography, code).toContain(name);
      }
    }
  });

  it('does not fabricate the wage example when the published wage is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) => new Response(JSON.stringify(
      url.startsWith('/api/market-data') ? { ...market, derived: { affordableRentAtWage: null } } : { articles: [] },
    ), { status: 200 })));
    render(<DashboardPage />);
    await waitFor(() => expect(screen.getByText(/2020–2024.*B25064/)).toBeTruthy());
    const card = screen.getByText(dictionaries.en['stats.medianRent']).parentElement!;
    fireEvent.click(within(card).getByRole('button', { name: dictionaries.en['common.showMore'] }));
    expect(within(card).queryByText(/Illustrative 30%/)).toBeNull();
    expect(within(card).getAllByText(dictionaries.en['glance.rent.geography']).length).toBeGreaterThan(0);
  });
});
