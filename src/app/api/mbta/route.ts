export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { BUS_ROUTES, FAIRMOUNT_LINE, RED_LINE } from '@/data/map';
import { globalCache, CACHE_TTL } from '@/lib/cache';

const MBTA = 'https://api-v3.mbta.com';

const STOP_IDS = [
  ...RED_LINE.stops.map((s) => s.id),
  ...FAIRMOUNT_LINE.stops.map((s) => s.id),
];

const ROUTE_FILTER = 'Red,Mattapan,CR-Fairmount,16,17,18,23,26,28';

interface MbtaPrediction {
  stopId: string;
  stopName: string;
  routeId: string;
  direction: string;
  arrivalTime: string;
  departureTime: string;
  minutesAway: number;
  status: 'on_time' | 'delayed' | 'arriving';
}

interface MbtaAlert {
  id: string;
  effect: string;
  header: string;
  description: string;
  severity: number;
  createdAt: string;
  updatedAt: string;
  affectedRoutes: string[];
}

function stopName(id: string): string {
  const red = RED_LINE.stops.find((s) => s.id === id);
  if (red) return red.name;
  const fair = FAIRMOUNT_LINE.stops.find((s) => s.id === id);
  return fair?.name || id;
}

async function fetchJson(path: string): Promise<unknown> {
  const res = await fetch(`${MBTA}${path}`, {
    headers: { Accept: 'application/vnd.api+json' },
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`MBTA ${res.status}`);
  return res.json();
}

function minutesFromNow(iso: string | null): number {
  if (!iso) return 0;
  return Math.max(0, Math.round((new Date(iso).getTime() - Date.now()) / 60000));
}

async function livePredictions(): Promise<{ predictions: MbtaPrediction[]; live: boolean }> {
  const cached = globalCache.get<{ predictions: MbtaPrediction[]; live: boolean }>('mbta:predictions');
  if (cached) return cached;

  try {
    const filterStops = STOP_IDS.join(',');
    const data = (await fetchJson(
      `/predictions?filter[stop]=${filterStops}&include=stop,route,trip&page[limit]=80`,
    )) as {
      data?: Array<{
        id: string;
        attributes: {
          arrival_time: string | null;
          departure_time: string | null;
          status: string | null;
          direction_id: number;
        };
        relationships?: {
          stop?: { data?: { id: string } };
          route?: { data?: { id: string } };
          trip?: { data?: { id: string } };
        };
      }>;
      included?: Array<{ id: string; type: string; attributes: Record<string, unknown> }>;
    };

    const headsigns = new Map<string, string>();
    for (const inc of data.included || []) {
      if (inc.type === 'trip' && typeof inc.attributes.headsign === 'string') {
        headsigns.set(inc.id, inc.attributes.headsign);
      }
    }

    const predictions: MbtaPrediction[] = (data.data || [])
      .map((item) => {
        const stopId = item.relationships?.stop?.data?.id || '';
        const routeId = item.relationships?.route?.data?.id || '';
        const tripId = item.relationships?.trip?.data?.id || '';
        const when = item.attributes.arrival_time || item.attributes.departure_time;
        const minutesAway = minutesFromNow(when);
        const delayed = (item.attributes.status || '').toLowerCase().includes('delay');
        const status: MbtaPrediction['status'] =
          minutesAway <= 1 ? 'arriving' : delayed ? 'delayed' : 'on_time';
        return {
          stopId,
          stopName: stopName(stopId),
          routeId,
          direction: headsigns.get(tripId) || (item.attributes.direction_id === 0 ? 'Outbound' : 'Inbound'),
          arrivalTime: item.attributes.arrival_time || when || new Date().toISOString(),
          departureTime: item.attributes.departure_time || when || new Date().toISOString(),
          minutesAway,
          status,
        };
      })
      .filter((p) => p.minutesAway < 90)
      .sort((a, b) => a.minutesAway - b.minutesAway);

    const payload = { predictions, live: true };
    globalCache.set('mbta:predictions', payload, CACHE_TTL.MBTA);
    return payload;
  } catch {
    return { predictions: [], live: false };
  }
}

async function liveAlerts(): Promise<{ alerts: MbtaAlert[]; live: boolean }> {
  const cached = globalCache.get<{ alerts: MbtaAlert[]; live: boolean }>('mbta:alerts');
  if (cached) return cached;

  try {
    const data = (await fetchJson(
      `/alerts?filter[route]=${ROUTE_FILTER}&filter[activity]=BOARD,EXIT,RIDE&page[limit]=20`,
    )) as {
      data?: Array<{
        id: string;
        attributes: {
          effect: string;
          header: string;
          description: string | null;
          severity: number;
          created_at: string;
          updated_at: string;
        };
        relationships?: { informed_entity?: { data?: Array<{ id?: string }> } };
      }>;
    };

    const alerts: MbtaAlert[] = (data.data || []).map((item) => ({
      id: item.id,
      effect: item.attributes.effect,
      header: item.attributes.header,
      description: item.attributes.description || item.attributes.header,
      severity: item.attributes.severity,
      createdAt: item.attributes.created_at,
      updatedAt: item.attributes.updated_at,
      affectedRoutes: ROUTE_FILTER.split(','),
    }));

    const payload = { alerts, live: true };
    globalCache.set('mbta:alerts', payload, CACHE_TTL.MBTA);
    return payload;
  } catch {
    return { alerts: [], live: false };
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'all';
  const stopId = searchParams.get('stop');
  const routeId = searchParams.get('route');
  const now = new Date().toISOString();

  try {
    if (type === 'routes') {
      return NextResponse.json({
        redLine: { color: RED_LINE.color, stops: RED_LINE.stops, path: RED_LINE.stops.map((s) => [s.lat, s.lng]) },
        fairmount: { color: FAIRMOUNT_LINE.color, stops: FAIRMOUNT_LINE.stops, path: FAIRMOUNT_LINE.stops.map((s) => [s.lat, s.lng]) },
        busRoutes: BUS_ROUTES,
        timestamp: now,
      });
    }

    if (type === 'stops') {
      return NextResponse.json({
        redLine: RED_LINE.stops,
        fairmount: FAIRMOUNT_LINE.stops,
        timestamp: now,
      });
    }

    if (type === 'alerts') {
      const { alerts, live } = await liveAlerts();
      return NextResponse.json({ alerts, timestamp: now, source: live ? 'MBTA API v3' : 'unavailable', live });
    }

    const { predictions, live } = await livePredictions();
    let filtered = predictions;
    if (stopId) filtered = filtered.filter((p) => p.stopId === stopId);
    if (routeId) filtered = filtered.filter((p) => p.routeId === routeId);

    if (type === 'predictions') {
      return NextResponse.json({
        predictions: filtered,
        timestamp: now,
        source: live ? 'MBTA API v3' : 'MBTA unavailable',
        live,
        sourceUrl: 'https://api-v3.mbta.com',
      });
    }

    const { alerts } = await liveAlerts();
    return NextResponse.json({
      predictions: filtered,
      alerts,
      stops: { redLine: RED_LINE.stops, fairmount: FAIRMOUNT_LINE.stops },
      routes: BUS_ROUTES,
      timestamp: now,
      live,
      refreshInterval: 30000,
      source: live ? 'MBTA API v3' : 'MBTA unavailable',
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch MBTA data' }, { status: 500 });
  }
}
