import { act, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TRANSIT_LINES, DORCHESTER_BUS_ROUTES } from '@/data/transit';
import { STATION_PHOTOS } from '@/data/stationPhotos';
import { LANGUAGES } from '@/i18n/config';
import { dictionaries } from '@/i18n';
import { makeTranslator } from '@/i18n/runtime';
import { formatNumber } from '@/i18n/formatters';
import { arrivalHeading, referenceBusName, referenceConnection, referenceLineName, stationCaption } from '@/i18n/transitReference';
import type { Arrival, LiveVehicle } from '@/lib/mbta';
import { search } from '@/lib/searchIndex';
import { useAppStore } from '@/stores/appStore';

const navigation = vi.hoisted(() => ({ params: new URLSearchParams(), router: { replace: vi.fn() } }));
vi.mock('next/navigation', () => ({ useSearchParams: () => navigation.params, useRouter: () => navigation.router }));
vi.mock('@/components/layout/MainLayout', () => ({ MainLayout: ({ children }: { children: React.ReactNode }) => <main>{children}</main> }));
vi.mock('@/components/layout/ProjectNote', () => ({ ProjectNote: () => null }));
vi.mock('@/components/map/DorchesterMapLoader', () => ({ DorchesterMapLoader: () => null }));
vi.mock('@/components/map/MapCanvas', () => ({ MapCanvas: () => <div data-testid="map-canvas" /> }));
vi.mock('@/components/projects/SiteImagery', () => ({ SiteImagery: () => null }));

import { MapPageView } from '@/app/map/MapPageView';
import { PlaceSheet } from '@/components/map/PlaceSheet';
import { VehicleSheet } from '@/components/map/VehicleSheet';
import { DorchesterMap } from '@/components/map/DorchesterMap';

beforeEach(() => useAppStore.getState().resetAll());
afterEach(() => vi.unstubAllGlobals());

const bus = (id: string) => DORCHESTER_BUS_ROUTES.find((route) => route.id === id)!;

describe('source-checked transit reference translations', () => {
  it('covers every bundled line, connection, bus name and station photo in all locales', () => {
    for (const { code } of LANGUAGES) {
      for (const line of TRANSIT_LINES) {
        const translated = referenceLineName(line, code);
        expect(translated.used, `${code} ${line.id}`).toBe(code);
        expect(translated.fellBack, `${code} ${line.id}`).toBe(false);
        for (const stop of line.dorchesterStops) {
          for (const connection of stop.connects ?? []) {
            const result = referenceConnection(connection, code);
            expect(result.used, `${code} ${connection}`).toBe(code);
            expect(result.fellBack, `${code} ${connection}`).toBe(false);
          }
        }
      }
      for (const route of DORCHESTER_BUS_ROUTES) {
        const result = referenceBusName(route, code);
        expect(result.used, `${code} bus ${route.id}`).toBe(code);
        expect(result.fellBack, `${code} bus ${route.id}`).toBe(false);
        expect(result.value.length).toBeGreaterThan(5);
      }
      for (const [id, photo] of Object.entries(STATION_PHOTOS)) {
        const result = stationCaption(id, photo.caption, code);
        expect(result.used, `${code} ${id}`).toBe(code);
        expect(result.fellBack, `${code} ${id}`).toBe(false);
      }
    }
  });

  it('matches Savin Hill and Shawmut photos to the correct MBTA stop IDs and licences', () => {
    expect(STATION_PHOTOS['place-shmnl'].src).toContain('savin-hill-platform');
    expect(STATION_PHOTOS['place-smmnl'].src).toContain('shawmut-headhouse');
    expect(STATION_PHOTOS['place-shmnl'].author).toBe('Pi.1415926535');
    expect(STATION_PHOTOS['place-smmnl'].license).toBe('3.0');
    expect(STATION_PHOTOS['place-DB-2249'].caption).toContain('Four Corners/Geneva');
    useAppStore.getState().setLanguage('es');
    render(<PlaceSheet target={{ kind: 'stop', id: 'place-smmnl' }} arrivals={[]} arrivalsLive={false} userPosition={null} onClose={() => {}} onSelectStop={() => {}} onLocate={() => {}} />);
    expect(screen.getByAltText(dictionaries.es['map.photo.shawmut'])).toBeTruthy();
    expect(screen.getByRole('link', { name: 'CC BY-SA 3.0' }).getAttribute('href')).toBe('https://creativecommons.org/licenses/by-sa/3.0/');
  });

  it('retains alternative destinations, vias and loops without inventing live route changes', () => {
    const alt = referenceBusName(bus('16'), 'es').value;
    const via = referenceBusName(bus('23'), 'es').value;
    const loop = referenceBusName(bus('26'), 'es').value;
    for (const name of ['Forest Hills', 'Andrew', 'Harbor Point']) expect(alt).toContain(name);
    expect(alt).toContain(' o ');
    for (const name of ['Ashmont', 'Ruggles', 'Washington Street']) expect(via).toContain(name);
    expect(via).toContain(' por ');
    expect(loop).toContain('Norfolk Street');
    expect(loop).toContain('circuito');
    expect(referenceBusName(bus('16'), 'en').value).toBe(bus('16').longName);
  });

  it('falls back to explicitly marked English for changed or unknown text', () => {
    const changedBus = { ...bus('23'), longName: 'Ashmont Station - Different Station via New Street' };
    expect(referenceBusName(changedBus, 'ar')).toEqual({ value: changedBus.longName, used: 'en', fellBack: true });
    const line = { ...TRANSIT_LINES[0], name: 'Red Line service changed' };
    expect(referenceLineName(line, 'es')).toEqual({ value: line.name, used: 'en', fellBack: true });
    expect(referenceConnection('Bus replacement shuttle', 'ht')).toEqual({ value: 'Bus replacement shuttle', used: 'en', fellBack: true });
    expect(stationCaption('place-fldcr', 'New caption with different facts', 'pt')).toEqual({ value: 'New caption with different facts', used: 'en', fellBack: true });
  });

  it('renders translated map route labels, tooltips and accessible names', () => {
    useAppStore.getState().setLanguage('es');
    render(<MapPageView />);
    const lineName = referenceLineName(TRANSIT_LINES[0], 'es').value;
    expect(screen.getByText(lineName).getAttribute('lang')).toBe('es');
    const name = referenceBusName(bus('16'), 'es').value;
    const label = `${dictionaries.es['map.line.bus']} 16: ${name}`;
    const route = screen.getByRole('link', { name: label });
    expect(route.getAttribute('title')).toBe(name);
    expect(route.getAttribute('href')).toBe('/map?route=16');
  });

  it('updates stop connections, photo captions and image alt text on language switch', () => {
    useAppStore.getState().setLanguage('es');
    render(<PlaceSheet target={{ kind: 'stop', id: 'place-fldcr' }} arrivals={[]} arrivalsLive={false} userPosition={null} onClose={() => {}} onSelectStop={() => {}} onLocate={() => {}} />);
    const photo = STATION_PHOTOS['place-fldcr'];
    const caption = stationCaption('place-fldcr', photo.caption, 'es').value;
    expect(screen.getByAltText(caption).getAttribute('lang')).toBe('es');
    expect(screen.getByText(caption).getAttribute('lang')).toBe('es');
    const connections = referenceConnection('Bus 15, 17, 18, 19, 201, 202, 210', 'es').value;
    expect(screen.getByText(connections).getAttribute('lang')).toBe('es');

    act(() => useAppStore.getState().setLanguage('ar'));
    const arabicCaption = stationCaption('place-fldcr', photo.caption, 'ar').value;
    expect(screen.getByAltText(arabicCaption).getAttribute('lang')).toBe('ar');
    expect(screen.getByText(arabicCaption).getAttribute('lang')).toBe('ar');
    const arabicConnections = referenceConnection('Bus 15, 17, 18, 19, 201, 202, 210', 'ar').value;
    expect(screen.getByText(arabicConnections).getAttribute('lang')).toBe('ar');
  });

  it('translates only exact direction words and preserves unknown provider instructions', () => {
    for (const { code } of LANGUAGES) {
      for (const [source, key] of [
        ['Inbound', 'map.heading.inbound'], ['Outbound', 'map.heading.outbound'],
        ['Northbound', 'map.heading.northbound'], ['Southbound', 'map.heading.southbound'],
        ['Eastbound', 'map.heading.eastbound'], ['Westbound', 'map.heading.westbound'],
      ] as const) {
        expect(arrivalHeading({ direction: source }, code)).toEqual({ value: dictionaries[code][key], used: code, fellBack: false });
      }
      expect(arrivalHeading({}, code)).toEqual({ value: dictionaries[code]['map.heading.missing'], used: code, fellBack: false });
    }
    const original = 'Outbound via Ashmont; use shuttle';
    expect(arrivalHeading({ headsign: original, direction: 'Inbound' }, 'es')).toEqual({ value: original, used: 'en', fellBack: true });
  });

  it('shows partial predictions and flags untranslated MBTA headsigns in the stop sheet', () => {
    const when = new Date(Date.now() + 300_000).toISOString();
    const base: Arrival = {
      stopId: 'place-fldcr', stopName: 'Fields Corner', routeId: 'Red', routeLabel: 'B', routeColor: 'DA291C',
      mode: 'subway', direction: 'Inbound', arrivalAt: when, departureAt: when, minutesAway: 5, status: 'on_time', delayMinutes: 0,
    };
    const source = 'Outbound via Ashmont; use shuttle';
    const next = { ...base, headsign: source, arrivalAt: new Date(Date.now() + 360_000).toISOString() };
    useAppStore.getState().setLanguage('es');
    render(<PlaceSheet target={{ kind: 'stop', id: 'place-fldcr' }} arrivals={[base, next]} arrivalsLive={false} arrivalsPartial userPosition={null} onClose={() => {}} onSelectStop={() => {}} onLocate={() => {}} />);
    expect(screen.getByText(dictionaries.es['map.heading.inbound']).getAttribute('lang')).toBe('es');
    expect(screen.getByText(source).getAttribute('lang')).toBe('en');
    expect(screen.getByText(dictionaries.es['map.heading.english'])).toBeTruthy();
    expect(screen.getByText(dictionaries.es['map.partialDetails'])).toBeTruthy();
    expect(screen.getAllByText(dictionaries.es['map.partial']).length).toBeGreaterThan(0);
    expect(screen.queryByText(dictionaries.es['map.scheduleData'])).toBeNull();
  });

  it('labels partial predictions on the interactive map without exposing raw error text', async () => {
    const when = new Date(Date.now() + 300_000).toISOString();
    const source = 'Outbound via Ashmont; use shuttle';
    const arrival: Arrival = {
      stopId: 'place-fldcr', stopName: 'Fields Corner', routeId: 'Red', routeLabel: 'B', routeColor: 'DA291C',
      mode: 'subway', direction: 'Outbound', headsign: source, arrivalAt: when, departureAt: when,
      minutesAway: 5, status: 'on_time', delayMinutes: 0,
    };
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      const data = url.includes('type=arrivals')
        ? { arrivals: [arrival], source: 'offline-cache', degradedReason: 'raw network failure' }
        : url.includes('type=alerts') ? { alerts: [], source: 'mbta-live', status: 'ok' }
          : url.includes('type=stops') ? { stops: [], source: 'timetable' }
            : url.includes('type=vehicles') ? { vehicles: [], source: 'timetable' } : { shapes: {} };
      return new Response(JSON.stringify(data), { status: 200 });
    }));
    useAppStore.getState().setLanguage('es');
    render(<DorchesterMap />);
    await waitFor(() => expect(screen.getAllByText(dictionaries.es['map.partialDetails']).length).toBeGreaterThan(0));
    expect(screen.getByText(source).getAttribute('lang')).toBe('en');
    expect(screen.getByText(dictionaries.es['map.heading.english'])).toBeTruthy();
    expect(screen.queryByText('raw network failure')).toBeNull();
    expect(screen.queryByText(dictionaries.es['map.scheduleData'])).toBeNull();
    const stops = screen.getByRole('region', { name: dictionaries.es['map.routeStops'] });
    expect(within(stops).getAllByRole('button', { name: 'JFK/UMass' })).toHaveLength(1);
  });

  it('does not label a partial live vehicle feed as a timetable', async () => {
    const now = Date.now();
    const when = new Date(now + 300_000).toISOString();
    const source = 'Outbound via Ashmont; use shuttle';
    const arrival: Arrival = {
      stopId: 'place-fldcr', stopName: 'Fields Corner', routeId: 'Red', routeLabel: 'B', routeColor: 'DA291C',
      mode: 'subway', direction: 'Outbound', headsign: source, arrivalAt: when, departureAt: when,
      minutesAway: 5, status: 'on_time', delayMinutes: 0,
    };
    const vehicle: LiveVehicle = {
      id: 'train-1', label: '1', routeId: 'Red', routeLabel: 'B', routeColor: '#DA291C', mode: 'subway', directionId: 0,
      lat: 42.3, lng: -71.06, bearing: null, speedMph: 12, stopId: 'place-fldcr', stopName: 'Fields Corner',
      stopStatus: 'at-stop', occupancy: null, updatedAt: new Date(now).toISOString(),
    };
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ arrivals: [arrival], source: 'offline-cache' }), { status: 200 })));
    useAppStore.getState().setLanguage('ar');
    render(<VehicleSheet vehicle={vehicle} stops={[]} now={now} onClose={() => {}} onSelectStop={() => {}} />);
    await waitFor(() => expect(screen.getByText(dictionaries.ar['map.partialDetails'])).toBeTruthy());
    expect(screen.getByText(source).getAttribute('lang')).toBe('en');
    expect(screen.getByText(dictionaries.ar['map.heading.english'])).toBeTruthy();
    expect(screen.getByText(makeTranslator(dictionaries.ar, 'ar')('weather.windMph', { speed: formatNumber(12, 'ar') }))).toBeTruthy();
    expect(screen.queryByText(dictionaries.ar['map.scheduleData'])).toBeNull();
  });

  it('localizes and searches map reference subtitles in the global index', () => {
    const stops = search('línea roja', { language: 'es', kinds: ['stop'], limit: 50 });
    expect(stops.length).toBeGreaterThan(0);
    expect(stops.some((hit) => hit.subtitle === dictionaries.es['map.ref.redAshmont'])).toBe(true);
    expect(stops.every((hit) => hit.subtitleLanguage === 'es')).toBe(true);
    const route = search('23', { language: 'es', kinds: ['route'], limit: 50 }).find((hit) => hit.id === 'route-23');
    expect(route?.subtitle).toBe(referenceBusName(bus('23'), 'es').value);
    expect(route?.subtitleLanguage).toBe('es');
    expect(route?.subtitleFellBack).toBe(false);
  });
});
