/**
 * MBTA v3 API client.
 *
 * The authority's JSON:API is public. A key is optional: without one the
 * shared anonymous pool is rate limited hard, so requests are cached and every
 * call carries a timeout. When the feed cannot be read we return `source:
 * 'timetable'` derived from the published headways instead of inventing arrival
 * minutes, and the caller labels it as an estimate.
 */

import { globalCache, CACHE_TTL } from './cache';
import { TRANSIT_LINES, DORCHESTER_BUS_ROUTES, TRANSIT_DATA_AS_OF, type TransitLine } from '@/data/transit';
import { BOSTON_TZ } from '@/lib/hours';
import * as GtfsRealtimeBindings from 'gtfs-realtime-bindings';

const BASE = 'https://api-v3.mbta.com';
/**
 * Public GTFS-realtime feeds served from the MBTA CDN. Unlike the v3 JSON API
 * (20 requests/minute without a key), these feeds are published for anyone to
 * consume and are the same data the authority's own apps use, so the app can be
 * live without registering a key.
 */
const RT_BASE = 'https://cdn.mbta.com/realtime';
const RtMessage = GtfsRealtimeBindings.transit_realtime.FeedMessage;
const RtScheduleRelationship = GtfsRealtimeBindings.transit_realtime.TripUpdate.StopTimeUpdate.ScheduleRelationship;
const RtSeverityLevel = GtfsRealtimeBindings.transit_realtime.Alert.SeverityLevel;
const RtEffect = GtfsRealtimeBindings.transit_realtime.Alert.Effect;
const REQUEST_TIMEOUT_MS = 6_000;

export type DataSource = 'mbta-live' | 'timetable' | 'offline-cache';

export interface Arrival {
  stopId: string;
  stopName: string;
  routeId: string;
  routeLabel: string;
  routeColor: string;
  mode: 'subway' | 'trolley' | 'rail' | 'bus';
  direction: string;
  headsign?: string;
  /** ISO time the vehicle is expected to arrive. */
  arrivalAt: string;
  departureAt: string;
  minutesAway: number;
  status: 'on_time' | 'delayed' | 'arriving' | 'canceled' | 'detected' | 'scheduled';
  track?: string | null;
  vehicleId?: string;
  delayMinutes: number;
}

export interface ServiceAlert {
  id: string;
  header: string;
  description: string;
  effect: string;
  severity: 'info' | 'minor' | 'major';
  routeIds: string[];
  validFrom: string | null;
  validUntil: string | null;
  lastModified: string | null;
  url?: string | null;
}

export interface ShapeGeometry {
  routeId: string;
  /** GeoJSON LineStrings already in [lat, lng] order for Leaflet. */
  paths: Array<Array<[number, number]>>;
  source: DataSource;
}

interface JsonApiResource<T = Record<string, unknown>> {
  id: string;
  type: string;
  attributes: T;
  relationships?: Record<string, { data?: { id: string; type: string } | Array<{ id: string; type: string }> | null }> & {
    vehicle?: { data?: { id: string; type: string } | null };
  };
}

interface JsonApiDoc<T = Record<string, unknown>> {
  data: Array<JsonApiResource<T>> | JsonApiResource<T> | null;
  included?: Array<JsonApiResource>;
  errors?: Array<{ detail?: string; title?: string }>;
}

function apiKey(): string | undefined {
  const key = process.env.MBTA_API_KEY;
  return key && key.trim().length > 0 ? key.trim() : undefined;
}

/** True when a real key is configured. Surfaced by /api/health. */
export function hasMbtaKey(): boolean {
  return Boolean(apiKey());
}

export function mbtaKeyStatus(): 'configured' | 'anonymous' {
  return hasMbtaKey() ? 'configured' : 'anonymous';
}

async function request<T>(path: string, params: Record<string, string | number | undefined> = {}): Promise<JsonApiDoc<T>> {
  const url = new URL(BASE + path);
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '') continue;
    url.searchParams.set(key, String(value));
  }
  const cacheKey = `mbta:${url.pathname}${url.search}`;
  const cached = globalCache.get<JsonApiDoc<T>>(cacheKey);
  if (cached) return cached;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const headers: Record<string, string> = {
    accept: 'application/json',
    'user-agent': 'DOR101 community app (open-source; contact via github.com/Nikoxkx/Dorchester-101)',
  };
  const key = apiKey();
  if (key) headers['x-api-key'] = key;

  try {
    const res = await fetch(url, { headers, signal: controller.signal, cache: 'no-store' });
    if (!res.ok) throw new Error(`MBTA responded ${res.status}`);
    const json = (await res.json()) as JsonApiDoc<T>;
    if (json.errors?.length) throw new Error(json.errors[0].detail ?? 'MBTA returned an error');
    // Cache slightly longer than the client poll so a burst of tabs cannot
    // trip the anonymous rate limit.
    globalCache.set(cacheKey, json, Math.max(CACHE_TTL.MBTA, 20_000));
    return json;
  } finally {
    clearTimeout(timer);
  }
}

function list<T>(doc: JsonApiDoc<T> | null | undefined): Array<JsonApiResource<T>> {
  if (!doc?.data) return [];
  return Array.isArray(doc.data) ? doc.data : [doc.data];
}

function includedIndex(doc: JsonApiDoc | null | undefined): Map<string, JsonApiResource> {
  const map = new Map<string, JsonApiResource>();
  for (const item of doc?.included ?? []) map.set(`${item.type}:${item.id}`, item);
  return map;
}

interface PredictionAttrs {
  arrival_time?: string;
  departure_time?: string;
  schedule_relationship?: string;
  status?: string;
  track?: string | null;
  stop_sequence?: number;
  direction_id?: number;
  last_updated?: string;
}

interface RouteAttrs {
  short_name?: string;
  long_name?: string;
  color?: string;
  text_color?: string;
  type?: number;
  description?: string;
  direction_names?: string[];
  direction_destinations?: string[];
}

interface StopAttrs {
  name?: string;
  latitude?: number;
  longitude?: number;
  wheelchair_boarding?: number;
}

const MODE_BY_TYPE: Record<number, Arrival['mode']> = {
  0: 'rail',
  1: 'subway',
  2: 'trolley',
  3: 'bus',
  4: 'bus',
  100: 'rail',
  101: 'rail',
};

const DORCHESTER_STOP_IDS = new Set(
  TRANSIT_LINES.flatMap((l) => l.dorchesterStops.map((s) => s.id))
);

export function dorchesterStopIds(): string[] {
  return [...DORCHESTER_STOP_IDS];
}

function minutesUntil(iso: string, now: number): number {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return Infinity;
  return Math.max(0, Math.round((t - now) / 60_000));
}

/**
 * Live arrivals for a set of stops. The API filters on one stop per request far
 * more reliably than a comma list for `filter[stop]`, so we fan out with a
 * small concurrency cap and merge.
 */
/**
 * Decodes one of the MBTA's public GTFS-realtime feeds.
 *
 * The CDN feeds are large (a few MB), so the decoded message is cached for the
 * length of one client poll plus a margin. `globalCache` is an in-memory cache;
 * on Vercel each instance keeps its own copy, which is exactly what we want.
 */
async function fetchRtFeed(name: 'TripUpdates' | 'VehiclePositions' | 'Alerts'): Promise<InstanceType<typeof RtMessage>> {
  const cacheKey = `mbta:rt:${name}`;
  const cached = globalCache.get<InstanceType<typeof RtMessage>>(cacheKey);
  if (cached) return cached;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${RT_BASE}/${name}.pb`, {
      signal: controller.signal,
      cache: 'no-store',
      headers: { accept: 'application/x-protobuf, application/octet-stream' },
    });
    if (!res.ok) throw new Error(`GTFS-RT ${name} responded ${res.status}`);
    const bytes = new Uint8Array(await res.arrayBuffer());
    const message = RtMessage.decode(bytes);
    globalCache.set(cacheKey, message, 25_000);
    return message;
  } finally {
    clearTimeout(timer);
  }
}

/** Station names the app already ships, indexed by GTFS stop id. */
const STOP_NAME_BY_ID: Map<string, string> = new Map(
  TRANSIT_LINES.flatMap((line) => line.dorchesterStops.map((stop) => [stop.id, stop.name] as const))
);

/** First English (or any) translation of a GTFS-RT translated string. */
function translated(
  raw: { translation?: Array<{ text?: string | null; language?: string | null }> | null } | null | undefined,
  fallback = ''
): string {
  const entries = raw?.translation ?? [];
  const en = entries.find((t) => (t.language ?? '').toLowerCase().startsWith('en'));
  return (en?.text ?? entries[0]?.text ?? fallback).trim();
}

function epochSeconds(value: unknown): number | null {
  if (value == null) return null;
  const n = typeof value === 'bigint' ? Number(value) : Number(value as number);
  return Number.isFinite(n) ? n : null;
}

/**
 * Live arrivals from `TripUpdates.pb`.
 *
 * Stop time updates carry the authority's current estimate (updated in real time
 * as a vehicle moves), the trip's route and direction, and the schedule
 * relationship, so "live" here means exactly that: the feed's own timestamp and
 * the fact that the time was refreshed by the feed, not by us.
 */
async function fetchArrivalsFromRt(stopIds: string[], limitPerStop: number): Promise<{ arrivals: Arrival[]; fetchedAt: string }> {
  const feed = await fetchRtFeed('TripUpdates');
  const now = Date.now();
  const wanted = new Set(stopIds);
  const seen = new Set<string>();
  const arrivals: Arrival[] = [];

  for (const entity of feed.entity ?? []) {
    const update = entity.tripUpdate;
    if (!update?.trip?.routeId || !update.stopTimeUpdate?.length) continue;
    const trip = update.trip;
    const routeId = trip.routeId;
    if (!routeId) continue;
    const lineByRoute = TRANSIT_LINES.find((l) => l.routeId === routeId);
    const routeColor = lineByRoute?.color ?? (routeId === 'Red' ? '#DA291C' : '#14304F');
    const mode = modeForRoute(routeId, undefined);
    const directionId = trip.directionId ?? 0;

    for (const st of update.stopTimeUpdate) {
      const stopId = st.stopId;
      if (typeof stopId !== 'string' || !wanted.has(stopId)) continue;
      const arrivalTime = epochSeconds(st.arrival?.time);
      const departureTime = epochSeconds(st.departure?.time);
      const atSeconds = arrivalTime ?? departureTime;
      if (atSeconds == null) continue;
      const arrivalAt = new Date(atSeconds * 1000);
      if (arrivalAt.getTime() < now - 2 * 60_000) continue; // stale/just passed
      const minutes = Math.max(0, Math.round((arrivalAt.getTime() - now) / 60_000));
      if (minutes > 90) continue;
      const rel = st.scheduleRelationship;
      const key = `${stopId}:${routeId}:${arrivalAt.toISOString()}`;
      if (seen.has(key)) continue;
      seen.add(key);

      arrivals.push({
        stopId,
        stopName: STOP_NAME_BY_ID.get(stopId) ?? `Stop ${stopId}`,
        routeId,
        routeLabel: lineByRoute?.label ?? routeId,
        routeColor,
        mode,
        direction: directionId === 0 ? 'Inbound' : 'Outbound',
        // The feed names the destination on some stop time updates; when it does
        // not, the UI falls back to route/direction text rather than a guess.
        headsign: (st.stopTimeProperties?.stopHeadsign ?? '').trim() || undefined,
        arrivalAt: arrivalAt.toISOString(),
        departureAt: departureTime ? new Date(departureTime * 1000).toISOString() : arrivalAt.toISOString(),
        minutesAway: minutes,
        status: rel === RtScheduleRelationship.SKIPPED ? 'canceled' : minutes <= 1 ? 'arriving' : 'on_time',
        delayMinutes: 0,
      });
    }
  }

  // Keep the same shape the v3 path returns: newest first, capped per stop.
  const perStop = new Map<string, Arrival[]>();
  for (const arrival of arrivals.sort((a, b) => a.minutesAway - b.minutesAway)) {
    const bucket = perStop.get(arrival.stopId) ?? [];
    if (bucket.length < limitPerStop) {
      bucket.push(arrival);
      perStop.set(arrival.stopId, bucket);
    }
  }
  return {
    arrivals: [...perStop.values()].flat().sort((a, b) => a.minutesAway - b.minutesAway),
    fetchedAt: new Date(now).toISOString(),
  };
}

export async function fetchArrivals(stopIds: string[], opts: { limitPerStop?: number } = {}): Promise<{ arrivals: Arrival[]; source: DataSource; fetchedAt: string; degradedReason?: string }> {
  const limit = opts.limitPerStop ?? 6;

  // With a registered key the v3 API is cheap and carries headsigns and delays;
  // without one the public GTFS-RT feed is the honest live source.
  if (!apiKey()) {
    try {
      const { arrivals, fetchedAt } = await fetchArrivalsFromRt(stopIds, limit);
      if (arrivals.length > 0) {
        return { arrivals, source: 'mbta-live', fetchedAt };
      }
      return {
        arrivals: estimateArrivals(stopIds, limit),
        source: 'timetable',
        fetchedAt,
        degradedReason: 'No real-time predictions in the feed for these stops',
      };
    } catch (error) {
      return {
        arrivals: estimateArrivals(stopIds, limit),
        source: 'timetable',
        fetchedAt: new Date().toISOString(),
        degradedReason: error instanceof Error ? error.message.slice(0, 120) : 'GTFS-RT feed unreachable',
      };
    }
  }

  return fetchArrivalsV3(stopIds, { limitPerStop: limit });
}

async function fetchArrivalsV3(stopIds: string[], opts: { limitPerStop?: number } = {}): Promise<{ arrivals: Arrival[]; source: DataSource; fetchedAt: string; degradedReason?: string }> {
  const limit = opts.limitPerStop ?? 6;
  const now = Date.now();
  const results: Arrival[] = [];
  let failures = 0;
  let firstError = '';

  const queue = [...stopIds];
  const workers = Array.from({ length: Math.min(4, queue.length || 1) }, async () => {
    for (let stopId = queue.shift(); stopId; stopId = queue.shift()) {
      try {
        const doc = await request<PredictionAttrs>('/predictions', {
          'filter[stop]': stopId,
          'sort': 'arrival_time',
          'page[limit]': limit * 2,
          include: 'route,stop',
        });
        const inc = includedIndex(doc as unknown as JsonApiDoc);
        for (const p of list(doc)) {
          const route = inc.get(`route:${p.relationships?.route?.data && 'id' in p.relationships.route.data ? (p.relationships.route.data as { id: string }).id : ''}`);
          const stop = inc.get(`stop:${p.relationships?.stop?.data && 'id' in p.relationships.stop.data ? (p.relationships.stop.data as { id: string }).id : ''}`);
          const routeAttrs = (route?.attributes ?? {}) as RouteAttrs;
          const arrivalIso = p.attributes.arrival_time ?? p.attributes.departure_time;
          if (!arrivalIso) continue;
          const minutes = minutesUntil(arrivalIso, now);
          if (minutes > 90) continue;
          const rel = p.attributes.schedule_relationship ?? 'SCHEDULED';
          const routeId = route?.id ?? '';
          const lineByRoute = TRANSIT_LINES.find((l) => l.routeId === routeId);
          const mode = modeForRoute(routeId, routeAttrs.type);
          results.push({
            stopId: stop?.id ?? stopId,
            stopName: (stop?.attributes as StopAttrs | undefined)?.name ?? lineByRoute?.dorchesterStops.find((s) => s.id === stopId)?.name ?? stopId,
            routeId,
            routeLabel: routeAttrs.short_name || routeId,
            routeColor: routeAttrs.color ? `#${routeAttrs.color}` : lineByRoute?.color ?? '#14304F',
            mode,
            direction: routeAttrs.direction_names?.[p.attributes.direction_id ?? 0] ?? '',
            headsign: routeAttrs.direction_destinations?.[p.attributes.direction_id ?? 0],
            arrivalAt: arrivalIso,
            departureAt: p.attributes.departure_time ?? arrivalIso,
            minutesAway: minutes,
            status: statusFromPrediction(rel, p.attributes.status, minutes),
            track: p.attributes.track ?? null,
            vehicleId: p.relationships?.vehicle?.data && 'id' in (p.relationships.vehicle.data as object)
              ? (p.relationships.vehicle.data as { id: string }).id
              : undefined,
            delayMinutes: delayFrom(rel, p.attributes.last_updated, arrivalIso),
          });
        }
      } catch (error) {
        failures++;
        firstError = error instanceof Error ? error.message : String(error);
      }
    }
  });

  await Promise.all(workers);

  if (results.length === 0) {
    return {
      arrivals: estimateArrivals(stopIds, limit),
      source: 'timetable',
      fetchedAt: new Date(now).toISOString(),
      degradedReason: firstError || 'No predictions in the current window',
    };
  }

  results.sort((a, b) => a.minutesAway - b.minutesAway);
  const perStop = new Map<string, Arrival[]>();
  for (const a of results) {
    const bucket = perStop.get(a.stopId) ?? [];
    if (bucket.length < limit) {
      bucket.push(a);
      perStop.set(a.stopId, bucket);
    }
  }
  const merged = [...perStop.values()].flat().sort((a, b) => a.minutesAway - b.minutesAway);

  return {
    arrivals: merged,
    source: failures > 0 ? 'offline-cache' : 'mbta-live',
    fetchedAt: new Date(now).toISOString(),
    degradedReason: failures > 0 ? `${failures} stop request(s) failed` : undefined,
  };
}

function modeForRoute(routeId: string, type: number | undefined): Arrival['mode'] {
  if (type !== undefined && MODE_BY_TYPE[type]) return MODE_BY_TYPE[type];
  if (routeId === 'Red') return 'subway';
  if (routeId === 'Mattapan') return 'trolley';
  if (routeId.startsWith('CR-')) return 'rail';
  return 'bus';
}

function statusFromPrediction(rel: string, status: string | undefined, minutes: number): Arrival['status'] {
  if (rel === 'CANCELED' || rel === 'SKIPPED') return 'canceled';
  if (rel === 'ADDED' || rel === 'DETECTED') return 'detected';
  if (status && /delay/i.test(status)) return 'delayed';
  if (minutes <= 1) return 'arriving';
  return 'on_time';
}

function delayFrom(rel: string, lastUpdated: string | undefined, arrivalIso: string): number {
  if (rel !== 'MODIFIED' || !lastUpdated) return 0;
  const then = new Date(lastUpdated).getTime();
  const now2 = Date.parse(arrivalIso);
  if (Number.isNaN(then) || Number.isNaN(now2)) return 0;
  return Math.max(0, Math.round((now2 - then) / 60_000));
}

/**
 * Fallback departures. Deterministic arithmetic on the published headway, not a
 * random number, so two reloads agree and the wording can honestly say
 * "estimated from the timetable".
 */
export function estimateArrivals(stopIds: string[], perStop = 4): Arrival[] {
  const now = new Date();
  const minutesNow = bostonMinuteOfDay(now);
  const out: Arrival[] = [];
  for (const stopId of stopIds) {
    const line = TRANSIT_LINES.find((l) => l.dorchesterStops.some((s) => s.id === stopId));
    if (!line) continue;
    const stop = line.dorchesterStops.find((s) => s.id === stopId)!;
    const [fh, fm] = line.firstDeparts.split(':').map(Number);
    const [lh, lm] = line.lastDeparts.split(':').map(Number);
    const firstAt = fh * 60 + fm;
    const lastAt = lh * 60 + lm;
    const northEnd = line.dorchesterStops[0]?.name ?? line.name;
    const southEnd = line.dorchesterStops[line.dorchesterStops.length - 1]?.name ?? line.name;

    for (const dir of [0, 1]) {
      const headway = dir === 0 ? line.headwayMinutes : Math.round(line.headwayMinutes * 1.15);
      const offset = (stopIndex(line, stop.id) * Math.round(headway / 3)) % headway;
      const minutesToNext = ((headway - (((minutesNow - firstAt + offset) % headway + headway) % headway)) % headway) || headway;
      if (!withinService(minutesNow + minutesToNext, firstAt, lastAt)) continue;
      for (let k = 0; k < Math.ceil(perStop / 2); k++) {
        const at = minutesToNext + k * headway;
        if (!withinService(minutesNow + at, firstAt, lastAt)) break;
        out.push({
          stopId,
          stopName: stop.name,
          routeId: line.routeId,
          routeLabel: line.label,
          routeColor: line.color,
          mode: line.mode,
          // Estimated rows name the end of the branch the train is heading for.
          // No destination is invented beyond what the reference data lists.
          direction: '',
          headsign: dir === 0 ? northEnd : southEnd,
          arrivalAt: new Date(now.getTime() + at * 60_000).toISOString(),
          departureAt: new Date(now.getTime() + (at + 0.5) * 60_000).toISOString(),
          minutesAway: at,
          status: 'scheduled',
          delayMinutes: 0,
        });
      }
    }
  }
  return out.sort((a, b) => a.minutesAway - b.minutesAway);
}

const DAY_MINUTES = 1440;

/** Minutes since local midnight in Boston, whatever timezone the server runs in. */
function bostonMinuteOfDay(at: Date): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: BOSTON_TZ,
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  }).formatToParts(at);
  const value = (type: 'hour' | 'minute') => Number(parts.find((p) => p.type === type)?.value ?? '0');
  return (value('hour') % 24) * 60 + value('minute');
}

/** Service windows wrap past midnight on the rapid-transit lines. */
function withinService(minuteOfDay: number, firstAt: number, lastAt: number): boolean {
  const m = ((minuteOfDay % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES;
  return firstAt <= lastAt ? m >= firstAt && m <= lastAt : m >= firstAt || m <= lastAt;
}

function stopIndex(line: TransitLine, stopId: string): number {
  const i = line.dorchesterStops.findIndex((s) => s.id === stopId);
  return i < 0 ? 0 : i;
}

const ROUTE_IDS_FOR_ALERTS = ['Red', 'Mattapan', 'CR-Fairmount', ...DORCHESTER_BUS_ROUTES.map((b) => b.id)];
/** GTFS stop ids for lines DOR101 tracks, used to keep alerts about a station. */
const DORCHESTER_STOP_IDS_RT = new Set(TRANSIT_LINES.flatMap((line) => line.dorchesterStops.map((stop) => stop.id)));

export async function fetchAlerts(): Promise<{ alerts: ServiceAlert[]; source: DataSource; fetchedAt: string; attemptedRoutes: number }> {
  const cacheKey = 'mbta:alerts:dorchester';
  const cached = globalCache.get<{ alerts: ServiceAlert[]; source: DataSource; fetchedAt: string; attemptedRoutes: number }>(cacheKey);
  if (cached) return cached;

  // Registered key: v3 JSON (its own rate limit, richer translated fields).
  if (apiKey()) {
    const v3 = await fetchAlertsV3();
    globalCache.set(cacheKey, v3, 5 * 60_000);
    return v3;
  }

  const alerts: ServiceAlert[] = [];
  const seen = new Set<string>();
  let attemptedRoutes = 0;

  try {
    const feed = await fetchRtFeed('Alerts');
    const nowMs = Date.now();
    for (const entity of feed.entity ?? []) {
      const alert = entity.alert;
      if (!alert) continue;
      const entities = alert.informedEntity ?? [];
      const routeIds = [
        ...new Set(
          entities.map((e) => e.routeId).filter((id): id is string => typeof id === 'string' && id.length > 0)
        ),
      ];
      const stopIds = entities.map((e) => e.stopId).filter((id): id is string => typeof id === 'string' && id.length > 0);
      const touchesDorchester = routeIds.some((id) => ROUTE_IDS_FOR_ALERTS.includes(id)) || stopIds.some((id) => DORCHESTER_STOP_IDS_RT.has(id));
      if (!touchesDorchester) continue;

      const active = alert.activePeriod ?? [];
      const inWindow =
        active.length === 0 ||
        active.some((period) => {
          const start = epochSeconds(period.start);
          const end = epochSeconds(period.end);
          if (start != null && nowMs < start * 1000) return false;
          if (end != null && nowMs > end * 1000) return false;
          return true;
        });
      if (!inWindow) continue;

      attemptedRoutes++;
      if (seen.has(entity.id)) continue;
      seen.add(entity.id);

      const severity =
        alert.severityLevel === RtSeverityLevel.SEVERE
          ? 'major'
          : alert.severityLevel === RtSeverityLevel.WARNING
            ? 'minor'
            : 'info';
      const header = translated(alert.headerText);
      alerts.push({
        id: entity.id,
        header: header || 'Service notice',
        description: translated(alert.descriptionText),
        effect: alert.effect != null ? (RtEffect[alert.effect] ?? 'UNKNOWN_EFFECT') : 'UNKNOWN_EFFECT',
        severity,
        routeIds,
        validFrom: active[0]?.start != null ? new Date(Number(active[0].start) * 1000).toISOString() : null,
        validUntil: active[0]?.end != null ? new Date(Number(active[0].end) * 1000).toISOString() : null,
        lastModified: feed.header?.timestamp != null ? new Date(Number(feed.header.timestamp) * 1000).toISOString() : null,
        url: translated(alert.url) || null,
      });
    }
  } catch {
    // Fall through to the timetable answer below; the caller sees the source.
  }

  const payload = {
    alerts: alerts.sort((a, b) => severityRank(b.severity) - severityRank(a.severity)),
    source: (alerts.length ? 'mbta-live' : 'timetable') as DataSource,
    fetchedAt: new Date().toISOString(),
    attemptedRoutes,
  };
  globalCache.set(cacheKey, payload, 5 * 60_000);
  return payload;
}

/** v3 /alerts, used only when MBTA_API_KEY is configured. */
async function fetchAlertsV3(): Promise<{ alerts: ServiceAlert[]; source: DataSource; fetchedAt: string; attemptedRoutes: number }> {
  interface AlertAttrs {
    header?: string;
    description?: string;
    effect?: string;
    priority?: string;
    lifecycle?: string;
    severity?: number;
    valid_period?: { start?: string; end?: string };
    updated_at?: string;
    url?: string;
  }

  const alerts: ServiceAlert[] = [];
  const seen = new Set<string>();
  let attempted = 0;

  for (const routeId of ROUTE_IDS_FOR_ALERTS) {
    attempted++;
    try {
      const doc = await request<AlertAttrs>('/alerts', {
        'filter[route]': routeId,
        'filter[lifecycle]': 'current',
        'page[limit]': 10,
      });
      for (const a of list(doc)) {
        if (seen.has(a.id)) continue;
        seen.add(a.id);
        const attr = a.attributes ?? {};
        const severity = normalizeSeverity(attr.priority, attr.severity);
        alerts.push({
          id: a.id,
          header: attr.header ?? 'Service notice',
          description: attr.description ?? '',
          effect: attr.effect ?? 'UNKNOWN_EFFECT',
          severity,
          routeIds: [routeId],
          validFrom: attr.valid_period?.start ?? null,
          validUntil: attr.valid_period?.end ?? null,
          lastModified: attr.updated_at ?? null,
          url: attr.url ?? null,
        });
      }
    } catch {
      // One route failing must not blank the whole panel.
      continue;
    }
  }

  return {
    alerts: alerts.sort((a, b) => severityRank(b.severity) - severityRank(a.severity)),
    source: (alerts.length ? 'mbta-live' : 'timetable') as DataSource,
    fetchedAt: new Date().toISOString(),
    attemptedRoutes: attempted,
  };
}

function normalizeSeverity(priority?: string, severity?: number): ServiceAlert['severity'] {
  if (priority === 'HIGHEST' || priority === 'HIGH') return 'major';
  if (priority === 'MEDIUM') return 'minor';
  if (typeof severity === 'number') return severity >= 8 ? 'major' : severity >= 4 ? 'minor' : 'info';
  return 'info';
}

function severityRank(s: ServiceAlert['severity']): number {
  return s === 'major' ? 3 : s === 'minor' ? 2 : 1;
}

/**
 * Real GTFS route geometry. The shapes endpoint returns GeoJSON in [lng, lat];
 * we flip the pairs so Leaflet can consume them directly.
 */
export async function fetchShapes(routeIds: string[], bbox?: string): Promise<Record<string, ShapeGeometry>> {
  const out: Record<string, ShapeGeometry> = {};
  await Promise.all(
    routeIds.map(async (routeId) => {
      const cacheKey = `mbta:shape:${routeId}:${bbox ?? 'full'}`;
      const cached = globalCache.get<ShapeGeometry>(cacheKey);
      if (cached) {
        out[routeId] = cached;
        return;
      }
      // Without a key the v3 endpoint is rate limited to 20 req/min, shared
      // across every anonymous consumer; the bundled geometry is the fallback
      // the rest of the app already trusts, so only ask v3 when a key exists.
      if (!apiKey()) {
        const line = TRANSIT_LINES.find((l) => l.routeId === routeId);
        out[routeId] = {
          routeId,
          paths: line?.fallbackPath ? [line.fallbackPath] : [],
          source: 'timetable',
        };
        return;
      }
      interface ShapeAttrs {
        polyline?: [number, number][];
        geometry_type?: number;
      }
      try {
        const doc = await request<ShapeAttrs>('/shapes', {
          'filter[route]': routeId,
          ...(bbox ? { 'filter[bbox]': bbox } : {}),
          'page[limit]': 100,
        });
        const paths = list(doc)
          .map((s) => (s.attributes.polyline ?? []).map(([lat, lng]) => [lat, lng] as [number, number]))
          .filter((p) => p.length > 1);
        const geometry: ShapeGeometry = { routeId, paths, source: 'mbta-live' };
        globalCache.set(cacheKey, geometry, 12 * 60_000);
        out[routeId] = geometry;
      } catch {
        const line = TRANSIT_LINES.find((l) => l.routeId === routeId);
        out[routeId] = {
          routeId,
          paths: line?.fallbackPath ? [line.fallbackPath] : [],
          source: 'timetable',
        };
      }
    })
  );
  return out;
}

/**
 * Station list for a route, so a rebuild does not require editing our code.
 *
 * Without an API key the JSON endpoint usually answers 429, so the live request
 * is only made when a key is configured. The bundled GTFS reference (the same
 * ids the timetable fallback uses) is the honest, always-available answer and is
 * labelled `timetable` by the caller.
 */
export async function fetchStopsForRoute(routeId: string): Promise<{
  stops: Array<{ id: string; name: string; lat: number; lng: number; accessible: boolean; parentId?: string | null }>;
  source: DataSource;
}> {
  const cacheKey = `mbta:stops:${routeId}`;
  const cached = globalCache.get<{
    stops: Array<{ id: string; name: string; lat: number; lng: number; accessible: boolean; parentId?: string | null }>;
    source: DataSource;
  }>(cacheKey);
  if (cached) return cached;

  const bundled = (): { stops: Array<{ id: string; name: string; lat: number; lng: number; accessible: boolean; parentId?: string | null }>; source: DataSource } => {
    const seen = new Set<string>();
    const stops = TRANSIT_LINES.filter((line) => line.routeId === routeId)
      .flatMap((line) => line.dorchesterStops)
      .filter((stop) => {
        if (seen.has(stop.id)) return false;
        seen.add(stop.id);
        return true;
      })
      .map((stop) => ({ id: stop.id, name: stop.name, lat: stop.lat, lng: stop.lng, accessible: stop.accessible, parentId: null }));
    return { stops, source: 'timetable' };
  };

  if (!apiKey()) return bundled();

  interface StopAttrsExt extends StopAttrs {
    location_type?: number;
  }
  try {
    const doc = await request<StopAttrsExt>('/stops', {
      'filter[route]': routeId,
      'page[limit]': 200,
    });
    const stops = list(doc)
      .filter((s) => typeof s.attributes.latitude === 'number')
      .map((s) => ({
        id: s.id,
        name: s.attributes.name ?? s.id,
        lat: s.attributes.latitude!,
        lng: s.attributes.longitude!,
        accessible: s.attributes.wheelchair_boarding === 1,
        parentId: s.relationships?.parent_station?.data ? (s.relationships!.parent_station.data as { id: string }).id : null,
      }));
    if (stops.length === 0) return bundled();
    // 12 h: station inventory moves rarely, and this keeps anonymous traffic down.
    const payload = { stops, source: 'mbta-live' as const };
    globalCache.set(cacheKey, payload, 12 * 60 * 60_000);
    return payload;
  } catch {
    return bundled();
  }
}

export async function fetchRouteMeta(routeIds: string[]): Promise<Record<string, { label: string; name: string; color: string; textColor: string; directions: string[]; destinations: string[] }>> {
  const out: Record<string, { label: string; name: string; color: string; textColor: string; directions: string[]; destinations: string[] }> = {};
  await Promise.all(
    routeIds.map(async (id) => {
      const cacheKey = `mbta:route:${id}`;
      const cached = globalCache.get<(typeof out)[string]>(cacheKey);
      if (cached) {
        out[id] = cached;
        return;
      }
      if (!apiKey()) return; // bundled colours/names are shown; no key, no v3 call
      try {
        const doc = await request<RouteAttrs>(`/routes/${id}`);
        const resource = list(doc)[0];
        if (!resource) return;
        const a = resource.attributes ?? {};
        const meta = {
          label: a.short_name || (id === 'Red' ? 'B' : id),
          name: a.long_name || id,
          color: a.color ? `#${a.color}` : '#14304F',
          textColor: a.text_color ? `#${a.text_color}` : '#FFFFFF',
          directions: a.direction_names ?? [],
          destinations: a.direction_destinations ?? [],
        };
        globalCache.set(cacheKey, meta, 24 * 60 * 60_000);
        out[id] = meta;
      } catch {
        /* fall through to bundled data client-side */
      }
    })
  );
  return out;
}

export const transitReferenceMeta = {
  asOf: TRANSIT_DATA_AS_OF,
  lines: TRANSIT_LINES.map((l) => ({
    id: l.id,
    routeId: l.routeId,
    name: l.name,
    color: l.color,
    mode: l.mode,
    stopCount: l.dorchesterStops.length,
  })),
};
