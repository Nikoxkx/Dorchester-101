'use client';

import { useEffect, useRef } from 'react';
import { useAppStore } from '@/stores/appStore';

/**
 * The single polling rule for every live panel.
 *
 * Three things a hand-rolled `setInterval` usually gets wrong, all of them
 * visible to a resident on metered data:
 *  - it keeps hammering the API in a background tab;
 *  - it ignores the visitor's own refresh preference;
 *  - it never catches up when the tab comes back into view.
 *
 * `minMs` protects the shared MBTA quota from an aggressive interval choice, and
 * the returned value reports which interval is actually in force so the UI can
 * state it truthfully instead of claiming "every minute" when it is not.
 */
export function useLivePolling(
  refresh: () => void | Promise<void>,
  options: { minMs?: number } = {}
): { intervalMs: number; enabled: boolean } {
  const autoRefresh = useAppStore((s) => s.autoRefresh);
  const minutes = useAppStore((s) => s.refreshIntervalMinutes);
  const epoch = useAppStore((s) => s.dataEpoch);
  const lastRun = useRef(0);
  const inFlight = useRef(false);
  const enabled = autoRefresh;
  const intervalMs = Math.max(options.minMs ?? 20_000, Math.max(1, minutes) * 60_000);

  const run = () => {
    // One request per panel at a time: a slow feed plus a fast tick (or a
    // caller whose `refresh` identity churns) must never pile up requests.
    if (inFlight.current) return;
    inFlight.current = true;
    lastRun.current = Date.now();
    void Promise.resolve(refresh()).finally(() => {
      inFlight.current = false;
    });
  };

  // Mount, "Refresh now" in Settings (which bumps the epoch) and any change to
  // the refresh function itself — a new filter, a new language — all land in this
  // one effect, so a panel cannot fetch twice for the same reason.
  useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [epoch, refresh]);

  useEffect(() => {
    if (!enabled) return;
    const tick = () => {
      if (document.hidden) return;
      if (navigator.onLine === false) return;
      run();
    };
    const timer = window.setInterval(tick, intervalMs);
    const onVisibility = () => {
      if (document.hidden) return;
      if (Date.now() - lastRun.current > intervalMs) run();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, intervalMs, refresh]);

  return { intervalMs, enabled };
}
