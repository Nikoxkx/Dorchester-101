/**
 * Live vehicle positions: the map's buses and trains must be the feed's
 * own GPS reports — filtered to the routes this site serves, inside the
 * Dorchester box, and never stale. The test encodes a real GTFS-RT
 * FeedMessage with the same protobuf bindings the client decodes with,
 * so what is asserted is the wire format, not a hand-shaped stub.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as GtfsRealtimeBindings from 'gtfs-realtime-bindings';
import { fetchVehicles } from '@/lib/mbta';
import { globalCache } from '@/lib/cache';

const RtMessage = GtfsRealtimeBindings.transit_realtime.FeedMessage;

function feedWith(entities: unknown[]): Uint8Array {
  return RtMessage.encode(
    RtMessage.fromObject({
      header: { gtfsRealtimeVersion: '2.0', incrementality: 0, timestamp: Math.floor(Date.now() / 1000) },
      entity: entities,
    } as never)
  ).finish() as Uint8Array;
}

function vehicleEntity(id: string, over: Record<string, unknown> = {}) {
  return {
    id,
    vehicle: {
      trip: { routeId: 'Red', directionId: 0 },
      vehicle: { id: `v-${id}`, label: `0${id}42` },
      position: { latitude: 42.309, longitude: -71.062, bearing: 180, speed: 8.9 },
      stopId: 'place-fldcr',
      currentStatus: 2,
      occupancyStatus: 1,
      timestamp: Math.floor(Date.now() / 1000),
      ...over,
    },
  };
}

afterEach(() => {
  vi.restoreAllMocks();
  globalCache.clear();
});

describe('fetchVehicles', () => {
  it('returns live, in-box, on-route vehicles with feed values intact', async () => {
    const bytes = feedWith([
      vehicleEntity('1'),
      // Wrong route for this request.
      vehicleEntity('2', { trip: { routeId: 'Green-B', directionId: 0 } }),
      // Outside the Dorchester box (north of the Mystic River).
      vehicleEntity('3', { position: { latitude: 42.41, longitude: -71.06, bearing: 90, speed: 4 } }),
      // Stale GPS report (10 minutes old) — a stale dot is worse than none.
      vehicleEntity('4', { timestamp: Math.floor(Date.now() / 1000) - 600 }),
    ]);
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(Buffer.from(bytes), { status: 200 }))
    );

    const { vehicles, source } = await fetchVehicles(['Red', 'Mattapan']);
    expect(source).toBe('mbta-live');
    expect(vehicles).toHaveLength(1);
    const [v] = vehicles;
    expect(v.routeId).toBe('Red');
    expect(v.mode).toBe('subway');
    expect(v.label).toBe('0142');
    expect(v.bearing).toBe(180);
    expect(v.speedMph).toBe(20); // 8.9 m/s ≈ 19.9 mph
    expect(v.stopStatus).toBe('in-transit');
    expect(v.occupancy).toBe('many-seats');
    expect(v.stopName).toBeTruthy();
  });

  it('a dead feed means timetable source and zero vehicles, never invented ones', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('nope', { status: 503 }))
    );
    const { vehicles, source } = await fetchVehicles(['Red']);
    expect(source).toBe('timetable');
    expect(vehicles).toEqual([]);
  });
});
