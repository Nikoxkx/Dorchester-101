import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  fetchAlerts,
  fetchArrivals,
  fetchRouteMeta,
  fetchShapes,
  fetchStopsForRoute,
  mbtaKeyStatus,
  transitReferenceMeta,
  dorchesterStopIds,
} from '@/lib/mbta';
import { DORCHESTER_BUS_ROUTES, TRANSIT_LINES } from '@/data/transit';
import { ApiError, formatErrorResponse } from '@/lib/errors';

export const dynamic = 'force-dynamic';

/**
 * Single transit endpoint for the whole app.
 *
 * Client code never talks to api-v3.mbta.com directly: keeping the request
 * server-side means one shared cache instead of one per browser, a place to put
 * an optional API key, and no CORS or key-leak questions.
 */

const typeSchema = z.enum(['arrivals', 'predictions', 'alerts', 'shapes', 'stops', 'routes', 'meta']);
const querySchema = z.object({
  type: typeSchema.default('arrivals'),
  /** comma separated stop ids; defaults to every Dorchester station we track */
  stops: z.string().optional(),
  route: z.string().optional(),
  perStop: z.coerce.number().int().min(1).max(12).default(5),
});

function parseIds(raw: string | undefined, fallback: string[]): string[] {
  if (!raw) return fallback;
  const ids = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return ids.length ? ids.slice(0, 24) : fallback;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = querySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    throw new ApiError('Invalid transit query', 400, 'BAD_REQUEST');
  }
  const { type, perStop } = parsed.data;

  try {
    switch (type) {
      case 'predictions':
      case 'arrivals': {
        const stopIds = parseIds(parsed.data.stops, dorchesterStopIds());
        const { arrivals, source, fetchedAt, degradedReason } = await fetchArrivals(stopIds, { limitPerStop: perStop });
        return NextResponse.json(
          {
            arrivals,
            // Kept for the map component written before this refactor.
            predictions: arrivals.map((a) => ({
              stopId: a.stopId,
              stopName: a.stopName,
              routeId: a.routeId,
              routeLabel: a.routeLabel,
              direction: a.headsign || a.direction,
              arrivalTime: a.arrivalAt,
              minutesAway: a.minutesAway,
              status: a.status,
              delayMinutes: a.delayMinutes,
            })),
            source,
            fetchedAt,
            degradedReason,
            refreshSeconds: 30,
          },
          { headers: { 'cache-control': 'public, s-maxage=25, stale-while-revalidate=120' } }
        );
      }

      case 'alerts': {
        const { alerts, source, fetchedAt } = await fetchAlerts();
        return NextResponse.json(
          { alerts, source, fetchedAt, serviceAlertsCount: alerts.length },
          { headers: { 'cache-control': 'public, s-maxage=60, stale-while-revalidate=300' } }
        );
      }

      case 'shapes': {
        const routeIds = parseIds(parsed.data.route, ['Red', 'Mattapan', 'CR-Fairmount']);
        const shapes = await fetchShapes(routeIds);
        return NextResponse.json(
          { shapes, reference: transitReferenceMeta, fetchedAt: new Date().toISOString() },
          { headers: { 'cache-control': 'public, s-maxage=600, stale-while-revalidate=3600' } }
        );
      }

      case 'stops': {
        const routeId = parsed.data.route ?? 'Red';
        const stops = await fetchStopsForRoute(routeId);
        return NextResponse.json(
          { routeId, stops, fetchedAt: new Date().toISOString(), source: stops.length ? 'mbta-live' : 'timetable' },
          { headers: { 'cache-control': 'public, s-maxage=3600, stale-while-revalidate=86400' } }
        );
      }

      case 'routes': {
        const ids = ['Red', 'Mattapan', 'CR-Fairmount', ...DORCHESTER_BUS_ROUTES.map((b) => b.id)];
        const live = await fetchRouteMeta(ids);
        return NextResponse.json(
          {
            routes: ids.map((id) => {
              const bundled = DORCHESTER_BUS_ROUTES.find((b) => b.id === id);
              const line = TRANSIT_LINES.find((l) => l.routeId === id);
              const meta = live[id];
              return {
                id,
                label: meta?.label ?? bundled?.name ?? line?.label ?? id,
                name: meta?.name ?? bundled?.longName ?? line?.name ?? id,
                color: meta?.color ?? bundled?.color ?? line?.color ?? '#14304F',
                textColor: meta?.textColor ?? bundled?.textColor ?? line?.textColor ?? '#000000',
                directions: meta?.directions ?? [],
                destinations: meta?.destinations ?? [],
                live: Boolean(meta),
              };
            }),
            referenceAsOf: transitReferenceMeta.asOf,
            fetchedAt: new Date().toISOString(),
          },
          { headers: { 'cache-control': 'public, s-maxage=86400, stale-while-revalidate=604800' } }
        );
      }

      case 'meta':
      default: {
        return NextResponse.json({
          ...transitReferenceMeta,
          apiKey: mbtaKeyStatus(),
          endpoint: 'https://api-v3.mbta.com',
          note: 'Reference data for the lines that serve Dorchester. Arrivals and alerts are fetched live; this block is static.',
          stops: dorchesterStopIds().length,
        });
      }
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;
    return NextResponse.json(formatErrorResponse(error), { status: 502 });
  }
}
