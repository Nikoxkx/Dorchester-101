'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';

/**
 * One ticking clock for every "right now" surface: open/closed badges, the
 * what-to-wear pop-up, countdowns. Before, each component read `Date.now()`
 * once at render and then quietly went stale until some unrelated refetch —
 * a place that closed at 8 PM while you were reading its page kept saying
 * "Open now". Components that consume this hook re-decide on the real clock.
 *
 * The first render uses the current clock. It is suitable for content that
 * appears only after a client-side fetch. Prerendered content must use
 * `useHydratedNow` instead, because its build-time clock is not the visitor's
 * clock. Ticks pause while the tab is hidden via the browser's timer throttling.
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

const subscribeHydration = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

/**
 * A clock for prerendered pages. Until hydration there is no trustworthy
 * current time, so callers should omit live claims (open now, age, greeting).
 * The first client snapshot agrees with the static HTML, then switches to the
 * visitor's ticking clock immediately after hydration.
 */
export function useHydratedNow(intervalMs = 30_000): number | null {
  const hydrated = useSyncExternalStore(subscribeHydration, clientSnapshot, serverSnapshot);
  const now = useNow(intervalMs);
  return hydrated ? now : null;
}
