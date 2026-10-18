'use client';

import { useCallback, useState } from 'react';
import { useLivePolling } from './useLivePolling';
import type { WeatherPayload } from '@/lib/weather';

/**
 * The one weather reader for every panel (NowBar chip, homepage panel,
 * warning banner, weather page), so they can never disagree with each other.
 *
 * Source order, all labelled in the payload itself:
 *   1. `/api/weather` — the server's shared 5-minute cache of the NWS feed.
 *   2. The browser asks the NWS directly (same parser, dynamically imported)
 *      — this is what keeps the desktop build and any static preview live
 *      when there is no DOR101 server behind the page.
 *   3. The last good payload in localStorage, returned with `fromCacheAt`
 *      set so the UI can say how old it is instead of pretending it is live.
 *
 * Concurrent mounts share one in-flight request and a 60-second memo, so a
 * page with three weather widgets makes one request, not three.
 */

const CACHE_KEY = 'dor101-weather-cache-v1';

interface CachedWeather {
  savedAt: string;
  payload: WeatherPayload;
}

let inFlight: Promise<WeatherPayload> | null = null;
let memo: { at: number; payload: WeatherPayload } | null = null;

function readCache(): CachedWeather | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as CachedWeather) : null;
  } catch {
    return null;
  }
}

function writeCache(payload: WeatherPayload): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: new Date().toISOString(), payload } satisfies CachedWeather));
  } catch {
    /* private mode or quota; the in-memory copy still serves this session */
  }
}

async function loadWeatherFresh(): Promise<WeatherPayload> {
  try {
    const res = await fetch('/api/weather');
    if (res.ok) return (await res.json()) as WeatherPayload;
    throw new Error(`weather api answered ${res.status}`);
  } catch {
    const { fetchBostonWeather } = await import('@/lib/weather');
    return fetchBostonWeather();
  }
}

function loadWeather(): Promise<WeatherPayload> {
  if (memo && Date.now() - memo.at < 60_000) return Promise.resolve(memo.payload);
  if (!inFlight) {
    inFlight = loadWeatherFresh()
      .then((payload) => {
        memo = { at: Date.now(), payload };
        writeCache(payload);
        return payload;
      })
      .finally(() => {
        inFlight = null;
      });
  }
  return inFlight;
}

export interface WeatherState {
  data: WeatherPayload | null;
  loading: boolean;
  /** True when every live path failed and nothing is displayable. */
  unavailable: boolean;
  /** When set, `data` is the last good load from this device, not live. */
  fromCacheAt: string | null;
  refresh: () => void;
}

export function useWeather(): WeatherState {
  const [data, setData] = useState<WeatherPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [fromCacheAt, setFromCacheAt] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const payload = await loadWeather();
      setData(payload);
      setFromCacheAt(null);
      setUnavailable(false);
    } catch {
      const cached = readCache();
      if (cached) {
        setData(cached.payload);
        setFromCacheAt(cached.savedAt);
        setUnavailable(false);
      } else {
        setUnavailable(true);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Weather changes on the NWS's schedule, not the MBTA's: ten minutes is
  // fresher than the forecast itself updates, and the alerts endpoint is
  // re-read on the same cadence through the shared payload.
  useLivePolling(load, { minMs: 10 * 60_000 });

  const refresh = useCallback(() => {
    memo = null;
    void load();
  }, [load]);

  return { data, loading, unavailable, fromCacheAt, refresh };
}
