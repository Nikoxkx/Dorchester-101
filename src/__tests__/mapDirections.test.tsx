import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PlaceSheet } from '@/components/map/PlaceSheet';
import { dictionaries } from '@/i18n';
import { makeTranslator } from '@/i18n/runtime';
import { imperialDistance } from '@/lib/geo';
import { useAppStore } from '@/stores/appStore';

beforeEach(() => useAppStore.getState().resetAll());

function sheet(userPosition: [number, number] | null) {
  return <PlaceSheet target={{ kind: 'place', id: 'fields-corner-main-street' }} arrivals={[]} arrivalsLive={false}
    userPosition={userPosition} onClose={() => {}} onSelectStop={() => {}} onLocate={() => {}} />;
}

describe('map directions links', () => {
  it('works without a geolocation prompt or an asynchronous pop-up', () => {
    const locate = vi.fn();
    const original = navigator.geolocation;
    Object.defineProperty(navigator, 'geolocation', { configurable: true, value: { getCurrentPosition: locate } });
    try {
      render(sheet(null));
      for (const [label, mode] of [[dictionaries.en['map.routeTransit'], 'transit'], [dictionaries.en['map.routeWalking'], 'walking']] as const) {
        const link = screen.getByRole('link', { name: label });
        const url = new URL(link.getAttribute('href')!);
        expect(url.origin).toBe('https://www.google.com');
        expect(url.searchParams.get('destination')).toBe('42.301386,-71.059766');
        expect(url.searchParams.get('travelmode')).toBe(mode);
        expect(url.searchParams.has('origin')).toBe(false);
        expect(link.getAttribute('target')).toBe('_blank');
        expect(link.getAttribute('rel')).toContain('noopener');
      }
      expect(locate).not.toHaveBeenCalled();
    } finally {
      Object.defineProperty(navigator, 'geolocation', { configurable: true, value: original });
    }
  });

  it('includes a location only after the user has provided one', () => {
    render(sheet([42.30, -71.06]));
    const link = screen.getByRole('link', { name: dictionaries.en['map.routeWalking'] });
    expect(new URL(link.getAttribute('href')!).searchParams.get('origin')).toBe('42.300000,-71.060000');
    expect(screen.getByText(dictionaries.en['map.directionsNote'], { exact: false })).toBeTruthy();
  });

  it('retains localized link labels and the starting-point notice', () => {
    useAppStore.getState().setLanguage('ar');
    render(sheet(null));
    expect(screen.getByRole('link', { name: dictionaries.ar['map.routeTransit'] })).toBeTruthy();
    expect(screen.getByText(dictionaries.ar['map.directionsNote'], { exact: false })).toBeTruthy();
  });

  it('translates distance units instead of inserting English abbreviations', () => {
    expect(imperialDistance(30)).toEqual({ value: 100, unit: 'feet' });
    expect(imperialDistance(1609.344)).toEqual({ value: 1, unit: 'miles' });
    const es = makeTranslator(dictionaries.es, 'es');
    const ar = makeTranslator(dictionaries.ar, 'ar');
    const ht = makeTranslator(dictionaries.ht, 'ht');
    const kea = makeTranslator(dictionaries.kea, 'kea');
    expect(es('map.distanceFeet', { count: 100 })).toBe('100 pies');
    expect(es('map.distanceMiles', { count: 1 })).toBe('1 milla');
    expect(ar('map.distanceFeet', { count: 100 })).toMatch(/قدم/);
    expect(ht('map.distanceMiles', { count: 1 })).toMatch(/mil/);
    expect(kea('map.distanceMiles', { count: 1 })).toMatch(/milha/);
  });
});
