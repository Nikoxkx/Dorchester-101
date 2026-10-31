import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { useAppStore } from '@/stores/appStore';
import { RESOURCES } from '@/data/resources';
import { formatWindowForLocale } from '@/lib/hours';
import { dictionaries } from '@/i18n';
import { LANGUAGES } from '@/i18n/config';
import { globalCache } from '@/lib/cache';
import { GET as resourcesGET } from '@/app/api/resources/route';

// This is already Saturday in UTC, but still Friday at 9 PM in Boston.
const clock = vi.hoisted(() => ({ now: Date.parse('2026-09-05T01:00:00Z') }));
vi.mock('@/hooks/useNow', () => ({ useNow: () => clock.now, useHydratedNow: () => clock.now }));
vi.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams() }));
vi.mock('@/components/layout/MainLayout', () => ({ MainLayout: ({ children }: { children: React.ReactNode }) => <main>{children}</main> }));
vi.mock('@/components/layout/ProjectNote', () => ({ ProjectNote: () => null }));
vi.mock('@/components/a11y/ReportProblem', () => ({ ReportProblem: () => null }));
vi.mock('@/components/a11y/ListenButton', () => ({ ListenButton: () => null }));
vi.mock('@/components/resources/QRPoster', () => ({ QRPoster: () => null }));
vi.mock('@/components/pwa/FieldNotes', () => ({ FieldNotes: () => null }));
vi.mock('@/components/projects/SiteImagery', () => ({ SiteImagery: () => null }));

import { ResourcesView } from '@/app/resources/ResourcesView';
import { DirectoryView } from '@/app/directory/DirectoryView';
import FoodPageView from '@/app/food/FoodPageView';
import { PlaceSheet } from '@/components/map/PlaceSheet';

const hotline = RESOURCES.find((item) => item.id === 'bostons-food-district')!;
const fridayHours = formatWindowForLocale(hotline.hours![4][0], 'en-US');

beforeEach(() => { clock.now = Date.parse('2026-09-05T01:00:00Z'); useAppStore.getState().resetAll(); });

describe('Boston-local resource hours', () => {
  it.each([['resources', ResourcesView], ['directory', DirectoryView], ['food', FoodPageView]])(
    'shows Friday hours on the %s view even when the device clock is on Saturday', (_name, View) => {
      render(<View />);
      const card = screen.getByRole('heading', { name: hotline.name }).closest('article')!;
      expect(card.textContent).toContain(fridayHours);
      if (_name === 'resources') {
        fireEvent.click(within(card).getByRole('button', { name: dictionaries.en['directory.allHours'] }));
        const firstWeekday = within(card).getAllByRole('rowheader')[0];
        expect(firstWeekday.textContent).toBe('Fri');
      }
      if (_name === 'directory') {
        fireEvent.click(within(card).getByRole('button', { name: dictionaries.en['directory.allHours'] }));
        expect(within(card).getAllByRole('rowheader')[0].textContent).toBe('Mon');
      }
    },
  );

  it('formats map status as wall-clock minutes and names tomorrow', () => {
    render(<PlaceSheet target={{ kind: 'place', id: hotline.id }} arrivals={[]} arrivalsLive={false} userPosition={null} onClose={() => {}} onSelectStop={() => {}} onLocate={() => {}} />);
    expect(screen.getByText(/Opens tomorrow at 10:00 AM/)).toBeTruthy();
    expect(screen.getByText(`Today ${fridayHours}`)).toBeTruthy();
    expect(screen.queryByText(/opens 12:00 AM/i)).toBeNull();
  });

  it('shows the correct closing time for an open map record', () => {
    clock.now = Date.parse('2026-09-04T22:30:00Z'); // Friday 6:30 PM Boston
    render(<PlaceSheet target={{ kind: 'place', id: hotline.id }} arrivals={[]} arrivalsLive={false} userPosition={null} onClose={() => {}} onSelectStop={() => {}} onLocate={() => {}} />);
    expect(screen.getByText(/until 7:00 PM/)).toBeTruthy();
    expect(screen.queryByText(/until 12:00 AM/i)).toBeNull();
  });

  it('keeps the advertised hotline schedule in every language aligned with its recorded hours', () => {
    expect(hotline.hours![0][0]).toMatchObject({ startsAt: 8 * 60, endsAt: 19 * 60 });
    expect(hotline.hours![5][0]).toMatchObject({ startsAt: 10 * 60, endsAt: 14 * 60 });
    expect(hotline.hours![6]).toHaveLength(0);
    expect(dictionaries.en['food.hotlineHours']).toContain('7:00 PM');
    expect(dictionaries.en['food.hotlineHours']).toContain('Saturday');
    for (const { code } of LANGUAGES) {
      const value = dictionaries[code]['food.hotlineHours'];
      expect(value).toContain('8');
      expect(value).toContain('10');
      expect(value).toMatch(/7|19/);
      expect(value).toMatch(/2|14/);
    }
  });

  it('labels a recently reviewed but unresolved listing as needing review, not zero days stale', () => {
    clock.now = Date.parse('2026-10-31T20:00:00Z');
    render(<FoodPageView />);
    const card = screen.getByRole('heading', { name: 'Dorchester Food Co-op' }).closest('article')!;
    expect(within(card).getByText(dictionaries.en['directory.needsReview'])).toBeTruthy();
    expect(card.textContent).not.toContain('0 d ago');
  });

  it('shows a continuous phone service as open without a midnight closing time', async () => {
    clock.now = Date.parse('2026-09-05T03:45:00Z');
    const service = RESOURCES.find((item) => item.id === 'boston-language-access')!;
    render(<PlaceSheet target={{ kind: 'place', id: service.id }} arrivals={[]} arrivalsLive={false} userPosition={null} onClose={() => {}} onSelectStop={() => {}} onLocate={() => {}} />);
    expect(screen.getByText(dictionaries.en['common.open'])).toBeTruthy();
    expect(screen.queryByText(/closing soon/i)).toBeNull();
    expect(screen.queryByText(/until 12:00 AM/i)).toBeNull();
    globalCache.clear();
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date(clock.now));
      const body = await (await resourcesGET(new Request(`http://localhost/api/resources?id=${service.id}`))).json();
      expect(body.results[0].status).toEqual({ state: 'always-open' });
      expect(body.results[0].openNow).toBe(true);
    } finally { globalCache.clear(); vi.useRealTimers(); }
  });

  it('does not assert Grove Hall is open during an early closure', async () => {
    const library = RESOURCES.find((item) => item.id === 'grove-hall-library')!;
    clock.now = Date.parse('2026-11-06T21:30:00Z'); // 4:30 PM Boston; BPL listed a 4 PM closure
    render(<PlaceSheet target={{ kind: 'place', id: library.id }} arrivals={[]} arrivalsLive={false} userPosition={null} onClose={() => {}} onSelectStop={() => {}} onLocate={() => {}} />);
    expect(screen.queryByText(dictionaries.en['common.open'])).toBeNull();
    expect(screen.getByText(library.hoursNote!)).toBeTruthy();
    globalCache.clear();
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date(clock.now));
      const body = await (await resourcesGET(new Request(`http://localhost/api/resources?id=${library.id}`))).json();
      expect(body.results[0].openNow).toBeNull();
      expect(body.results[0].status).toBeNull();
      expect(body.results[0].hours.week).toBeNull();
      expect(body.results[0].hours.note).toBe(library.hoursNote);
      const openOnly = await (await resourcesGET(new Request(`http://localhost/api/resources?id=${library.id}&open=1`))).json();
      expect(openOnly.results).toHaveLength(0);
    } finally { globalCache.clear(); vi.useRealTimers(); }
  });

  it.each([
    ['somali-development-center', 42.32931, -71.08638, '(617) 522-0700'],
    ['vietaid', 42.29993, -71.06354, '(617) 822-3717'],
    ['cpcs-boston', 42.3551, -71.0567, '(617) 482-6212'],
  ])('keeps %s hours and accessibility unknown in the API', async (id, lat, lng, phone) => {
    globalCache.clear();
    try {
      const url = `http://localhost/api/resources?id=${id}`;
      const body = await (await resourcesGET(new Request(url))).json();
      expect(body.results[0].location).toEqual({ lat, lng });
      expect(body.results[0].openNow).toBeNull();
      expect(body.results[0].status).toBeNull();
      expect(body.results[0].accessibility).toBeNull();
      expect(body.results[0].hours.note).toContain(phone);
      expect((await (await resourcesGET(new Request(`${url}&open=1`))).json()).results).toHaveLength(0);
      expect((await (await resourcesGET(new Request(`${url}&stepFree=1`))).json()).results).toHaveLength(0);
    } finally { globalCache.clear(); }
  });

  it('computes API today in Boston, preserves unknown ID/EBT status, and refreshes status', async () => {
    vi.useFakeTimers();
    globalCache.clear();
    try {
      vi.setSystemTime(new Date('2026-09-05T01:00:00Z'));
      let response = await resourcesGET(new Request(`http://localhost/api/resources?id=${hotline.id}`));
      let body = await response.json();
      expect(body.results[0].hours.today).toEqual(hotline.hours![4]);
      expect(body.results[0].requiresId).toBeNull();
      expect(body.results[0].acceptsEbt).toBeNull();
      expect(response.headers.get('cache-control')).toContain('s-maxage=60');

      globalCache.clear();
      vi.setSystemTime(new Date('2026-09-04T22:59:00Z')); // 6:59 PM Boston
      response = await resourcesGET(new Request(`http://localhost/api/resources?id=${hotline.id}`));
      body = await response.json();
      expect(body.results[0].openNow).toBe(true);
      vi.setSystemTime(new Date('2026-09-04T23:01:00Z')); // after 7 PM, > cache TTL
      response = await resourcesGET(new Request(`http://localhost/api/resources?id=${hotline.id}`));
      body = await response.json();
      expect(body.results[0].openNow).toBe(false);
    } finally {
      globalCache.clear();
      vi.useRealTimers();
    }
  });
});
