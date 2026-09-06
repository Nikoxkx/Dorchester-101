'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRealtime } from './useRealtime';

/**
 * useLiveApi — the single data-fetching path for anything that can change.
 *
 *  · fetches on mount and on window 'refreshData'
 *  · keeps a polite interval floor (e.g. MBTA's 30-second refresh)
 *  · reloads immediately when the SSE channel (or its polling fallback)
 *    says the underlying data changed — no manual refresh anywhere
 *
 * `channels` maps realtime event types to this resource. Any hit reloads.
 */
export function useLiveApi<T>(
  url: string | null,
  options: { intervalMs?: number; channels?: string[] } = {},
) {
  const { intervalMs, channels = [] } = options;
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshedAt, setRefreshedAt] = useState<string | null>(null);
  const inFlight = useRef(false);

  const load = useCallback(async () => {
    if (!url || inFlight.current) return;
    inFlight.current = true;
    setError(null);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const json = (await res.json()) as T;
      setData(json);
      setRefreshedAt(new Date().toISOString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load');
    } finally {
      setLoading(false);
      inFlight.current = false;
    }
  }, [url]);

  const realtime = useRealtime(
    useCallback(() => void load(), [load]),
    channels.length > 0 ? channels : ['__none__'],
  );

  useEffect(() => {
    const raf = requestAnimationFrame(() => void load());
    if (!intervalMs) return () => cancelAnimationFrame(raf);
    const id = window.setInterval(() => void load(), intervalMs);
    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(id);
    };
  }, [load, intervalMs]);

  useEffect(() => {
    const onRefresh = () => void load();
    window.addEventListener('refreshData', onRefresh);
    return () => window.removeEventListener('refreshData', onRefresh);
  }, [load]);

  // Refetch when coming back online.
  useEffect(() => {
    const onOnline = () => void load();
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [load]);

  return { data, error, loading, reload: load, refreshedAt, realtime: realtime.status };
}
