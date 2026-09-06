'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Crosshair,
  Frame,
  Layers,
  Maximize2,
  Minimize2,
  RefreshCw,
  TriangleAlert,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { MapCanvas, type MapPin, type MapStyle, type MapStop, type ShapeData } from './MapCanvas';
import { Shield } from './Shield';
import { useI18n } from '@/i18n/hook';
import { useAppStore, useReduceMotion } from '@/stores/appStore';
import { useLivePolling } from '@/hooks/useLivePolling';
import { RESOURCES, type ResourceCategory } from '@/data/resources';
import { TRANSIT_LINES, DORCHESTER_BUS_ROUTES, type TransitMode } from '@/data/transit';
import { BOSTON_TZ, formatWindow, statusFor, type OpenStatus } from '@/lib/hours';
import type { Arrival, DataSource, ServiceAlert } from '@/lib/mbta';
import type { Map as LeafletMap } from 'leaflet';
import { cn } from '@/lib/utils';

/**
 * The interactive Dorchester map.
 *
 * Structure follows one rule: the map keeps its whole rectangle. Controls dock in
 * a toolbar above it and details sit in a column beside it, so nothing floats over
 * the geometry, no popup hides a station, and on a phone the column becomes a
 * sheet below the map rather than a second overlay.
 *
 * Transit data comes from `/api/mbta`, which prefers the live MBTA feed and falls
 * back to the published timetable. The UI never hides which of the two it is
 * showing: the badge names the source and an estimate is labelled as one.
 */

const RAIL_ROUTE_IDS = Array.from(new Set(TRANSIT_LINES.map((line) => line.routeId)));
const CATEGORIES: ResourceCategory[] = ['housing', 'food', 'health', 'legal', 'community', 'school'];

const SHIELD_MODE: Record<TransitMode, 'subway' | 'bus' | 'rail' | 'trolley'> = {
  subway: 'subway',
  trolley: 'trolley',
  rail: 'rail',
  bus: 'bus',
};

const STATUS_KEYS: Record<OpenStatus['state'], 'common.open' | 'common.closingSoon' | 'common.closed'> = {
  open: 'common.open',
  'closing-soon': 'common.closingSoon',
  closed: 'common.closed',
};

interface Focus {
  kind: 'rail' | 'bus';
  /** MBTA route id: `Red`, `Mattapan`, `CR-Fairmount`, or a bus number. */
  routeId: string;
}

export function DorchesterMap() {
  const { t, lang, format } = useI18n();
  const reduceMotion = useReduceMotion();
  const router = useRouter();
  const searchParams = useSearchParams();

  const mapStyle = useAppStore((s) => s.mapStyle) as MapStyle;
  const setMapStyle = useAppStore((s) => s.setMapStyle);
  const dataEpoch = useAppStore((s) => s.dataEpoch);

  const shellRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  const [mounted, setMounted] = useState(false);
  const [focus, setFocus] = useState<Focus>({ kind: 'rail', routeId: 'Red' });
  const [hiddenRails, setHiddenRails] = useState<string[]>([]);
  const [categories, setCategories] = useState<ResourceCategory[]>(['food', 'health', 'community', 'housing']);
  const [openOnly, setOpenOnly] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [camera, setCamera] = useState<{ lat: number; lng: number; zoom?: number; token: number } | null>(null);
  const [shapes, setShapes] = useState<ShapeData[]>([]);
  const [shapeSource, setShapeSource] = useState<DataSource>('timetable');
  const [liveStops, setLiveStops] = useState<MapStop[]>([]);
  const [liveArrivals, setLiveArrivals] = useState<Arrival[]>([]);
  const [arrivalSource, setArrivalSource] = useState<DataSource>('timetable');
  const [arrivalReason, setArrivalReason] = useState<string | undefined>();
  const [alerts, setAlerts] = useState<ServiceAlert[]>([]);
  const [routeLive, setRouteLive] = useState(false);
  const [live, setLive] = useState(false);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [locateError, setLocateError] = useState<'denied' | 'unavailable' | 'unsupported' | null>(null);
  const [locating, setLocating] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => setMounted(true), []);

  // One clock drives every countdown so the departures list, the "updated" stamp
  // and the open/closed badges cannot disagree with each other.
  useEffect(() => {
    if (!live && liveArrivals.length === 0) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [live, liveArrivals.length]);
  void now;

  /* ── route geometry ──────────────────────────────────────────── */
  const shapeRoutes = useMemo(() => {
    const rails = RAIL_ROUTE_IDS.filter((id) => !hiddenRails.includes(id));
    return focus.kind === 'bus' ? [...rails, focus.routeId] : rails;
  }, [hiddenRails, focus]);

  useEffect(() => {
    if (shapeRoutes.length === 0) {
      setShapes([]);
      return;
    }
    let cancelled = false;
    setStatus('loading');
    fetch(`/api/mbta?type=shapes&route=${encodeURIComponent(shapeRoutes.join(','))}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((payload: { shapes?: Record<string, ShapeData>; reference?: { source?: DataSource } }) => {
        if (cancelled) return;
        const incoming = Object.entries<ShapeData>(payload.shapes ?? {}).map(([routeId, shape]) => ({
          routeId,
          paths: shape.paths ?? [],
          source: (shape.source ?? payload.reference?.source ?? 'timetable') as DataSource,
        }));
        const merged = mergeShapes(incoming, shapeRoutes);
        setShapes(merged);
        setShapeSource(incoming.some((s) => s.source === 'mbta-live') ? 'mbta-live' : 'timetable');
        setStatus('ready');
      })
      .catch(() => {
        if (cancelled) return;
        setShapes(mergeShapes([], shapeRoutes));
        setShapeSource('timetable');
        setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [shapeRoutes, dataEpoch]);

  /* ── stations for the focused line ───────────────────────────── */
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/mbta?type=stops&route=${encodeURIComponent(focus.routeId)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((payload: { stops?: Array<{ id: string; name: string; lat: number; lng: number; accessible: boolean }>; source?: DataSource }) => {
        if (cancelled) return;
        const line = TRANSIT_LINES.find((l) => l.routeId === focus.routeId);
        const bus = DORCHESTER_BUS_ROUTES.find((b) => b.id === focus.routeId);
        const color = `#${(line?.color ?? bus?.color ?? 'DA291C').replace('#', '')}`;
        setLiveStops(
          (payload.stops ?? []).map((stop) => ({
            id: stop.id,
            name: stop.name,
            lat: stop.lat,
            lng: stop.lng,
            color,
            mode: SHIELD_MODE[line?.mode ?? 'bus'],
            label: line?.label ?? bus?.name ?? focus.routeId,
            interchange: false,
            accessible: stop.accessible,
          }))
        );
        setRouteLive(payload.source === 'mbta-live');
      })
      .catch(() => {
        if (!cancelled) {
          setLiveStops([]);
          setRouteLive(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [focus.routeId, dataEpoch]);

  const stops = useMemo<MapStop[]>(() => {
    if (liveStops.length > 0) return liveStops;
    if (focus.kind === 'bus') return [];
    return TRANSIT_LINES.filter((line) => line.routeId === focus.routeId).flatMap((line) =>
      line.dorchesterStops.map((stop) => ({
        id: stop.id,
        name: stop.name,
        lat: stop.lat,
        lng: stop.lng,
        color: `#${line.color.replace('#', '')}`,
        mode: SHIELD_MODE[line.mode],
        label: line.label,
        interchange: Boolean(stop.connects && stop.connects.length > 0),
        accessible: stop.accessible,
      }))
    );
  }, [liveStops, focus]);

  /* ── places ──────────────────────────────────────────────────── */
  const pins = useMemo<MapPin[]>(() => {
    const stamp = new Date(now);
    return RESOURCES.filter((resource) => categories.includes(resource.category))
      .map((resource) => {
        const openState = resource.hours ? statusFor(resource.hours, stamp, BOSTON_TZ) : null;
        return {
          id: resource.id,
          name: resource.name,
          lat: resource.lat,
          lng: resource.lng,
          category: resource.category,
          openNow: openState?.state === 'open',
          subtitle: `${resource.neighborhood} · ${openState ? t(STATUS_KEYS[openState.state]) : t('map.nearby')}`,
        };
      })
      .filter((pin) => !openOnly || pin.openNow);
  }, [categories, openOnly, now, t]);

  /* ── live arrivals and alerts ────────────────────────────────── */
  const stopParam = useMemo(() => {
    if (selectedStopId) return selectedStopId;
    // Nothing selected: read the stations the rider is most likely looking at,
    // which is the Dorchester end of the focused line.
    const scoped = stops.length > 0 ? stops.slice(-3).map((stop) => stop.id) : [defaultStopsFor(focus.routeId)];
    return scoped.join(',');
  }, [selectedStopId, stops, focus.routeId]);

  const refreshLive = useCallback(async () => {
    try {
      const [arrivalsPayload, alertsPayload] = await Promise.all([
        fetch(`/api/mbta?type=arrivals&stops=${encodeURIComponent(stopParam)}&perStop=4`).then((r) => (r.ok ? r.json() : null)),
        fetch(`/api/mbta?type=alerts&route=${encodeURIComponent(focus.routeId)}`).then((r) => (r.ok ? r.json() : null)),
      ]);
      if (arrivalsPayload) {
        setLiveArrivals(arrivalsPayload.arrivals ?? []);
        setArrivalSource(arrivalsPayload.source ?? 'timetable');
        setArrivalReason(arrivalsPayload.degradedReason);
        setUpdatedAt(Date.now());
        setLive(true);
      }
      if (alertsPayload) setAlerts(alertsPayload.alerts ?? []);
      setStatus((prev) => (prev === 'error' ? prev : 'ready'));
    } catch {
      setArrivalSource('timetable');
      setStatus('error');
    }
  }, [stopParam, focus.routeId]);

  const { intervalMs, enabled: polling } = useLivePolling(refreshLive, { minMs: 30000 });

  // The first read is issued by useLivePolling; this only resets the badge so a
  // panel never shows yesterday's "live" dot while its new request is in flight.
  useEffect(() => {
    setLive(false);
  }, [stopParam, focus.routeId]);

  /* ── selection ───────────────────────────────────────────────── */
  const selectStop = useCallback(
    (id: string) => {
      if (id.startsWith('route:')) {
        const routeId = id.slice(6);
        const bus = DORCHESTER_BUS_ROUTES.find((b) => b.id === routeId);
        if (bus) setFocus({ kind: 'bus', routeId });
        else if (RAIL_ROUTE_IDS.includes(routeId)) setFocus({ kind: 'rail', routeId });
        return;
      }
      setSelectedStopId(id);
      setSelectedPinId(null);
      const stop = stops.find((s) => s.id === id);
      if (stop) setCamera({ lat: stop.lat, lng: stop.lng, token: Date.now() });
      const params = new URLSearchParams(searchParams.toString());
      params.set('stop', id);
      router.replace(`/map?${params.toString()}`, { scroll: false });
    },
    [router, searchParams, stops]
  );

  const selectPin = useCallback(
    (id: string) => {
      const resource = RESOURCES.find((r) => r.id === id);
      if (!resource) return;
      setSelectedPinId(id);
      setSelectedStopId(null);
      setCamera({ lat: resource.lat, lng: resource.lng, zoom: 16, token: Date.now() });
      const params = new URLSearchParams(searchParams.toString());
      params.set('place', id);
      router.replace(`/map?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const clearSelection = useCallback(() => {
    setSelectedStopId(null);
    setSelectedPinId(null);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('stop');
    params.delete('place');
    const query = params.toString();
    router.replace(query ? `/map?${query}` : '/map', { scroll: false });
  }, [router, searchParams]);

  // A link like /map?stop=place-fldcr should open on that platform.
  const appliedParams = useRef(false);
  useEffect(() => {
    if (appliedParams.current) return;
    appliedParams.current = true;
    const stopParamFromUrl = searchParams.get('stop');
    const placeParam = searchParams.get('place');
    const routeParam = searchParams.get('route');
    if (routeParam) {
      if (DORCHESTER_BUS_ROUTES.some((b) => b.id === routeParam)) setFocus({ kind: 'bus', routeId: routeParam });
      else if (RAIL_ROUTE_IDS.includes(routeParam)) setFocus({ kind: 'rail', routeId: routeParam });
    }
    if (stopParamFromUrl) {
      const known = TRANSIT_LINES.flatMap((line) => line.dorchesterStops).find((stop) => stop.id === stopParamFromUrl);
      if (known) {
        if (routeParam === undefined) {
          const owner = TRANSIT_LINES.find((line) => line.dorchesterStops.some((s) => s.id === stopParamFromUrl));
          if (owner) setFocus({ kind: 'rail', routeId: owner.routeId });
        }
        setSelectedStopId(known.id);
        setCamera({ lat: known.lat, lng: known.lng, token: Date.now() });
      }
    }
    if (placeParam && RESOURCES.some((r) => r.id === placeParam)) selectPin(placeParam);
  }, [searchParams, selectPin]);

  /* ── map affordances ─────────────────────────────────────────── */
  const locate = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setLocateError('unsupported');
      return;
    }
    setLocating(true);
    setLocateError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const point: [number, number] = [position.coords.latitude, position.coords.longitude];
        setUserPosition(point);
        setCamera({ lat: point[0], lng: point[1], zoom: 16, token: Date.now() });
        setLocating(false);
      },
      (error) => {
        setLocating(false);
        setLocateError(error.code === error.PERMISSION_DENIED ? 'denied' : 'unavailable');
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  }, []);

  const recenter = useCallback(() => {
    setCamera({ lat: 42.3065, lng: -71.064, zoom: 14, token: Date.now() });
  }, []);

  const [fullscreen, setFullscreen] = useState(false);
  const toggleFullscreen = useCallback(async () => {
    const el = shellRef.current;
    if (!el) return;
    if (!document.fullscreenElement) await el.requestFullscreen?.().catch(() => undefined);
    else await document.exitFullscreen?.().catch(() => undefined);
  }, []);

  useEffect(() => {
    const onChange = () => {
      setFullscreen(Boolean(document.fullscreenElement));
      // Leaflet sized itself against the old box; a full-screen map that keeps the
      // old size paints grey gutters and offsets every click.
      window.setTimeout(() => mapRef.current?.invalidateSize(), 160);
    };
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  useEffect(() => {
    const onResize = () => mapRef.current?.invalidateSize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  /* ── derived panels ──────────────────────────────────────────── */
  const selectedStop = selectedStopId ? stops.find((s) => s.id === selectedStopId) ?? null : null;
  const selectedResource = selectedPinId ? RESOURCES.find((r) => r.id === selectedPinId) ?? null : null;
  const focusedLine = TRANSIT_LINES.find((line) => line.routeId === focus.routeId);
  const focusedBus = DORCHESTER_BUS_ROUTES.find((bus) => bus.id === focus.routeId) ?? null;

  const departures = useMemo(() => {
    const scoped = selectedStopId ? liveArrivals.filter((a) => a.stopId === selectedStopId) : liveArrivals;
    return [...scoped]
      .sort((a, b) => new Date(a.arrivalAt).getTime() - new Date(b.arrivalAt).getTime())
      .slice(0, selectedStopId ? 8 : 10)
      .map((arrival) => ({
        ...arrival,
        minutes: format.minutesAway(arrival.arrivalAt),
        clock: format.time(arrival.arrivalAt),
      }));
  }, [liveArrivals, selectedStopId, format, now]);

  const lineAlerts = useMemo(
    () =>
      alerts.filter((alert) => alert.routeIds.length === 0 || alert.routeIds.includes(focus.routeId)),
    [alerts, focus.routeId]
  );

  const transitSource: DataSource = routeLive && arrivalSource === 'mbta-live' ? 'mbta-live' : arrivalSource;

  return (
    <div ref={shellRef} className="dor101-map-shell flex flex-col gap-2.5">
      {/* ── toolbar ─────────────────────────────────────────────── */}
      <div className="dor101-map-toolbar flex flex-wrap items-center gap-x-2 gap-y-1.5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/95 px-2.5 py-2 shadow-sm backdrop-blur">
        <label className="flex items-center gap-1.5">
          <span className="font-heading text-[11px] font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
            {t('map.route')}
          </span>
          <select
            value={focus.routeId}
            onChange={(event) => {
              const value = event.target.value;
              setFocus(
                DORCHESTER_BUS_ROUTES.some((b) => b.id === value)
                  ? { kind: 'bus', routeId: value }
                  : { kind: 'rail', routeId: value }
              );
              setSelectedStopId(null);
            }}
            className="h-9 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-2.5 font-heading text-sm font-semibold transition-colors hover:border-[var(--color-accent-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent-primary)]"
          >
            {TRANSIT_LINES.map((line) => (
              <option key={line.id} value={line.routeId}>
                {line.name}
              </option>
            ))}
            {DORCHESTER_BUS_ROUTES.map((bus) => (
              <option key={bus.id} value={bus.id}>
                {t('map.line.bus')} {bus.name}
              </option>
            ))}
          </select>
        </label>

        <div
          className="flex items-center gap-0.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-0.5"
          role="group"
          aria-label={t('map.styleLabel')}
        >
          {(['street', 'satellite', 'hybrid'] as MapStyle[]).map((option) => (
            <motion.button
              key={option}
              type="button"
              onClick={() => setMapStyle(option)}
              whileHover={{ scale: reduceMotion ? 1 : 1.04 }}
              whileTap={{ scale: reduceMotion ? 1 : 0.94 }}
              aria-pressed={mapStyle === option}
              className={cn(
                'h-8 rounded-full px-3 font-heading text-xs font-bold transition-colors',
                mapStyle === option
                  ? 'bg-[var(--color-accent-primary)] text-white shadow-sm'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-accent-primary)]'
              )}
            >
              {t(`map.style.${option}` as 'map.style.street')}
            </motion.button>
          ))}
        </div>

        <label className="flex items-center gap-1.5">
          <span className="sr-only">{t('map.placeLayers')}</span>
          <span aria-hidden="true" className="text-[var(--color-text-muted)]">
            <Layers className="h-4 w-4" />
          </span>
          <select
            value={categories.length === 0 ? '' : 'custom'}
            onChange={(event) => {
              if (event.target.value === 'all') setCategories(CATEGORIES);
              if (event.target.value === 'none') setCategories([]);
            }}
            className="h-9 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-2 font-heading text-xs font-semibold"
          >
            <option value="" disabled>
              {t('map.placeLayers')}
            </option>
            <option value="all">{t('common.all')}</option>
            <option value="none">{t('common.none')}</option>
          </select>
        </label>

        <div className="ms-auto flex items-center gap-1">
          <MapButton label={t('common.refresh')} onClick={() => void refreshLive()} busy={live && status === 'loading'}>
            <RefreshCw className="h-4 w-4" />
          </MapButton>
          <MapButton label={t('map.recenter')} onClick={recenter}>
            <Frame className="h-4 w-4" />
          </MapButton>
          <MapButton label={t('map.zoomIn')} onClick={() => mapRef.current?.zoomIn()}>
            <ZoomIn className="h-4 w-4" />
          </MapButton>
          <MapButton label={t('map.zoomOut')} onClick={() => mapRef.current?.zoomOut()}>
            <ZoomOut className="h-4 w-4" />
          </MapButton>
          <MapButton label={t('map.locate')} onClick={locate} busy={locating} active={Boolean(userPosition)}>
            <Crosshair className="h-4 w-4" />
          </MapButton>
          <MapButton label={t('map.legend')} onClick={() => setShowLegend((v) => !v)} active={showLegend}>
            <Layers className="h-4 w-4" />
          </MapButton>
          <MapButton label={fullscreen ? t('map.exitFullscreen') : t('map.fullscreen')} onClick={() => void toggleFullscreen()}>
            {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </MapButton>
        </div>
      </div>

      {/* ── map + details ───────────────────────────────────────── */}
      <div className="grid items-stretch gap-2.5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="relative min-h-[20rem] overflow-hidden rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-md)]">
          <div className={cn('w-full', fullscreen ? 'h-[calc(100vh-7rem)]' : 'h-[54vh] lg:h-[38rem]')}>
            {!mounted ? (
              <div className="flex h-full items-end bg-[var(--color-bg-tertiary)] p-4">
                <div className="skeleton h-full w-full rounded-xl opacity-70" />
              </div>
            ) : (
              <MapCanvas
                style={mapStyle}
                shapes={shapes}
                stops={stops}
                pins={pins}
                selectedStopId={selectedStopId}
                selectedPinId={selectedPinId}
                userPosition={userPosition}
                focusRequest={camera}
                onSelectStop={selectStop}
                onSelectPin={selectPin}
                onBlankClick={clearSelection}
                onMapReady={(map) => {
                  mapRef.current = map;
                  map.invalidateSize();
                }}
              />
            )}
          </div>

          {/* Layer chips dock to the map frame's own header row, not to the canvas,
              so a chip can never sit on top of a station. */}
          <div className="flex flex-wrap items-center gap-1.5 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]/95 px-2.5 py-1.5">
            {RAIL_ROUTE_IDS.map((routeId) => {
              const line = TRANSIT_LINES.find((l) => l.routeId === routeId);
              if (!line) return null;
              const hidden = hiddenRails.includes(routeId);
              return (
                <button
                  key={routeId}
                  type="button"
                  aria-pressed={!hidden}
                  onClick={() => setHiddenRails((prev) => (hidden ? prev.filter((r) => r !== routeId) : [...prev, routeId]))}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-heading text-[11px] font-bold transition-all duration-150',
                    hidden
                      ? 'border-[var(--color-border)] text-[var(--color-text-muted)] opacity-60'
                      : 'border-transparent text-white shadow-sm'
                  )}
                  style={hidden ? undefined : { background: `#${line.color.replace('#', '')}` }}
                >
                  <Shield label={line.label} mode={SHIELD_MODE[line.mode]} color={hidden ? undefined : `#${line.color.replace('#', '')}`} ink={hidden ? undefined : `#${line.textColor.replace('#', '')}`} compact />
                  <span className={cn(hidden && 'line-through')}>{line.label}</span>
                </button>
              );
            })}
            <span className="mx-1 hidden h-4 w-px bg-[var(--color-border)] sm:block" aria-hidden="true" />
            {CATEGORIES.map((category) => {
              const on = categories.includes(category);
              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setCategories((prev) => (on ? prev.filter((c) => c !== category) : [...prev, category]))}
                  className={cn(
                    'rounded-full border px-2 py-0.5 font-heading text-[11px] font-semibold transition-colors',
                    on
                      ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)] text-white'
                      : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)]'
                  )}
                >
                  {t(`map.${category}` as 'map.food')}
                </button>
              );
            })}
            <label className="ms-auto flex cursor-pointer items-center gap-1.5 font-heading text-[11px] font-semibold text-[var(--color-text-secondary)]">
              <input
                type="checkbox"
                checked={openOnly}
                onChange={(event) => setOpenOnly(event.target.checked)}
                className="h-3.5 w-3.5 accent-[var(--color-accent-primary)]"
              />
              {t('map.openNowOnly')}
            </label>
          </div>
        </div>

        <aside
          className="dor101-dock flex flex-col gap-2.5 lg:max-h-[calc(38rem+2.5rem)] lg:overflow-y-auto lg:pr-1"
          aria-label={t('map.details')}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/95 px-3 py-2">
            <span className="inline-flex items-center gap-1.5 font-heading text-xs font-bold uppercase tracking-wide">
              <span
                className={cn(
                  'h-2 w-2 rounded-full',
                  transitSource === 'mbta-live' ? 'live-dot' : 'bg-[var(--color-text-muted)]'
                )}
                aria-hidden="true"
              />
              {transitSource === 'mbta-live' ? t('map.live') : transitSource === 'offline-cache' ? t('map.offline') : t('map.schedule')}
            </span>
            <span className="text-[11px] text-[var(--color-text-muted)]">
              {polling
                ? t('map.updatedEvery', { seconds: String(Math.round(intervalMs / 1000)) })
                : updatedAt
                  ? `${t('common.updated')} ${format.time(updatedAt)}`
                  : t('map.tapStop')}
            </span>
          </div>

          <section aria-live="polite" aria-label={t('map.departures')} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-primary)]/95 p-3">
            <header className="flex items-start justify-between gap-2">
              <div>
                <h2 className="font-heading text-sm font-bold leading-tight">
                  {selectedStop ? selectedStop.name : t('map.tapStop')}
                </h2>
                <p className="mt-0.5 text-[11px] leading-snug text-[var(--color-text-muted)]">
                  {selectedStop ? t('map.departures') : t('map.selectHint')}
                </p>
              </div>
              {selectedStop && (
                <button
                  type="button"
                  onClick={clearSelection}
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[var(--color-border)] text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)]"
                  aria-label={t('common.close')}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </header>

            {departures.length === 0 ? (
              <p className="mt-2 rounded-xl border border-dashed border-[var(--color-border)] px-3 py-2.5 text-xs leading-snug text-[var(--color-text-secondary)]">
                {liveArrivals.length === 0 && status === 'loading' ? t('map.predictionsLoading') : t('map.noDepartures')}
              </p>
            ) : (
              <ul className="mt-2 space-y-1">
                {departures.map((departure) => (
                  <li
                    key={`${departure.stopId}-${departure.routeId}-${departure.arrivalAt}`}
                    className="flex items-center gap-2 rounded-xl border border-[var(--color-border)]/70 bg-[var(--color-bg-secondary)]/60 px-2 py-1.5"
                  >
                    <Shield
                      label={departure.routeLabel}
                      mode={SHIELD_MODE[departure.mode]}
                      color={departure.routeColor ? `#${departure.routeColor.replace('#', '')}` : undefined}
                      ink={departure.routeColor ? undefined : '#000000'}
                    />
                    <span className="min-w-0 flex-1 truncate text-xs" dir="auto" title={departure.headsign || departure.direction}>
                      {departure.headsign || departure.direction || t('map.departures')}
                    </span>
                    {departure.track ? (
                      <span className="shrink-0 font-heading text-[10px] font-bold uppercase text-[var(--color-text-muted)]">
                        {t('map.track')} {departure.track}
                      </span>
                    ) : null}
                    <span className="shrink-0 text-right">
                      <span className="block font-heading text-sm font-bold leading-none tabular-nums">
                        {departure.minutes <= 0 ? t('map.due') : t('map.arrivalMinutes', { count: departure.minutes })}
                      </span>
                      <span className="mt-0.5 block text-[10px] leading-none text-[var(--color-text-muted)] tabular-nums">
                        {departure.clock}
                        {departure.status === 'delayed' ? ` · ${t('map.delayed', { minutes: String(departure.delayMinutes) })}` : ''}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {transitSource !== 'mbta-live' && (
              <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-snug text-[var(--color-text-muted)]">
                <TriangleAlert className="mt-0.5 h-3 w-3 shrink-0 text-[var(--color-accent-amber)]" aria-hidden="true" />
                <span>{arrivalReason ?? t('map.scheduleData')}</span>
              </p>
            )}
            {focus.kind === 'bus' && (
              <p className="mt-1.5 text-[11px] leading-snug text-[var(--color-text-muted)]">{t('map.busFeedNote')}</p>
            )}
          </section>

          <AnimatePresence mode="wait" initial={false}>
            {selectedResource ? (
              <motion.section
                key={selectedResource.id}
                initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduceMotion ? 0 : -8 }}
                transition={{ duration: reduceMotion ? 0 : 0.2 }}
                className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-primary)]/95 p-3"
              >
                <PlaceCard
                  id={selectedResource.id}
                  onClose={clearSelection}
                  openOnly={openOnly}
                />
              </motion.section>
            ) : (
              <motion.section
                key={`line-${focus.routeId}`}
                initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.2 }}
                className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-primary)]/95 p-3"
                aria-label={t('map.transitRoutes')}
              >
                <h2 className="font-heading text-sm font-bold leading-tight">
                  {focusedLine?.name ?? `${t('map.line.bus')} ${focusedBus?.name}`}
                </h2>
                {focusedBus && focus.kind === 'bus' && (
                  <p className="mt-1 text-xs leading-snug text-[var(--color-text-secondary)]" dir="auto">
                    {focusedBus.longName}
                  </p>
                )}
                <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                  <div>
                    <dt className="text-[11px] text-[var(--color-text-muted)]">{t('map.headway')}</dt>
                    <dd className="font-heading font-bold tabular-nums">
                      {t('map.headwayValue', {
                        minutes: String(focusedLine?.headwayMinutes ?? focusedBus?.headwayMinutes ?? 20),
                      })}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-[var(--color-text-muted)]">{t('map.stopCount', { count: String(stops.length) })}</dt>
                    <dd className="font-heading font-bold">
                      {stops.length > 0 ? t('map.live') : t('map.schedule')}
                    </dd>
                  </div>
                  {focusedLine && (
                    <>
                      <div>
                        <dt className="text-[11px] text-[var(--color-text-muted)]">{t('map.first')}</dt>
                        <dd className="font-heading font-bold tabular-nums">{focusedLine.firstDeparts}</dd>
                      </div>
                      <div>
                        <dt className="text-[11px] text-[var(--color-text-muted)]">{t('map.last')}</dt>
                        <dd className="font-heading font-bold tabular-nums">{focusedLine.lastDeparts}</dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-[11px] text-[var(--color-text-muted)]">{t('map.fare')}</dt>
                        <dd className="font-heading font-bold">
                          {t('map.fareValue', { price: format.currency(focusedLine.fare.CharlieCardUsd, { cents: true }) })}
                        </dd>
                      </div>
                    </>
                  )}
                </dl>
                <p className="mt-2 text-[11px] leading-snug text-[var(--color-text-muted)]">
                  {shapeSource === 'mbta-live' ? t('map.liveData') : t('map.geometryFailed')}
                </p>
                <a
                  href={`https://www.mbta.com/schedules/${focus.routeId.toLowerCase()}/line`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-2 inline-flex items-center gap-1 font-heading text-xs font-bold text-[var(--color-accent-primary)] underline decoration-dotted underline-offset-2"
                >
                  {t('map.openMbta')}
                </a>
              </motion.section>
            )}
          </AnimatePresence>

          {lineAlerts.length > 0 && (
            <section className="space-y-2" aria-label={t('map.alerts')}>
              {lineAlerts.slice(0, 3).map((alert) => (
                <article
                  key={alert.id}
                  className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-primary)]/95 p-3"
                  style={{ borderLeft: '4px solid var(--mbta-delay)' }}
                >
                  <p className="font-heading text-xs font-bold leading-snug" dir="auto">
                    {alert.header}
                  </p>
                  {alert.description && (
                    <p className="mt-1 line-clamp-3 text-xs leading-snug text-[var(--color-text-secondary)]" dir="auto">
                      {alert.description}
                    </p>
                  )}
                  {alert.validUntil && (
                    <p className="mt-1.5 text-[11px] text-[var(--color-text-muted)]">
                      {t('map.last', { time: format.time(alert.validUntil) })}
                    </p>
                  )}
                </article>
              ))}
            </section>
          )}

          <p className="px-1 text-[11px] leading-snug text-[var(--color-text-muted)]">
            {t('map.keyboardHint')} {t('map.wheelHint')}
          </p>
        </aside>
      </div>

      <AnimatePresence initial={false}>
        {showLegend && (
          <motion.div
            key="legend"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <MapLegend
              source={transitSource}
              hiddenRails={hiddenRails}
              onToggleRail={(routeId) =>
                setHiddenRails((prev) => (prev.includes(routeId) ? prev.filter((r) => r !== routeId) : [...prev, routeId]))
              }
            />
          </motion.div>
        )}
      </AnimatePresence>

      {locateError && (
        <p role="status" className="rounded-xl border border-[var(--color-accent-amber)]/50 bg-[var(--color-accent-amber)]/10 px-3 py-2 text-xs text-[var(--color-text-primary)]">
          {locateError === 'denied'
            ? t('map.locateDenied')
            : locateError === 'unsupported'
              ? t('map.locateUnsupported')
              : t('map.predictionsFailed')}
        </p>
      )}
    </div>
  );
}

/* ── building blocks ───────────────────────────────────────────── */

function MapButton({
  label,
  onClick,
  busy,
  active,
  children,
}: {
  label: string;
  onClick: () => void;
  busy?: boolean;
  active?: boolean;
  children: React.ReactNode;
}) {
  const reduceMotion = useReduceMotion();
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={reduceMotion ? undefined : { scale: 1.08, y: -1 }}
      whileTap={reduceMotion ? undefined : { scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 480, damping: 30 }}
      aria-label={label}
      title={label}
      aria-pressed={active}
      className={cn(
        'grid h-9 w-9 place-items-center rounded-xl border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent-primary)]',
        active
          ? 'border-transparent bg-[var(--color-accent-primary)] text-white'
          : 'border-[var(--color-border)] bg-[var(--color-bg-primary)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)]'
      )}
    >
      <span className={cn('grid place-items-center', busy && 'animate-spin')}>{children}</span>
    </motion.button>
  );
}

/**
 * Place card for the details column. Reads the same record the /resources page
 * renders, so a corrected phone number shows up in both places at once.
 */
function PlaceCard({ id, onClose, openOnly: _openOnly }: { id: string; onClose: () => void; openOnly: boolean }) {
  const { t, format, pickContent, meta } = useI18n();
  const resource = RESOURCES.find((r) => r.id === id);
  if (!resource) return null;
  const statusNow = resource.hours ? statusFor(resource.hours, new Date(), BOSTON_TZ) : null;
  const today = resource.hours ? resource.hours[(new Date().getDay() + 6) % 7] : [];
  const summary = pickContent(resource.summary);

  return (
    <>
      <header className="flex items-start justify-between gap-2">
        <div>
          <h2 className="font-heading text-sm font-bold leading-tight">{resource.name}</h2>
          <p className="mt-0.5 text-[11px] text-[var(--color-text-muted)]">{t(`map.${resource.category}` as 'map.food')}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('common.close')}
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[var(--color-border)] text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)]"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </header>
      {summary.value && (
        <p className="mt-1.5 text-xs leading-snug text-[var(--color-text-secondary)]" dir="auto">
          {summary.value}
        </p>
      )}
      {summary.fellBack && (
        <p className="mt-1 text-[10px] uppercase tracking-wide text-[var(--color-text-muted)]">
          {t('lang.untranslated', { language: meta.name })}
        </p>
      )}
      {statusNow && (
        <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] px-2 py-0.5 font-heading text-[11px] font-bold">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: statusNow.state === 'open' ? 'var(--mbta-green)' : statusNow.state === 'closing-soon' ? 'var(--color-accent-amber)' : 'var(--color-text-muted)' }}
            aria-hidden="true"
          />
          {t(STATUS_KEYS[statusNow.state])}
          {statusNow.state !== 'closed' && 'closesAt' in statusNow
            ? ` · ${format.time(new Date(statusNow.closesAt))}`
            : 'opensAt' in statusNow
              ? ` · ${t('map.first', { time: format.time(new Date(statusNow.opensAt)) })}`
              : ''}
        </p>
      )}
      {today.length > 0 && (
        <p className="mt-1.5 text-[11px] text-[var(--color-text-muted)]">
          {format.weekday(new Date(), 'short')} {today.map((window) => formatWindow(window)).join(', ')}
        </p>
      )}
      <p className="mt-2 text-xs">{resource.address}</p>
      {resource.phone && (
        <a
          href={`tel:${resource.phone.replace(/[^\d+]/g, '')}`}
          className="mt-1 block font-heading text-xs font-bold text-[var(--color-accent-primary)] underline decoration-dotted underline-offset-2"
        >
          {resource.phone}
        </a>
      )}
      {resource.accessibility?.stepFree && (
        <p className="mt-1.5 text-[11px] text-[var(--color-text-secondary)]">
          {t('map.wheelchair')}
          {resource.accessibility.note ? `: ${resource.accessibility.note}` : ''}
        </p>
      )}
      <Link
        href={resource.detailHref ?? `/resources?place=${resource.id}`}
        className="mt-2.5 inline-flex items-center gap-1 rounded-full bg-[var(--color-accent-primary)] px-3 py-1.5 font-heading text-[11px] font-bold text-white transition-transform active:scale-[0.97]"
      >
        {t('map.openRecord')}
      </Link>
    </>
  );
}

function MapLegend({
  source,
  hiddenRails,
  onToggleRail,
}: {
  source: DataSource;
  hiddenRails: string[];
  onToggleRail: (routeId: string) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="grid gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/95 p-4 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <h3 className="font-heading text-[11px] font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
          {t('map.transitRoutes')}
        </h3>
        <ul className="mt-2 space-y-1.5">
          {TRANSIT_LINES.map((line) => (
            <li key={line.id}>
              <button
                type="button"
                onClick={() => onToggleRail(line.routeId)}
                aria-pressed={!hiddenRails.includes(line.routeId)}
                className="flex w-full items-center gap-2 rounded-lg px-1 py-0.5 text-left text-xs transition-colors hover:bg-[var(--color-bg-tertiary)]"
              >
                <Shield
                  label={line.label}
                  mode={SHIELD_MODE[line.mode]}
                  color={`#${line.color.replace('#', '')}`}
                  ink={`#${line.textColor.replace('#', '')}`}
                />
                <span className={cn('truncate', hiddenRails.includes(line.routeId) && 'text-[var(--color-text-muted)] line-through')}>
                  {line.name}
                </span>
              </button>
            </li>
          ))}
          <li className="flex items-center gap-2 text-xs">
            <span className="h-1 w-6 rounded-full bg-[var(--mbta-delay)]" aria-hidden="true" />
            {t('map.line.bus')}
          </li>
        </ul>
      </div>

      <div>
        <h3 className="font-heading text-[11px] font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
          {t('map.stopsTitle')}
        </h3>
        <ul className="mt-2 space-y-1.5 text-xs">
          <li className="flex items-center gap-2">
            <span className="grid h-6 w-6 shrink-0 place-items-center" aria-hidden="true">
              <span className="h-3.5 w-3.5 rounded-full border-2 border-white bg-[var(--mbta-red)] shadow-[0_0_0_1px_rgba(0,0,0,.35)]" />
            </span>
            {t('map.wheelchairUnknown')}
          </li>
          <li className="flex items-center gap-2">
            <span className="grid h-6 w-6 shrink-0 place-items-center" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--mbta-red)] shadow-[0_0_0_1px_rgba(0,0,0,.25)]" />
            </span>
            {t('map.stopCount', { count: String(TRANSIT_LINES.flatMap((l) => l.dorchesterStops).length) })}
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-6 rounded-full bg-[var(--mbta-red)] [mask-image:repeating-linear-gradient(90deg,#000_0_5px,transparent_5px_9px)]" aria-hidden="true" />
            {t('map.schedule')}
          </li>
        </ul>
      </div>

      <div>
        <h3 className="font-heading text-[11px] font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
          {t('map.placeLayers')}
        </h3>
        <ul className="mt-2 grid grid-cols-2 gap-1.5 text-xs">
          {CATEGORIES.map((category) => (
            <li key={category} className="flex items-center gap-1.5">
              <span className="h-3 w-3 shrink-0 rounded-full border border-white/80 shadow-sm" style={{ background: pinTone(category) }} aria-hidden="true" />
              {t(`map.${category}` as 'map.food')}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[11px] leading-snug text-[var(--color-text-muted)]">{t('map.locationsShown', { shown: String(RESOURCES.length), total: String(RESOURCES.length) })}</p>
      </div>

      <div>
        <h3 className="font-heading text-[11px] font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
          {t('about.sources')}
        </h3>
        <p className="mt-2 text-[11px] leading-snug text-[var(--color-text-secondary)]">
          {source === 'mbta-live' ? t('map.liveData') : t('map.scheduleData')}
        </p>
        <p className="mt-1.5 text-[11px] leading-snug text-[var(--color-text-muted)]">{t('map.dataCredits')}</p>
      </div>
    </div>
  );
}

function pinTone(category: ResourceCategory): string {
  return {
    housing: 'var(--color-accent-primary)',
    food: 'var(--color-accent-green)',
    health: 'var(--color-accent-secondary)',
    legal: 'var(--color-accent-amber)',
    community: 'var(--color-accent-primary-soft)',
    school: 'var(--mbta-green)',
  }[category];
}

/** Bundled geometry is only used for rail; a bus line without a feed has none. */
function mergeShapes(incoming: ShapeData[], routeIds: string[]): ShapeData[] {
  const byRoute = new Map(incoming.map((shape) => [shape.routeId, shape]));
  const out: ShapeData[] = [];
  for (const routeId of routeIds) {
    const liveShape = byRoute.get(routeId);
    if (liveShape && liveShape.paths.length > 0) {
      out.push(liveShape);
      continue;
    }
    for (const line of TRANSIT_LINES.filter((l) => l.routeId === routeId)) {
      if (line.fallbackPath?.length) {
        out.push({ routeId, paths: [line.fallbackPath], source: 'timetable' });
      }
    }
  }
  return out;
}

function defaultStopsFor(routeId: string): string {
  const line = TRANSIT_LINES.find((l) => l.routeId === routeId);
  const first = line?.dorchesterStops[0]?.id;
  if (first) return first;
  return RAIL_ROUTE_IDS.includes(routeId) ? 'place-jfk' : 'place-dudly';
}

