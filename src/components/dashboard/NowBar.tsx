'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, MapPin, TriangleAlert, Utensils, WifiOff } from 'lucide-react';
import { RESOURCES } from '@/data/resources';
import { BOSTON_TZ, isOpenNow } from '@/lib/hours';
import { useLivePolling } from '@/hooks/useLivePolling';
import { useNow } from '@/hooks/useNow';
import { useWeather } from '@/hooks/useWeather';
import { useI18n } from '@/i18n/hook';
import { ConditionIcon, tempText, useTempUnit } from '@/components/weather/shared';

/**
 * The "right now" strip — built as an ordinary site card on purpose: a
 * `section` with the standard card tokens, so the resident's surface
 * (glass/frost/tinted/aurora), palette and homepage card style dress it
 * exactly like every other section, and its wash is the site's own
 * aurora recipe rather than a private glow. The weather chip reads the
 * shared NWS payload
 * (`useWeather`) — the same source as the homepage panel, the storm banner
 * and the weather page — so the strip can never show a different number
 * than the rest of the page. (It used to call Open-Meteo on its own with
 * hardcoded English labels.) When the NWS has an active warning for
 * Dorchester the chip gains a warning badge linking to it.
 */
export function NowBar() {
  const { t, format } = useI18n();
  const { data: weatherData } = useWeather();
  const [unit] = useTempUnit();
  const [mbtaAlerts, setMbtaAlerts] = useState<number>(0);
  const [offline, setOffline] = useState<boolean>(false);

  const load = useCallback(async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setOffline(true);
      return;
    }
    setOffline(false);
    try {
      const res = await fetch('/api/mbta');
      if (res.ok) {
        const json = (await res.json()) as { alerts?: unknown[] };
        setMbtaAlerts(Array.isArray(json.alerts) ? json.alerts.length : 0);
      }
    } catch {
      /* the strip keeps its last count; weather polling is unaffected */
    }
  }, []);

  useLivePolling(load, { minMs: 5 * 60_000 });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onOnline = () => setOffline(false);
    const onOffline = () => setOffline(true);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const now = new Date(useNow(60_000));
  const pantries = RESOURCES.filter((r) => r.category === 'food');
  const openPantries = pantries.filter((r) => r.hours && isOpenNow(r.hours, now, BOSTON_TZ)).length;

  const current = weatherData?.current;
  const hour0 = weatherData?.hourly.find((h) => new Date(h.end).getTime() > now.getTime());
  const chipTemp = current?.tempF ?? hour0?.tempF;
  const chipKind = current?.kind ?? hour0?.kind;
  const alertCount = weatherData?.alerts.length ?? 0;

  const bostonClock = new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: BOSTON_TZ,
  }).format(now);

  const statLink =
    'group flex min-w-0 items-center gap-2.5 rounded-2xl px-2.5 py-1.5 transition-colors hover:bg-[var(--color-bg-tertiary)]';

  return (
    <section
      aria-label={t('dashboard.nowTitle')}
      className="dor101-glass relative isolate overflow-hidden rounded-[1.6rem] border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 py-2.5 shadow-[var(--shadow)] sm:px-4"
    >
      {/* The site's own aurora wash (shared recipe) plus the bar's
          signature diagonal sheen — both mixed from the same palette
          accents, so recoloring the site recolors this bar in the same
          instant. It must never wear a private color story while the
          rest of the page wears the resident's palette. */}
      <div aria-hidden="true" className="dor101-aurora-wash pointer-events-none absolute inset-0 -z-10" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(115deg, color-mix(in srgb, var(--color-accent-primary) 20%, transparent), transparent 52%, color-mix(in srgb, var(--color-accent-secondary) 14%, transparent))',
        }}
      />
      <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
        <span className="flex items-center gap-2.5 pe-1">
          <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-accent-green)] opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--color-accent-green)]" />
          </span>
          <span className="leading-tight">
            <span className="block font-heading text-[13px] font-extrabold tracking-tight text-[var(--color-text-primary)]">{t('dashboard.nowTitle')}</span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">{bostonClock} · Boston</span>
          </span>
        </span>

        <span className="mx-1 hidden h-8 w-px bg-[var(--color-border-strong)]/60 sm:block" aria-hidden="true" />

        {chipTemp !== undefined && chipKind && (
          <Link
            href="/weather"
            className={statLink}
            aria-label={`${t('weather.homeTitle')}: ${tempText(chipTemp, unit, format.number)}, ${t(`weather.cond.${chipKind}` as never)}${alertCount > 0 ? ` · ${t('weather.alertsTitle')} (${format.number(alertCount)})` : ''}`}
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-white shadow-sm" style={{ background: 'linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))' }} aria-hidden="true">
              <ConditionIcon kind={chipKind} isDay={current?.isDay ?? hour0?.isDay ?? true} className="h-5 w-5" />
            </span>
            <span className="leading-tight">
              <span className="block whitespace-nowrap font-heading text-[15px] font-extrabold text-[var(--color-text-primary)]">
                {tempText(chipTemp, unit, format.number)}
                {alertCount > 0 && (
                  <span className="ms-1.5 inline-flex translate-y-[-1px] items-center gap-0.5 rounded-full bg-[var(--color-accent-secondary)] px-1.5 py-0.5 align-middle font-heading text-[10px] font-bold text-white">
                    <TriangleAlert className="h-3 w-3" aria-hidden="true" /> {format.number(alertCount)}
                  </span>
                )}
              </span>
              <span className="block whitespace-nowrap text-[11px] font-medium text-[var(--color-text-secondary)]">{t(`weather.cond.${chipKind}` as never)}</span>
            </span>
          </Link>
        )}

        <Link href="/food" className={statLink}>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--color-accent-green)]/15 text-[var(--color-accent-green)]" aria-hidden="true">
            <Utensils className="h-4.5 w-4.5" />
          </span>
          <span className="leading-tight">
            <span className="block whitespace-nowrap font-heading text-[15px] font-extrabold text-[var(--color-text-primary)]">
              {format.number(openPantries)}<span className="text-[var(--color-text-muted)]"> / {format.number(pantries.length)}</span>
            </span>
            <span className="block whitespace-nowrap text-[11px] font-medium text-[var(--color-text-secondary)]">{t('dashboard.pantriesLabel')}</span>
          </span>
        </Link>

        <Link href="/map" className={statLink}>
          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${mbtaAlerts > 0 ? 'bg-[var(--color-accent-amber)]/20 text-[var(--color-accent-amber)]' : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]'}`} aria-hidden="true">
            <AlertTriangle className="h-4.5 w-4.5" />
          </span>
          <span className="leading-tight">
            <span className="block whitespace-nowrap font-heading text-[15px] font-extrabold text-[var(--color-text-primary)]">{format.number(mbtaAlerts)}</span>
            <span className="block whitespace-nowrap text-[11px] font-medium text-[var(--color-text-secondary)]">{t('dashboard.tAlerts')}</span>
          </span>
        </Link>

        {offline && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-accent-amber)]/15 px-2.5 py-1.5 text-xs font-bold text-[var(--color-accent-amber)]">
            <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />
            {t('offline.title')}
          </span>
        )}

        <Link
          href="/map"
          className="ms-auto inline-flex items-center gap-1.5 rounded-full bg-[linear-gradient(135deg,var(--color-accent-primary),var(--color-accent-secondary))] px-4 py-2.5 font-heading text-[13px] font-extrabold text-white shadow-[var(--shadow)] transition-transform hover:scale-[1.03] active:scale-95"
        >
          <MapPin className="h-4 w-4" aria-hidden="true" />
          {t('dashboard.liveNowMap')}
        </Link>
      </div>
    </section>
  );
}
