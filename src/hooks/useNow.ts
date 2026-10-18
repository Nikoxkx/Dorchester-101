'use client';

import { useEffect, useState } from 'react';

/**
 * One ticking clock for every "right now" surface: open/closed badges, the
 * what-to-wear pop-up, countdowns. Before, each component read `Date.now()`
 * once at render and then quietly went stale until some unrelated refetch —
 * a place that closed at 8 PM while you were reading its page kept saying
 * "Open now". Components that consume this hook re-decide on the real clock.
 *
 * The first render returns the mount instant (no SSR mismatch: client-only
 * consumers render after hydration, and server renders use the same value
 * the initializer captured). Ticks pause while the tab is hidden via the
 * browser's own timer throttling.
 */
export function useNow(intervalMs = 30_000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    const onVisible = () => setNow(Date.now());
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [intervalMs]);
  return now;
}
