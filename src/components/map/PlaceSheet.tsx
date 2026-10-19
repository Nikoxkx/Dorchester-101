'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Accessibility, Bus, Clock, ExternalLink, Footprints, ImageOff, MapPin, Navigation, Phone, Ticket, TrainFront, X } from 'lucide-react';
import { RESOURCES } from '@/data/resources';
import { TRANSIT_LINES, DORCHESTER_BUS_ROUTES, type TransitStopRef } from '@/data/transit';
import { STATION_PHOTOS } from '@/data/stationPhotos';
import { BOSTON_TZ, formatWindow, statusFor, type OpenStatus } from '@/lib/hours';
import { appleDirections, formatDistance, googleDirections, haversineMeters, walkMinutes } from '@/lib/geo';
import type { Arrival } from '@/lib/mbta';
import { useI18n } from '@/i18n/hook';
import { useReduceMotion } from '@/stores/appStore';
import { Shield, type ShieldMode } from './Shield';
import { CategoryPin } from './CategoryPin';
import { SiteImagery } from '@/components/projects/SiteImagery';
import { SourceMark } from '@/components/sources/SourceMark';
import { cn } from '@/lib/utils';

/**
 * The "everything about this place" sheet.
 *
 * One component serves both a transit stop and a directory listing so a rider
 * gets the same layout wherever they tap: photo → what it is → how to get there
 * → when the next bus/train comes → what it costs → who to call.
 *
 * Positioning contract (this is what stops it colliding with anything):
 *  - It is rendered INSIDE the map frame (`position:relative` parent) as an
 *    absolutely-positioned layer, so it can never cover the page header, the
 *    sidebar, the toolbar row above the map or the departures column beside it.
 *  - On phones it is a bottom sheet capped at 62% of the frame height; on
 *    ≥lg screens it is a 22rem card pinned bottom-start with a 0.75rem inset.
 *  - Leaflet's controls live in `.leaflet-bottom`; we hide the attribution
 *    behind the sheet only while the sheet is open (the attribution is repeated
 *    in the sheet footer so nothing is lost).
 *  - z-index 650 sits above Leaflet panes (≤600) and below the app header (700+).
 */

const STATUS_KEYS: Record<OpenStatus['state'], 'common.open' | 'common.closingSoon' | 'common.closed'> = {
  open: 'common.open',
  'closing-soon': 'common.closingSoon',
  closed: 'common.closed',
};
const SHIELD_MODE: Record<Arrival['mode'], ShieldMode> = { subway: 'subway', trolley: 'trolley', rail: 'rail', bus: 'bus' };

export type SheetTarget = { kind: 'stop'; id: string } | { kind: 'place'; id: string } | null;

export function PlaceSheet({
  target,
  arrivals,
  arrivalsLive,
  userPosition,
  onClose,
  onSelectStop,
  onLocate,
}: {
  target: SheetTarget;
  arrivals: Arrival[];
  arrivalsLive: boolean;
  userPosition: [number, number] | null;
  onClose: () => void;
  onSelectStop: (stopId: string) => void;
  onLocate: () => void;
}) {
  const reduceMotion = useReduceMotion();
  const { t } = useI18n();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!target) return;
    // Remember what opened the sheet so closing returns focus there — without
    // this a keyboard user is dropped at the top of the page after Escape.
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      window.removeEventListener('keydown', onKey);
      if (previouslyFocused && document.contains(previouslyFocused)) previouslyFocused.focus({ preventScroll: true });
    };
  }, [target, onClose]);

  return (
    <AnimatePresence>
      {target && (
        <motion.aside
          key={`${target.kind}-${target.id}`}
          role="dialog"
          aria-modal="false"
          aria-label={t('map.placeDetails')}
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
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:thin]">
            {target.kind === 'stop' ? (
              <StopBody id={target.id} arrivals={arrivals} live={arrivalsLive} userPosition={userPosition} onClose={onClose} onLocate={onLocate} closeRef={closeRef} />
            ) : (
              <PlaceBody id={target.id} userPosition={userPosition} onClose={onClose} onSelectStop={onSelectStop} onLocate={onLocate} closeRef={closeRef} />
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

/* ───────────────────────────── shared bits ───────────────────────────── */

function SheetHeader({ eyebrow, title, onClose, closeRef, badge }: { eyebrow: React.ReactNode; title: string; onClose: () => void; closeRef: React.RefObject<HTMLButtonElement | null>; badge?: React.ReactNode }) {
  const { t } = useI18n();
  return (
    <header className="sticky top-0 z-10 flex items-start gap-2 border-b border-[var(--color-border)] bg-[var(--color-bg-raised)]/95 px-3 py-2.5 backdrop-blur">
      {badge}
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-heading font-bold uppercase tracking-wide text-[var(--color-text-muted)]">{eyebrow}</p>
        <h2 className="font-heading text-base font-bold leading-tight">{title}</h2>
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
  );
}

function Photo({ stopId, lat, lng, label }: { stopId?: string; lat: number; lng: number; label: string }) {
  const { t } = useI18n();
  const photo = stopId ? STATION_PHOTOS[stopId] : undefined;
  if (photo) {
    return (
      <figure className="relative">
        <div className="relative aspect-[16/9] w-full bg-[var(--color-bg-tertiary)]">
          <Image src={photo.src} alt={photo.caption} fill sizes="(min-width:1024px) 22rem, 100vw" className="object-cover" />
        </div>
        <figcaption className="flex items-center justify-between gap-2 px-3 py-1.5 text-[10px] text-[var(--color-text-muted)]">
          <span className="truncate">{photo.caption}</span>
          <a href={`https://commons.wikimedia.org/wiki/File:${photo.commonsFile}`} target="_blank" rel="noreferrer noopener" className="inline-flex shrink-0 items-center gap-1 font-heading font-semibold hover:underline">
            <SourceMark id="wikimedia" size="xs" asSpan /> Commons
          </a>
        </figcaption>
      </figure>
    );
  }
  return (
    <div className="px-3 pt-3">
      <SiteImagery lat={lat} lng={lng} label={label} />
      <p className="mt-1 flex items-center gap-1 text-[10px] text-[var(--color-text-muted)]">
        <ImageOff className="h-3 w-3" aria-hidden="true" /> {t('map.noPhotoNote')}
      </p>
    </div>
  );
}

function GetThere({ dest, userPosition, onLocate }: { dest: [number, number]; userPosition: [number, number] | null; onLocate: () => void }) {
  const { t, meta } = useI18n();
  const [resolving, setResolving] = useState<'walking' | 'transit' | null>(null);
  const meters = userPosition ? haversineMeters(userPosition, dest) : null;

  /**
   * Opens Google Maps with a real origin → destination route. If we do not yet
   * know where the rider is, ask the browser once (≤ 8 s); if they decline or it
   * fails, Google Maps still opens with the destination and "Your location" as
   * the origin, which the Maps app resolves itself.
   */
  const go = (mode: 'walking' | 'transit') => {
    const open = (origin: [number, number] | null) => {
      const url = googleDirections(dest, mode, origin);
      window.open(url, '_blank', 'noopener,noreferrer');
    };
    if (userPosition) return open(userPosition);
    if (!('geolocation' in navigator)) return open(null);
    setResolving(mode);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setResolving(null);
        onLocate();
        open([pos.coords.latitude, pos.coords.longitude]);
      },
      () => {
        setResolving(null);
        open(null);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  };

  return (
    <section className="px-3 pt-3">
      <h3 className="flex items-center gap-1.5 font-heading text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
        <Navigation className="h-3.5 w-3.5" aria-hidden="true" /> {t('map.getThere')}
      </h3>
      {meters !== null ? (
        <p className="mt-1 text-sm">
          <Footprints className="me-1 inline h-4 w-4 align-[-3px] text-[var(--color-accent-primary)]" aria-hidden="true" />
          {t('map.walkFromYou', { minutes: String(walkMinutes(meters)), distance: formatDistance(meters, meta.intlLocale) })}
        </p>
      ) : (
        <button type="button" onClick={onLocate} className="mt-1 text-sm font-heading font-semibold text-[var(--color-accent-primary)] underline decoration-dotted underline-offset-2">
          {t('map.useLocationWalk')}
        </button>
      )}
      <div className="mt-2 grid grid-cols-2 gap-1.5">
        <button
          type="button"
          onClick={() => go('transit')}
          disabled={resolving !== null}
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[var(--color-accent-primary)] px-3 py-2 font-heading text-xs font-bold text-white disabled:opacity-70"
        >
          <Bus className="h-3.5 w-3.5" aria-hidden="true" /> {resolving === 'transit' ? t('map.findingYou') : t('map.routeTransit')}
        </button>
        <button
          type="button"
          onClick={() => go('walking')}
          disabled={resolving !== null}
          className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[var(--color-border)] px-3 py-2 font-heading text-xs font-bold hover:border-[var(--color-accent-primary)] disabled:opacity-70"
        >
          <Footprints className="h-3.5 w-3.5" aria-hidden="true" /> {resolving === 'walking' ? t('map.findingYou') : t('map.routeWalking')}
        </button>
      </div>
      <p className="mt-1 text-[10px] leading-snug text-[var(--color-text-muted)]">
        {t('map.directionsNote')}{' '}
        <a href={appleDirections(dest, 'transit')} className="underline decoration-dotted underline-offset-2">{t('map.appleMapsInstead')}</a>.
      </p>
    </section>
  );
}

function Departures({ arrivals, live, stopId }: { arrivals: Arrival[]; live: boolean; stopId?: string }) {
  const { t, format } = useI18n();
  const rows = useMemo(
    () =>
      [...arrivals]
        .filter((a) => !stopId || a.stopId === stopId)
        .sort((a, b) => new Date(a.arrivalAt).getTime() - new Date(b.arrivalAt).getTime())
        .slice(0, 6)
        .map((a) => ({ ...a, minutes: format.minutesAway(a.arrivalAt), clock: format.time(a.arrivalAt) })),
    [arrivals, stopId, format]
  );
  return (
    <section className="px-3 pt-3">
      <h3 className="flex items-center justify-between font-heading text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
        <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" aria-hidden="true" /> {t('map.departures')}</span>
        <span className={cn('inline-flex items-center gap-1 text-[10px] normal-case tracking-normal', live ? 'text-[var(--color-accent-green)]' : '')}>
          <span className={cn('h-1.5 w-1.5 rounded-full', live ? 'bg-[var(--color-accent-green)] animate-pulse' : 'bg-[var(--color-text-muted)]')} aria-hidden="true" />
          {live ? t('map.live') : t('map.schedule')}
        </span>
      </h3>
      {rows.length === 0 ? (
        <p className="mt-1.5 rounded-lg border border-dashed border-[var(--color-border)] px-2.5 py-2 text-xs text-[var(--color-text-secondary)]">{t('map.noDepartures')}</p>
      ) : (
        <ul className="mt-1.5 space-y-1">
          {rows.map((d) => (
            <li key={`${d.stopId}-${d.routeId}-${d.arrivalAt}`} className="flex items-center gap-2 rounded-lg border border-[var(--color-border)]/70 bg-[var(--color-bg-secondary)]/70 px-2 py-1.5">
              <Shield label={d.routeLabel} mode={SHIELD_MODE[d.mode]} color={d.routeColor ? `#${d.routeColor.replace('#', '')}` : undefined} ink={d.routeColor ? undefined : '#000'} />
              <span className="min-w-0 flex-1 truncate text-xs" dir="auto">{d.headsign || d.direction}</span>
              <span className="text-right">
                <span className="block font-heading text-sm font-bold leading-none tabular-nums">{d.minutes <= 0 ? t('map.due') : t('map.arrivalMinutes', { count: d.minutes })}</span>
                <span className="block text-[10px] leading-none text-[var(--color-text-muted)] tabular-nums">{d.clock}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Fare({ mode }: { mode: 'subway' | 'bus' | 'commuter-rail' | 'mixed' }) {
  const { t, format } = useI18n();
  const rows =
    mode === 'bus'
      ? [{ label: t('map.fareLocalBus'), price: 1.7 }, { label: t('map.fareReduced'), price: 0.85 }]
      : mode === 'commuter-rail'
        ? [{ label: t('map.fareFairmount'), price: 2.4 }, { label: t('map.fareReduced'), price: 1.1 }]
        : [{ label: t('map.fareSubway'), price: 2.4 }, { label: t('map.fareReduced'), price: 1.1 }];
  return (
    <section className="px-3 pt-3">
      <h3 className="flex items-center gap-1.5 font-heading text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
        <Ticket className="h-3.5 w-3.5" aria-hidden="true" /> {t('map.fare')}
      </h3>
      <dl className="mt-1.5 grid grid-cols-2 gap-1.5 text-xs">
        {rows.map((r) => (
          <div key={r.label} className="rounded-lg bg-[var(--color-bg-tertiary)] px-2 py-1.5">
            <dt className="text-[10px] text-[var(--color-text-muted)]">{r.label}</dt>
            <dd className="font-heading text-sm font-bold">{format.currency(r.price, { cents: true })}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-1 text-[10px] leading-snug text-[var(--color-text-muted)]">
        {t('map.fareNote')}{' '}
        <Link href="/tools" className="underline decoration-dotted underline-offset-2">{t('map.fareQualify')}</Link>.
      </p>
    </section>
  );
}

function Sources({ live, extra }: { live: boolean; extra?: React.ReactNode }) {
  const { t } = useI18n();
  return (
    <footer className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-[var(--color-border)] px-3 py-2 text-[10px] text-[var(--color-text-muted)]">
      <SourceMark id="mbta" size="xs" withName />
      {live ? t('map.sourceLive') : t('map.sourceTimetable')}
      {extra}
      <span className="ms-auto">{t('map.sourceCredits')}</span>
    </footer>
  );
}

/* ───────────────────────────── stop ───────────────────────────── */

function StopBody({ id, arrivals, live, userPosition, onClose, onLocate, closeRef }: { id: string; arrivals: Arrival[]; live: boolean; userPosition: [number, number] | null; onClose: () => void; onLocate: () => void; closeRef: React.RefObject<HTMLButtonElement | null> }) {
  const { t } = useI18n();
  const owners = TRANSIT_LINES.filter((l) => l.dorchesterStops.some((s) => s.id === id));
  const stop: TransitStopRef | undefined = owners[0]?.dorchesterStops.find((s) => s.id === id);
  if (!stop) return null;
  const fareMode = owners.length > 1 ? 'mixed' : owners[0].fare.mode;
  const nearby = RESOURCES.map((r) => ({ r, m: haversineMeters([stop.lat, stop.lng], [r.lat, r.lng]) })).filter((x) => x.m < 650).sort((a, b) => a.m - b.m).slice(0, 4);

  return (
    <>
      <SheetHeader
        eyebrow={owners.map((o) => o.name).join(' · ')}
        title={stop.name}
        onClose={onClose}
        closeRef={closeRef}
        badge={<span className="mt-0.5 flex gap-1">{owners.map((o) => <Shield key={o.id} label={o.label} mode={o.mode} color={`#${o.color.replace('#', '')}`} ink={`#${o.textColor.replace('#', '')}`} />)}</span>}
      />
      <Photo stopId={id} lat={stop.lat} lng={stop.lng} label={stop.name} />
      <section className="px-3 pt-3 text-sm">
        <ul className="grid grid-cols-2 gap-1.5 text-xs">
          <li className="flex items-center gap-1.5 rounded-lg bg-[var(--color-bg-tertiary)] px-2 py-1.5">
            <Accessibility className={cn('h-4 w-4', stop.accessible ? 'text-[var(--color-accent-green)]' : 'text-[var(--color-text-muted)]')} aria-hidden="true" />
            {stop.accessible ? t('map.wheelchair') : t('map.wheelchairUnknown')}
          </li>
          <li className="flex items-center gap-1.5 rounded-lg bg-[var(--color-bg-tertiary)] px-2 py-1.5">
            <TrainFront className="h-4 w-4 text-[var(--color-text-muted)]" aria-hidden="true" />
            {owners[0].firstDeparts}–{owners[0].lastDeparts}
          </li>
        </ul>
        {stop.connects && stop.connects.length > 0 && (
          <p className="mt-2 text-xs text-[var(--color-text-secondary)]"><strong className="font-heading">{t('map.connections')}:</strong> {stop.connects.join(' · ')}</p>
        )}
      </section>
      <Departures arrivals={arrivals} live={live} stopId={id} />
      <GetThere dest={[stop.lat, stop.lng]} userPosition={userPosition} onLocate={onLocate} />
      <Fare mode={fareMode} />
      {nearby.length > 0 && (
        <section className="px-3 pt-3">
          <h3 className="flex items-center gap-1.5 font-heading text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> {t('map.shortWalk')}
          </h3>
          <ul className="mt-1.5 space-y-1">
            {nearby.map(({ r, m }) => (
              <li key={r.id}>
                <Link href={`/map?place=${r.id}`} className="flex items-center gap-2 rounded-lg px-1.5 py-1 text-xs no-underline hover:bg-[var(--color-bg-tertiary)]">
                  <CategoryPin category={r.category} size={16} />
                  <span className="min-w-0 flex-1 truncate">{r.name}</span>
                  <span className="text-[10px] text-[var(--color-text-muted)]">{t('map.walkMinutes', { minutes: String(walkMinutes(m)) })}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      <div className="px-3 pt-3">
        <a href={`https://www.mbta.com/stops/${id}`} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 font-heading text-xs font-bold text-[var(--color-accent-primary)] underline decoration-dotted underline-offset-2">
          {t('map.stationPage')} <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </a>
      </div>
      <Sources live={live} />
    </>
  );
}

/* ───────────────────────────── place ───────────────────────────── */

function PlaceBody({ id, userPosition, onClose, onSelectStop, onLocate, closeRef }: { id: string; userPosition: [number, number] | null; onClose: () => void; onSelectStop: (id: string) => void; onLocate: () => void; closeRef: React.RefObject<HTMLButtonElement | null> }) {
  const { t, format, pickContent } = useI18n();
  const r = RESOURCES.find((x) => x.id === id);
  if (!r) return null;
  const status = r.hours ? statusFor(r.hours, new Date(), BOSTON_TZ) : null;
  const today = r.hours ? r.hours[(new Date().getDay() + 6) % 7] : [];
  const summary = pickContent(r.summary);
  const allStops = TRANSIT_LINES.flatMap((l) => l.dorchesterStops.map((s) => ({ ...s, line: l })));
  const nearestStops = allStops.map((s) => ({ s, m: haversineMeters([r.lat, r.lng], [s.lat, s.lng]) })).sort((a, b) => a.m - b.m).slice(0, 2);
  const buses = DORCHESTER_BUS_ROUTES.filter((b) => r.transit && new RegExp(`\\b${b.id}\\b`).test(r.transit)).slice(0, 5);

  return (
    <>
      <SheetHeader eyebrow={`${t(`map.${r.category}` as 'map.food')} · ${r.neighborhood}`} title={r.name} onClose={onClose} closeRef={closeRef} badge={<CategoryPin category={r.category} size={26} />} />
      <Photo lat={r.lat} lng={r.lng} label={r.address.split(',')[0]} />
      <section className="px-3 pt-3 text-sm">
        {summary.value && <p className="text-[var(--color-text-secondary)]" dir="auto">{summary.value}</p>}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {status && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] px-2 py-0.5 font-heading text-[11px] font-bold">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: status.state === 'open' ? 'var(--color-accent-green)' : status.state === 'closing-soon' ? 'var(--color-accent-amber)' : 'var(--color-text-muted)' }} aria-hidden="true" />
              {t(STATUS_KEYS[status.state])}
              {status.state !== 'closed' && 'closesAt' in status ? ` · ${t('map.untilTime', { time: format.time(new Date(status.closesAt)) })}` : 'opensAt' in status ? ` · ${t('map.opensTime', { time: format.time(new Date(status.opensAt)) })}` : ''}
            </span>
          )}
          {today.length > 0 && <span className="text-[11px] text-[var(--color-text-muted)]">{t('map.todayHours', { hours: today.map((w) => formatWindow(w)).join(', ') })}</span>}
          {r.hoursNote && <span className="text-[11px] text-[var(--color-text-muted)]">{r.hoursNote}</span>}
        </div>
        <p className="mt-2 flex items-start gap-1.5 text-xs"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-text-muted)]" aria-hidden="true" />{r.address}</p>
        {r.phone && (
          <a href={`tel:${r.phone.replace(/[^\d+]/g, '')}`} className="mt-1 inline-flex items-center gap-1.5 font-heading text-xs font-bold text-[var(--color-accent-primary)] underline decoration-dotted underline-offset-2">
            <Phone className="h-3.5 w-3.5" aria-hidden="true" /> {r.phone}
          </a>
        )}
        <ul className="mt-2 flex flex-wrap gap-1 text-[10px]">
          {r.accessibility?.stepFree && <li className="rounded-full bg-[var(--color-bg-tertiary)] px-2 py-0.5">♿ {t('map.wheelchair')}</li>}
          {r.acceptsEbt && <li className="rounded-full bg-[var(--color-bg-tertiary)] px-2 py-0.5">{t('map.ebtAccepted')}</li>}
          {r.requiresId === false && <li className="rounded-full bg-[var(--color-bg-tertiary)] px-2 py-0.5">{t('clothing.noId')}</li>}
          {r.languages?.slice(0, 4).map((l) => <li key={l} className="rounded-full bg-[var(--color-bg-tertiary)] px-2 py-0.5">{l}</li>)}
        </ul>
        {r.eligibility && <p className="mt-2 text-xs text-[var(--color-text-secondary)]"><strong className="font-heading">{t('common.eligibility')}:</strong> {r.eligibility}</p>}
        {r.services.length > 0 && (
          <p className="mt-1 text-xs text-[var(--color-text-secondary)]"><strong className="font-heading">{t('map.services')}:</strong> {r.services.slice(0, 6).join(' · ')}</p>
        )}
      </section>

      <section className="px-3 pt-3">
        <h3 className="flex items-center gap-1.5 font-heading text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
          <TrainFront className="h-3.5 w-3.5" aria-hidden="true" /> {t('map.nearestTransit')}
        </h3>
        <ul className="mt-1.5 space-y-1">
          {nearestStops.map(({ s, m }) => (
            <li key={s.id}>
              <button type="button" onClick={() => onSelectStop(s.id)} className="flex w-full items-center gap-2 rounded-lg border border-[var(--color-border)]/70 px-2 py-1.5 text-left text-xs transition-colors hover:border-[var(--color-accent-primary)]">
                <Shield label={s.line.label} mode={s.line.mode} color={`#${s.line.color.replace('#', '')}`} ink={`#${s.line.textColor.replace('#', '')}`} />
                <span className="min-w-0 flex-1 truncate"><span className="font-heading font-semibold">{s.name}</span> <span className="text-[var(--color-text-muted)]">· {s.line.name}</span></span>
                <span className="shrink-0 font-heading font-bold tabular-nums">{t('map.walkMinutes', { minutes: String(walkMinutes(m)) })}</span>
              </button>
            </li>
          ))}
        </ul>
        {buses.length > 0 && (
          <p className="mt-1.5 flex flex-wrap items-center gap-1 text-xs text-[var(--color-text-secondary)]">
            <Bus className="h-3.5 w-3.5 text-[var(--color-text-muted)]" aria-hidden="true" /> {t('map.buses')}:
            {buses.map((b) => (
              <button key={b.id} type="button" onClick={() => onSelectStop(`route:${b.id}`)} className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] px-1.5 py-0.5 font-heading text-[10px] font-bold hover:border-[var(--color-accent-primary)]" title={b.longName}>
                {b.name} <span className="font-normal text-[var(--color-text-muted)]">{t('map.headwayValue', { minutes: String(b.headwayMinutes) })}</span>
              </button>
            ))}
          </p>
        )}
        {r.transit && <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">{r.transit}</p>}
        <p className="mt-1 text-[10px] text-[var(--color-text-muted)]">{t('map.transitNote')}</p>
      </section>

      <GetThere dest={[r.lat, r.lng]} userPosition={userPosition} onLocate={onLocate} />
      <Fare mode={nearestStops[0]?.s.line.fare.mode ?? 'subway'} />

      <div className="flex flex-wrap items-center gap-2 px-3 pt-3">
        <Link href={r.detailHref ?? `/resources?place=${r.id}`} className="inline-flex items-center gap-1 rounded-full bg-[var(--color-accent-primary)] px-3 py-1.5 font-heading text-[11px] font-bold text-white no-underline">
          {t('map.openRecord')}
        </Link>
        {r.website && (
          <a href={r.website} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 font-heading text-xs font-bold text-[var(--color-accent-primary)] underline decoration-dotted underline-offset-2">
            {t('common.website')} <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        )}
      </div>
      <Sources
        live={false}
        extra={
          <span className="inline-flex items-center gap-1">
            · <SourceMark id="dor101" size="xs" /> {t('resources.checkedOn', { date: r.verification.checkedOn })}
            {r.verification.status === 'needs-review' && <span className="text-[var(--color-accent-amber)]"> ({t('directory.needsReview')})</span>}
          </span>
        }
      />
    </>
  );
}
