'use client';

import { useEffect } from 'react';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { PRIVACY_STORAGE_KEY, readAnalyticsChoice, usePrivacyStore } from '@/stores/privacyStore';

/** Drop events without current permission, and never send URL query/fragment values. */
export function privacyFilteredEvent<T extends { url: string }>(event: T): T | null {
  const { choice, hydrated } = usePrivacyStore.getState();
  if (!hydrated || choice !== 'allow' || typeof window === 'undefined' || typeof event.url !== 'string') return null;
  try {
    const url = new URL(event.url, window.location.origin);
    url.search = '';
    url.hash = '';
    return { ...event, url: url.toString() };
  } catch { return null; }
}

/**
 * The SDKs are not mounted until a positive choice exists. Their beforeSend
 * hooks continue checking the current choice if a user withdraws it after the
 * scripts have loaded, including when a different tab changes the choice.
 */
export function PrivacyAnalytics() {
  const choice = usePrivacyStore((s) => s.choice);
  const hydrated = usePrivacyStore((s) => s.hydrated);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== PRIVACY_STORAGE_KEY && event.key !== null) return;
      try { if (event.storageArea && event.storageArea !== window.localStorage) return; } catch { return; }
      const next = readAnalyticsChoice(event.key === null ? null : event.newValue);
      if (next !== usePrivacyStore.getState().choice) usePrivacyStore.setState({ choice: next, deferred: false });
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  if (!hydrated || choice !== 'allow') return null;
  return <><Analytics beforeSend={privacyFilteredEvent} /><SpeedInsights beforeSend={privacyFilteredEvent} /></>;
}
