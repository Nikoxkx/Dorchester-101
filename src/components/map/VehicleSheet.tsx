'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ExternalLink, Gauge, Navigation, Users, X } from 'lucide-react';
import type { Arrival, LiveVehicle } from '@/lib/mbta';
import { googleDirections } from '@/lib/geo';
import { useI18n } from '@/i18n/hook';
import { useReduceMotion } from '@/stores/appStore';
import { cn } from '@/lib/utils';
import { Shield, type ShieldMode } from './Shield';
import type { MapStop } from './MapCanvas';

/**
 * Tapping a live bus or train answers three questions at once:
 *   1. "Where is it going?" — its full route is lit up on the map behind
 *      this sheet (emphasis + fit live in DorchesterMap/MapCanvas) and the
 *      stop timeline below mirrors it.
 *   2. "What's it doing?" — status at/toward its next stop, speed,
 *      crowding, and how fresh the position report is.
 *   3. "What else can I catch?" — every other upcoming departure from the
 *      stop it is serving, fetched live for that stop, so a rider who
 *      just missed (or doesn't want) this vehicle sees their options.
 *
 * Same positioning contract as PlaceSheet: inside the map frame, phone
 * bottom sheet ≤62%, ≥lg a 22rem card, z-650 above Leaflet panes.
 */

const SHIELD_MODE: Record<Arrival['mode'], ShieldMode> = { subway: 'subway', trolley: 'trolley', rail: 'rail', bus: 'bus' };

export function VehicleSheet({
  vehicle,
  stops,
  now,
  onClose,
  onSelectStop,
}: {
  vehicle: LiveVehicle | null;
  stops: MapStop[];
  now: number;
  onClose: () => void;
  onSelectStop: (stopId: string) => void;
}) {
  const { t, format } = useI18n();
  const reduceMotion = useReduceMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [departures, setDepartures] = useState<{ forStop: string; list: Arrival[]; live: boolean } | null>(null);
  const departuresLive = departures?.live ?? false;

  useEffect(() => {
    if (!vehicle) return;
    // Return focus to whatever opened the sheet (usually the vehicle marker
    // or a dock list row) so closing never strands a keyboard user.
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      window.removeEventListener('keydown', onKey);
      if (previouslyFocused && document.contains(previouslyFocused)) previouslyFocused.focus({ preventScroll: true });
    };
  }, [vehicle, onClose]);

  const stopId = vehicle?.stopId ?? null;
  const loadDepartures = useCallback(async () => {
    if (!stopId) return;
    try {
      const res = await fetch(`/api/mbta?type=arrivals&stops=${encodeURIComponent(stopId)}&perStop=8`);
      if (!res.ok) return;
      const payload = (await res.json()) as { arrivals?: Arrival[]; source?: string };
      setDepartures({ forStop: stopId, list: payload.arrivals ?? [], live: payload.source === 'mbta-live' });
    } catch {
      /* keep the last good list; the vehicle panel stays useful */
    }
  }, [stopId]);

  useEffect(() => {
    if (!stopId) return;
    // First read on the next tick, outside the effect body (same pattern
    // as the map's own polling) so no state write is synchronous here.
    const kick = window.setTimeout(() => void loadDepartures(), 0);
    const id = window.setInterval(() => {
      if (!document.hidden && navigator.onLine !== false) void loadDepartures();
    }, 30_000);
    return () => {
      window.clearTimeout(kick);
      window.clearInterval(id);
    };
  }, [stopId, loadDepartures]);

  const vehicleStop = vehicle?.stopId ? stops.find((s) => s.id === vehicle.stopId) : undefined;
  const secondsAgo = vehicle ? Math.max(0, Math.round((now - new Date(vehicle.updatedAt).getTime()) / 1000)) : 0;

  return (
    <AnimatePresence>
      {vehicle && (
        <motion.aside
          key={vehicle.id}
          role="dialog"
          aria-modal="false"
          aria-label={t('map.liveVehicles')}
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
          transition={{ type: 'spring', stiffness: 380, damping: 34, mass: 0.8 }}
          className={cn(
            'dor101-sheet pointer-events-auto absolute inset-x-0 bottom-0 z-[650] flex max-h-[62%] flex-col overflow-hidden rounded-t-2xl border border-[var(--color-border)] bg-[var(--color-bg-raised)] shadow-[0_-8px_32px_rgba(0,0,0,.28)]',
            'lg:inset-x-auto lg:bottom-3 lg:start-3 lg:max-h-[calc(100%-1.5rem)] lg:w-[22rem] lg:rounded-2xl lg:shadow-[var(--shadow-lg)]'
          )}
        >
          <div className="mx-auto mt-1.5 h-1 w-10 shrink-0 rounded-full bg-[var(--color-border-strong)] lg:hidden" aria-hidden="true" />
          <header className="sticky top-0 z-10 flex items-start gap-2 border-b border-[var(--color-border)] bg-[var(--color-bg-raised)]/95 px-3 py-2.5 backdrop-blur">
            <Shield label={vehicle.routeLabel} mode={SHIELD_MODE[vehicle.mode]} color={vehicle.routeColor} />
            <div className="min-w-0 flex-1">
              <p className="font-heading text-[10px] font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
                <span className="live-dot me-1 inline-block h-1.5 w-1.5 rounded-full align-middle" aria-hidden="true" />
                {t('map.liveVehicles')} · {t('map.updatedAgo', { seconds: String(secondsAgo) })}
              </p>
              <h2 className="font-heading text-base font-bold leading-tight">{t('map.vehicle', { id: vehicle.label || vehicle.id })}</h2>
              <p className="text-xs text-[var(--color-accent-primary)] font-semibold">{t('map.fullRoute')}</p>
            </div>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label={t('common.close')}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 [scrollbar-width:thin]">
            {vehicle.stopName && (
              <p className="text-sm">
                <span className="text-[var(--color-text-muted)]">{vehicle.stopStatus === 'at-stop' ? t('map.statusAtStop') : t('map.statusInTransit')}</span>{' '}
                <strong className="font-heading" dir="auto">{vehicle.stopName}</strong>
              </p>
            )}

            <dl className="mt-2.5 grid grid-cols-2 gap-2 text-xs">
              {vehicle.speedMph != null && (
                <div className="rounded-xl bg-[var(--color-bg-secondary)] px-2.5 py-2">
                  <dt className="flex items-center gap-1 text-[11px] text-[var(--color-text-muted)]"><Gauge className="h-3 w-3" aria-hidden="true" />{t('map.speed')}</dt>
                  <dd className="mt-0.5 font-heading text-sm font-bold tabular-nums">{format.number(vehicle.speedMph)} mph</dd>
                </div>
              )}
              {vehicle.occupancy && (
                <div className="rounded-xl bg-[var(--color-bg-secondary)] px-2.5 py-2">
                  <dt className="flex items-center gap-1 text-[11px] text-[var(--color-text-muted)]"><Users className="h-3 w-3" aria-hidden="true" />{t('map.occupancy')}</dt>
                  <dd className="mt-0.5 font-heading text-sm font-bold">
                    {t(vehicle.occupancy === 'many-seats' ? 'map.occupancy.manySeats' : vehicle.occupancy === 'few-seats' ? 'map.occupancy.fewSeats' : 'map.occupancy.full')}
                  </dd>
                </div>
              )}
            </dl>

            {(vehicleStop ?? vehicle) && (
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={googleDirections([vehicleStop?.lat ?? vehicle.lat, vehicleStop?.lng ?? vehicle.lng], 'transit')}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-accent-primary)] px-3 py-1.5 font-heading text-xs font-bold text-white transition-transform active:scale-95"
                >
                  <Navigation className="h-3.5 w-3.5" aria-hidden="true" /> {t('common.directions')}
                </a>
                {vehicle.stopId && (
                  <a
                    href={`https://www.mbta.com/stops/${vehicle.stopId}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border-strong)] px-3 py-1.5 font-heading text-xs font-bold text-[var(--color-accent-primary)]"
                  >
                    MBTA <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                )}
              </div>
            )}

            {vehicle.stopId && (
              <section className="mt-4" aria-label={t('map.moreAtStop')}>
                <h3 className="font-heading text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
                  {t('map.moreAtStop')}{vehicle.stopName ? <> — <span dir="auto">{vehicle.stopName}</span></> : null}
                </h3>
                {departures === null || departures.forStop !== vehicle.stopId ? (
                  <div className="mt-2 space-y-1.5" aria-busy="true">
                    {[0, 1, 2].map((i) => <div key={i} className="h-9 animate-pulse rounded-xl bg-[var(--color-bg-tertiary)]" />)}
                  </div>
                ) : departures.list.length === 0 ? (
                  <p className="mt-2 text-xs leading-snug text-[var(--color-text-secondary)]">{t('map.noDepartures')}</p>
                ) : (
                  <ul className="mt-2 space-y-1.5">
                    {departures.list.slice(0, 6).map((a, i) => {
                      const mins = Math.max(0, Math.round((new Date(a.arrivalAt).getTime() - now) / 60_000));
                      const isThis = a.vehicleId != null && a.vehicleId === vehicle.id;
                      return (
                        <li key={`${a.routeId}-${a.arrivalAt}-${i}`}>
                          <button
                            type="button"
                            onClick={() => onSelectStop(a.stopId)}
                            className={cn(
                              'flex w-full items-center gap-2 rounded-xl border px-2.5 py-2 text-start transition-colors hover:border-[var(--color-accent-primary)]',
                              isThis ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10' : 'border-[var(--color-border)] bg-[var(--color-bg-primary)]'
                            )}
                          >
                            <Shield label={a.routeLabel} mode={SHIELD_MODE[a.mode]} color={a.routeColor} />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate font-heading text-[13px] font-bold leading-tight" dir="auto">{a.headsign || a.direction}</span>
                              <span className="block text-[11px] text-[var(--color-text-muted)]">
                                {format.time(a.arrivalAt)}{departuresLive ? '' : ` · ${t('map.scheduleData')}`}
                                {isThis && <span className="ms-1.5 rounded-full bg-[var(--color-accent-primary)] px-1.5 py-px font-heading text-[9px] font-extrabold uppercase text-white">{t('map.thisVehicle')}</span>}
                              </span>
                            </span>
                            <span className="shrink-0 text-end font-heading text-sm font-extrabold tabular-nums">
                              {mins <= 0 ? t('weather.now') : t('map.arrivalMinutes', { count: mins })}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            )}

            {stops.length > 0 && (
              <section className="mt-4" aria-label={t('map.routeStops')}>
                <h3 className="font-heading text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">{t('map.routeStops')}</h3>
                <ol className="relative mt-2 space-y-0.5 before:absolute before:bottom-2 before:start-[7px] before:top-2 before:w-0.5 before:rounded before:bg-[var(--color-border-strong)]">
                  {stops.map((stop) => {
                    const isVehicleStop = stop.id === vehicle.stopId;
                    return (
                      <li key={stop.id}>
                        <button
                          type="button"
                          onClick={() => onSelectStop(stop.id)}
                          className={cn(
                            'relative flex w-full items-center gap-2.5 rounded-lg px-1.5 py-1 text-start text-xs transition-colors hover:bg-[var(--color-bg-tertiary)]',
                            isVehicleStop && 'bg-[var(--color-accent-primary)]/10 font-bold'
                          )}
                        >
                          <span className={cn('relative z-10 h-2 w-2 shrink-0 rounded-full ring-2 ring-[var(--color-bg-raised)]', isVehicleStop && 'live-dot h-2.5 w-2.5')} style={{ background: stop.color }} aria-hidden="true" />
                          <span className="min-w-0 flex-1 truncate" dir="auto">{stop.name}</span>
                          {isVehicleStop && <span className="shrink-0 text-[10px] font-extrabold uppercase text-[var(--color-accent-primary)]">{t('weather.now')}</span>}
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </section>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
