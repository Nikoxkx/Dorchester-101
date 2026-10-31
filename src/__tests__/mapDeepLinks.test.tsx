import { StrictMode } from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAppStore } from '@/stores/appStore';

const navigation = vi.hoisted(() => ({ params: new URLSearchParams(), router: { replace: vi.fn() } }));
vi.mock('next/navigation', () => ({ useSearchParams: () => navigation.params, useRouter: () => navigation.router }));
vi.mock('@/components/map/MapCanvas', () => ({ MapCanvas: () => <div data-testid="map-canvas" /> }));
vi.mock('@/components/projects/SiteImagery', () => ({ SiteImagery: () => null }));

import { DorchesterMap, mergeShapes } from '@/components/map/DorchesterMap';
import { RESOURCES, isResourceMappable } from '@/data/resources';
import { dictionaries } from '@/i18n';

beforeEach(() => {
  useAppStore.getState().resetAll();
  navigation.params = new URLSearchParams();
  navigation.router.replace.mockClear();
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ stops: [], arrivals: [], alerts: [], vehicles: [], shapes: {} }), { status: 200 })));
});
afterEach(() => vi.unstubAllGlobals());

function map() {
  return <StrictMode><DorchesterMap /></StrictMode>;
}

describe('map deep links', () => {
  it('keeps both Red Line fallback branches under a single route shape', () => {
    const shapes = mergeShapes([], ['Red']);
    expect(shapes).toHaveLength(1);
    expect(shapes[0].paths).toHaveLength(2);
    expect(shapes[0].source).toBe('timetable');
  });

  it('does not mark places with unknown hours as closed', async () => {
    const place = RESOURCES.find((record) => isResourceMappable(record) && !record.hours);
    expect(place).toBeDefined();
    render(<DorchesterMap />);
    const region = screen.getByRole('region', { name: dictionaries.en['map.placesOnMap'] });
    const button = within(region).getByText(place!.name).closest('button');
    expect(button).toBeTruthy();
    expect(button?.textContent).not.toContain(dictionaries.en['common.closed']);
    expect(button?.textContent).not.toContain(dictionaries.en['common.open']);
  });

  it('opens a place in Strict Mode and follows later same-page route and stop links', async () => {
    navigation.params = new URLSearchParams('place=fields-corner-main-street');
    const { rerender } = render(map());
    const sheet = await screen.findByRole('dialog', { name: 'Place details' });
    expect(within(sheet).getByRole('heading', { name: 'Fields Corner Main Street' })).toBeTruthy();
    const route = screen.getByRole('combobox', { name: 'Route' });
    expect(within(route).getAllByRole('option').filter((option) => (option as HTMLOptionElement).value === 'Red')).toHaveLength(1);

    navigation.params = new URLSearchParams('stop=place-DB-2249');
    rerender(map());
    // AnimatePresence may retain the old sheet while its exit animation runs.
    await waitFor(() => expect(screen.getAllByRole('dialog', { name: 'Place details' }).some(
      (dialog) => within(dialog).queryByRole('heading', { name: 'Four Corners/Geneva' }),
    )).toBe(true));
    expect((screen.getByRole('combobox', { name: 'Route' }) as HTMLSelectElement).value).toBe('CR-Fairmount');

    navigation.params = new URLSearchParams('route=16');
    rerender(map());
    await waitFor(() => expect((screen.getByRole('combobox', { name: 'Route' }) as HTMLSelectElement).value).toBe('16'));
    await waitFor(() => expect(document.querySelector('[data-sheet-open="true"]')).toBeNull());
  });

  it('shows live bus-stop details and directions instead of an empty sheet', async () => {
    navigation.params = new URLSearchParams('route=16&stop=1234');
    vi.stubGlobal('fetch', vi.fn(async (url: string) => new Response(JSON.stringify(
      url.includes('type=stops') && url.includes('route=16')
        ? { stops: [{ id: '1234', name: 'Example Street at Main Street', lat: 42.3, lng: -71.06, accessible: false }], source: 'mbta-live' }
        : { stops: [], arrivals: [], alerts: [], vehicles: [], shapes: {} },
    ), { status: 200 })));
    useAppStore.getState().setLanguage('es');
    render(map());
    const sheet = await screen.findByRole('dialog', { name: 'Detalles del lugar' });
    const heading = await within(sheet).findByRole('heading', { name: 'Example Street at Main Street' });
    expect(heading.getAttribute('lang')).toBe('en');
    expect(within(sheet).getByText('Algunos detalles a continuación solo están disponibles en inglés.')).toBeTruthy();
    const directions = new URL(within(sheet).getByRole('link', { name: 'Ruta a pie' }).getAttribute('href')!);
    expect(directions.searchParams.get('destination')).toBe('42.300000,-71.060000');
    expect(within(sheet).getByRole('link', { name: /mbta.com/i }).getAttribute('href')).toBe('https://www.mbta.com/stops/1234');
  });

  it('clears old predictions when a refresh fails rather than relabeling them live', async () => {
    let fail = false;
    const arrival = {
      stopId: 'place-fldcr', stopName: 'Fields Corner', routeId: 'Red', routeLabel: 'B', routeColor: 'DA291C',
      mode: 'subway', direction: 'Outbound', headsign: 'Unique live destination',
      arrivalAt: new Date(Date.now() + 300_000).toISOString(), departureAt: new Date(Date.now() + 300_000).toISOString(),
      minutesAway: 5, status: 'on_time', delayMinutes: 0,
    };
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      if (url.includes('type=arrivals')) {
        return fail
          ? new Response('', { status: 503 })
          : new Response(JSON.stringify({ arrivals: [arrival], source: 'mbta-live', fetchedAt: new Date().toISOString() }), { status: 200 });
      }
      return new Response(JSON.stringify({ stops: [], alerts: [], vehicles: [], shapes: {} }), { status: 200 });
    }));
    render(map());
    expect(await screen.findByText('Unique live destination')).toBeTruthy();
    fail = true;
    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));
    await waitFor(() => expect(screen.queryByText('Unique live destination')).toBeNull());
    expect(screen.getByText('No predictions are available right now. Check MBTA for current service.')).toBeTruthy();
  });

  it('offers a useful unavailable state for an unknown stop', async () => {
    navigation.params = new URLSearchParams('route=16&stop=not-a-stop');
    render(map());
    expect(await screen.findByText('Stop details are unavailable. Check the route and stop ID, or try again later.')).toBeTruthy();
    expect(screen.getByRole('dialog', { name: 'Place details' })).toBeTruthy();
  });

  it('does not open a contact-only address, and keeps selected place and stop URLs unambiguous', async () => {
    navigation.params = new URLSearchParams('place=fields-corner-main-street');
    const { rerender } = render(map());
    await screen.findByRole('dialog', { name: 'Place details' });
    const routeStops = screen.getByRole('region', { name: 'Stops on this route' });
    fireEvent.click(within(routeStops).getByRole('button', { name: 'Fields Corner' }));
    const href = navigation.router.replace.mock.calls.at(-1)?.[0] as string;
    const url = new URL(href, 'https://example.test');
    expect(url.searchParams.get('stop')).toBe('place-fldcr');
    expect(url.searchParams.has('place')).toBe(false);

    // This is a contact address, not a confirmed class destination.
    navigation.params = new URLSearchParams('place=st-mark-esol');
    rerender(map());
    await waitFor(() => expect(document.querySelector('[data-sheet-open="true"]')).toBeNull());
  });
});
