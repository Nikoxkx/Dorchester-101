'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, CloudSun, MapPin, Utensils, WifiOff } from 'lucide-react';
import { RESOURCES } from '@/data/resources';
import { BOSTON_TZ, isOpenNow } from '@/lib/hours';
import { useLivePolling } from '@/hooks/useLivePolling';

interface WeatherState {
  tempF: number;
  label: string;
}

function weatherCodeLabel(code: number): string {
  if (code === 0) return 'Clear';
  if (code <= 3) return 'Partly cloudy';
  if (code <= 48) return 'Foggy';
  if (code <= 67) return 'Rain';
  if (code <= 77) return 'Snow';
  if (code <= 82) return 'Showers';
  return 'Stormy';
}

export function NowBar() {
  const [weather, setWeather] = useState<WeatherState | null>(null);
  const [mbtaAlerts, setMbtaAlerts] = useState<number>(0);
  const [offline, setOffline] = useState<boolean>(false);

  const load = useCallback(async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setOffline(true);
      return;
    }
    setOffline(false);

    const [weatherRes, mbtaRes] = await Promise.allSettled([
      fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=42.3105&longitude=-71.063&current=temperature_2m,weather_code&temperature_unit=fahrenheit&timezone=America%2FNew_York',
      ).then((r) => (r.ok ? r.json() : null)),
      fetch('/api/mbta').then((r) => (r.ok ? r.json() : null)),
    ]);

    if (weatherRes.status === 'fulfilled' && weatherRes.value?.current) {
      const temp = Math.round(Number(weatherRes.value.current.temperature_2m));
      const code = Number(weatherRes.value.current.weather_code ?? 0);
      if (!Number.isNaN(temp)) {
        setWeather({ tempF: temp, label: weatherCodeLabel(code) });
      }
    }

    if (mbtaRes.status === 'fulfilled' && mbtaRes.value) {
      const alerts = Array.isArray(mbtaRes.value.alerts) ? mbtaRes.value.alerts.length : 0;
      setMbtaAlerts(alerts);
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

        {weather && (
          <span className="inline-flex items-center gap-1 text-[var(--color-text-secondary)]">
            <CloudSun className="h-3.5 w-3.5 text-[var(--color-accent-primary)]" aria-hidden="true" />
            <strong className="font-mono">{weather.tempF}°F</strong> {weather.label}
          </span>
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
