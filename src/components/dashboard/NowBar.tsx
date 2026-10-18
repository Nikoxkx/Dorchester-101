'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, MapPin, TriangleAlert, Utensils, WifiOff } from 'lucide-react';
import { RESOURCES } from '@/data/resources';
import { BOSTON_TZ, isOpenNow } from '@/lib/hours';
import { useLivePolling } from '@/hooks/useLivePolling';
import { useWeather } from '@/hooks/useWeather';
import { useI18n } from '@/i18n/hook';
import { ConditionIcon, tempText, useTempUnit } from '@/components/weather/shared';

/**
 * The "right now" strip. The weather chip reads the shared NWS payload
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

  const now = new Date();
  const pantries = RESOURCES.filter((r) => r.category === 'food');
  const openPantries = pantries.filter((r) => r.hours && isOpenNow(r.hours, now, BOSTON_TZ)).length;

  const current = weatherData?.current;
  const hour0 = weatherData?.hourly.find((h) => new Date(h.end).getTime() > now.getTime());
  const chipTemp = current?.tempF ?? hour0?.tempF;
  const chipKind = current?.kind ?? hour0?.kind;
  const alertCount = weatherData?.alerts.length ?? 0;

  return (
    <div
      role="region"
      aria-label="Dorchester live status bar"
      className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/90 px-3.5 py-2 text-xs"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="inline-flex items-center gap-1.5 font-heading font-bold text-[var(--color-text-primary)]">
          <span className="h-2 w-2 rounded-full bg-[var(--color-accent-green)]" aria-hidden="true" />
          Dorchester now
        </span>

        {chipTemp !== undefined && chipKind && (
          <Link
            href="/weather"
            className="inline-flex items-center gap-1 text-[var(--color-text-secondary)] hover:text-[var(--color-accent-primary)] hover:underline"
            aria-label={`${t('weather.homeTitle')}: ${tempText(chipTemp, unit, format.number)}, ${t(`weather.cond.${chipKind}` as never)}${alertCount > 0 ? ` · ${t('weather.alertsTitle')} (${format.number(alertCount)})` : ''}`}
          >
            <ConditionIcon kind={chipKind} isDay={current?.isDay ?? hour0?.isDay ?? true} className="h-3.5 w-3.5 text-[var(--color-accent-primary)]" />
            <strong className="font-mono">{tempText(chipTemp, unit, format.number)}</strong> {t(`weather.cond.${chipKind}` as never)}
            {alertCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-accent-secondary)] px-1.5 py-0.5 font-heading text-[10px] font-bold text-white">
                <TriangleAlert className="h-3 w-3" aria-hidden="true" /> {format.number(alertCount)}
              </span>
            )}
          </Link>
        )}

        <Link
          href="/food"
          className="inline-flex items-center gap-1 text-[var(--color-text-secondary)] hover:text-[var(--color-accent-primary)] hover:underline"
        >
          <Utensils className="h-3.5 w-3.5 text-[var(--color-accent-green)]" aria-hidden="true" />
          <strong>{openPantries}</strong> of {pantries.length} pantries open
        </Link>

        <Link
          href="/map"
          className="inline-flex items-center gap-1 text-[var(--color-text-secondary)] hover:text-[var(--color-accent-primary)] hover:underline"
        >
          <AlertTriangle
            className={
              mbtaAlerts > 0
                ? 'h-3.5 w-3.5 text-[var(--color-accent-amber)]'
                : 'h-3.5 w-3.5 text-[var(--color-text-muted)]'
            }
            aria-hidden="true"
          />
          <strong>{mbtaAlerts}</strong> T {mbtaAlerts === 1 ? 'alert' : 'alerts'}
        </Link>

        {offline && (
          <span className="inline-flex items-center gap-1 font-semibold text-[var(--color-accent-amber)]">
            <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />
            Offline mode
          </span>
        )}
      </div>

      <Link
        href="/map"
        className="inline-flex items-center gap-1 rounded-full bg-[var(--color-accent-primary)]/12 px-2.5 py-1 font-heading text-[11px] font-bold text-[var(--color-accent-primary)] transition-colors hover:bg-[var(--color-accent-primary)]/20"
      >
        <MapPin className="h-3 w-3" aria-hidden="true" />
        Live Map
      </Link>
    </div>
  );
}
