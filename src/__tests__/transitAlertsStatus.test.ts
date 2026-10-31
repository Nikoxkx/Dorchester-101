import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as GtfsRealtimeBindings from '@golemio/ovapi-gtfs-realtime-bindings';
import { fetchAlerts } from '@/lib/mbta';
import { globalCache } from '@/lib/cache';

beforeEach(() => globalCache.clear());
afterEach(() => { globalCache.clear(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('MBTA alert feed status', () => {
  it('distinguishes a successful empty GTFS feed from an outage', async () => {
    vi.stubEnv('MBTA_API_KEY', '');
    const message = GtfsRealtimeBindings.transit_realtime.FeedMessage.create({ header: { gtfsRealtimeVersion: '2.0' }, entity: [] });
    const bytes = GtfsRealtimeBindings.transit_realtime.FeedMessage.encode(message).finish();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, arrayBuffer: async () => bytes }));
    const quiet = await fetchAlerts();
    expect(quiet).toMatchObject({ status: 'ok', source: 'mbta-live', alerts: [] });
    globalCache.clear();
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    const offline = await fetchAlerts();
    expect(offline).toMatchObject({ status: 'unavailable', source: 'timetable', alerts: [] });
  });

  it('uses publisher-provided language variants per field without mixing cached languages', async () => {
    vi.stubEnv('MBTA_API_KEY', '');
    const message = GtfsRealtimeBindings.transit_realtime.FeedMessage.fromObject({
      header: { gtfsRealtimeVersion: '2.0' },
      entity: [{ id: 'a1', alert: {
        informedEntity: [{ routeId: 'Red' }],
        headerText: { translation: [
          { text: 'Red Line delay', language: 'en' },
          { text: 'Retraso en la Línea Roja', language: 'es-MX' },
        ] },
        descriptionText: { translation: [{ text: 'Allow extra time', language: 'en' }] },
      } }, { id: 'a2', alert: {
        informedEntity: [{ routeId: 'Red' }],
        headerText: { translation: [{ text: 'Unknown language', language: '' }] },
      } }],
    });
    const bytes = GtfsRealtimeBindings.transit_realtime.FeedMessage.encode(message).finish();
    const fetcher = vi.fn().mockResolvedValue({ ok: true, arrayBuffer: async () => bytes });
    vi.stubGlobal('fetch', fetcher);
    const spanish = await fetchAlerts('es');
    const english = await fetchAlerts('en');
    expect(spanish.alerts.find((a) => a.id === 'a1')).toMatchObject({
      header: 'Retraso en la Línea Roja', headerLanguage: 'es-MX',
      description: 'Allow extra time', descriptionLanguage: 'en',
    });
    expect(spanish.alerts.find((a) => a.id === 'a2')).toMatchObject({ header: 'Unknown language', headerLanguage: 'und' });
    expect(english.alerts.find((a) => a.id === 'a1')).toMatchObject({ header: 'Red Line delay', headerLanguage: 'en' });
    expect(fetcher).toHaveBeenCalledTimes(1); // GTFS wire feed itself is shared
  });

  it('marks a partially failed V3 route check rather than claiming all routes were checked', async () => {
    vi.stubEnv('MBTA_API_KEY', 'test-key');
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ data: [] }) })
      .mockResolvedValue({ ok: false, status: 503 }));
    const result = await fetchAlerts();
    expect(result.status).toBe('partial');
    expect(result.source).toBe('mbta-live');
    expect(result.attemptedRoutes).toBeGreaterThan(1);
  });
});
