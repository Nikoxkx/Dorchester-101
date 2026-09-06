'use client';

import { useSyncExternalStore } from 'react';

/**
 * Connectivity, read from the browser via `useSyncExternalStore` so it is
 * correct on the first client render and needs no effect-driven setState.
 * `navigator.onLine` is optimistic (true on a captive portal), so live-data
 * components also treat a failed request as "offline" via `markOffline()`.
 */
function subscribe(callback: () => void) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}
const getSnapshot = () => (typeof navigator === 'undefined' ? true : navigator.onLine);
const getServerSnapshot = () => true;

export function useOnline(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
