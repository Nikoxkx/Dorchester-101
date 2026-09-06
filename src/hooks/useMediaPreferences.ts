'use client';

import { useCallback, useSyncExternalStore } from 'react';

/**
 * Live media-query reader.
 *
 * Accessibility defaults on this site are 'auto' for a reason: a visitor who
 * has already told their operating system to reduce motion should not have to
 * find a second switch on our page. 'auto' resolves by asking the device, and
 * the listener stays attached so a mid-session change in System Settings is
 * picked up without a reload.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (cb: () => void) => {
      if (typeof window === 'undefined' || !('matchMedia' in window)) return () => {};
      const list = window.matchMedia(query);
      list.addEventListener('change', cb);
      return () => list.removeEventListener('change', cb);
    },
    [query]
  );
  const getSnapshot = useCallback(() => (typeof window !== 'undefined' && 'matchMedia' in window ? window.matchMedia(query).matches : false), [query]);
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

export function usePrefersHighContrast(): boolean {
  // `prefers-contrast` is the standard query; `forced-colors` catches Windows
  // High Contrast mode, where the OS, not the page, owns the palette.
  const contrast = useMediaQuery('(prefers-contrast: more)');
  const forced = useMediaQuery('(forced-colors: active)');
  return contrast || forced;
}

export function usePrefersDark(): boolean {
  return useMediaQuery('(prefers-color-scheme: dark)');
}
