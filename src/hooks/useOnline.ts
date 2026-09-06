'use client';

import { useEffect, useState } from 'react';

/**
 * Real connectivity, not a styling decision.
 *
 * `navigator.onLine` is unreliable in one direction only: it says "online" when
 * a network exists even if the internet does not. So the hook starts optimistic
 * after hydration and is corrected by an actual failed request, via
 * `markOffline()`. Live-data components use that to explain a stale panel instead
 * of showing a spinner forever.
 */
export function useOnline(): boolean {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    if (typeof navigator === 'undefined') return;
    setOnline(navigator.onLine);
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return online;
}

