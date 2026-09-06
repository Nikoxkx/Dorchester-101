'use client';

import { useEffect, useState } from 'react';
import { useI18n } from '@/i18n/hook';
import { useAppStore } from '@/stores/appStore';

/**
 * Registers the offline worker and tells the visitor when a new version is
 * waiting. Nothing else.
 *
 * The version this replaces did three things that each cost a resident something:
 * it deleted every cache on load, it removed the `dor101-*` keys from
 * localStorage — which is where the language, theme and saved places live, so the
 * settings were reset on every visit — and it called `location.reload()` the
 * moment a worker installed, which wipes a half-filled form. Awaiting the
 * visitor's own reload is the normal, polite contract, so that is what this does.
 */
export default function ServiceWorkerRegistration() {
  const { t } = useI18n();
  const announce = useAppStore((s) => s.announce);
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    let registration: ServiceWorkerRegistration | null = null;
    let cancelled = false;

    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === 'DOR101_CLAIMED') setUpdateReady(false);
    };
    navigator.serviceWorker.addEventListener('message', onMessage);

    navigator.serviceWorker
      .register('/sw.js')
      .then((result) => {
        if (cancelled) return;
        registration = result;
        const markReady = () => {
          if (result.waiting) {
            setUpdateReady(true);
            announce(t('offline.updateReady'), 'polite');
          }
        };
        markReady();
        result.addEventListener('updatefound', () => {
          const worker = result.installing;
          if (!worker) return;
          worker.addEventListener('statechange', () => {
            // `installed` while a controller already exists means this is an
            // update, not the first visit.
            if (worker.state === 'installed' && navigator.serviceWorker.controller) markReady();
          });
        });
      })
      .catch(() => {
        // No worker means no offline cache. The site still works online, so the
        // right response is silence here and the offline banner where it matters.
      });

    return () => {
      cancelled = true;
      navigator.serviceWorker.removeEventListener('message', onMessage);
      void registration;
    };
  }, [announce, t]);

  if (!updateReady) return null;

  return (
    <div className="fixed bottom-4 inset-x-4 z-[1200] mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-raised)] px-4 py-3 shadow-[var(--shadow-lg)] print:hidden">
      <span className="flex-1 text-sm leading-snug">{t('offline.updateReady')}</span>
      <button
        type="button"
        onClick={() => {
          // Skip the waiting worker, then reload: the new shell takes over on this
          // navigation instead of the next one, and the visitor chose both steps.
          void navigator.serviceWorker
            .getRegistration()
            ?.then((reg) => reg?.waiting?.postMessage({ type: 'SKIP_WAITING' }))
            .finally(() => window.location.reload());
        }}
        className="rounded-full bg-[var(--color-accent-primary)] px-3 py-1.5 font-heading text-xs font-bold text-white transition-transform active:scale-[0.97]"
      >
        {t('offline.reload')}
      </button>
      <button
        type="button"
        onClick={() => setUpdateReady(false)}
        className="rounded-full border border-[var(--color-border)] px-3 py-1.5 font-heading text-xs font-bold text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-accent-primary)]"
      >
        {t('common.close')}
      </button>
    </div>
  );
}
