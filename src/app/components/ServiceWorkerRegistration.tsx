'use client';

import { useEffect, useRef, useState } from 'react';
import { useI18n } from '@/i18n/hook';
import { useAppStore } from '@/stores/appStore';
import { updateAction } from '@/lib/updatePolicy';

/**
 * Registers the offline worker and applies updates with zero reinstalls —
 * and zero ambushes.
 *
 * The version this replaces did three things that each cost a resident
 * something: it deleted every cache on load, it removed the `dor101-*`
 * keys from localStorage — which is where the language, theme and saved
 * places live, so the settings were reset on every visit — and it called
 * `location.reload()` the moment a worker installed, which wipes a
 * half-filled form.
 *
 * The contract here (`updatePolicy`): while the page is visible, a found
 * update *asks* — the Reload tap is the visitor's. The moment the app is
 * backgrounded, a waiting update activates silently in place (no reload;
 * the next open is simply the new version), so an installed app nobody
 * ever swipes closed still ends up current, and dismissing the prompt
 * defers to the next backgrounding instead of stranding the update.
 * Deploying a new version therefore reaches residents on its own; nobody
 * ever reinstalls Dorchester 101 to get it.
 */
export default function ServiceWorkerRegistration() {
  const { t } = useI18n();
  const announce = useAppStore((s) => s.announce);
  const [updateReady, setUpdateReady] = useState(false);
  /** A downloaded worker waiting to take over. Survives a dismissed
   *  prompt so the next backgrounding can still apply it silently. */
  const waitingRef = useRef<ServiceWorker | null>(null);

  // A dismissed-or-ignored prompt stops nagging after a while; the update
  // itself is not lost (see the visibility handler).
  useEffect(() => {
    if (!updateReady) return;
    const id = window.setTimeout(() => setUpdateReady(false), 45_000);
    return () => window.clearTimeout(id);
  }, [updateReady]);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    let registration: ServiceWorkerRegistration | null = null;
    let cancelled = false;
    const cleanups: Array<() => void> = [];

    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === 'DOR101_CLAIMED') {
        waitingRef.current = null;
        setUpdateReady(false);
      }
    };
    navigator.serviceWorker.addEventListener('message', onMessage);

    navigator.serviceWorker
      .register('/sw.js')
      .then((result) => {
        if (cancelled) return;
        registration = result;
        const applySilently = () => {
          // Activation without a reload: the new worker takes over the
          // shell, this page keeps running until its next navigation.
          waitingRef.current?.postMessage({ type: 'SKIP_WAITING' });
          setUpdateReady(false);
        };
        const markReady = () => {
          if (!result.waiting) return;
          waitingRef.current = result.waiting;
          if (updateAction({ waiting: true, visible: !document.hidden }) === 'apply-silently') {
            applySilently();
          } else {
            setUpdateReady(true);
            announce(t('offline.updateReady'), 'polite');
          }
        };
        markReady();
        // Self-updating means asking, not waiting to be told: long-lived
        // tabs and installed PWAs re-check for a newer build every hour,
        // and again whenever the app comes back to the foreground or the
        // connection returns. Going to the background is the other half
        // of the contract: a waiting update applies itself there, so a
        // dismissed prompt can never strand a resident on an old build.
        const checkForUpdate = () => {
          if (navigator.onLine !== false) void result.update().catch(() => {});
        };
        const hourly = window.setInterval(checkForUpdate, 60 * 60_000);
        const onVisibility = () => {
          if (document.hidden) {
            if (waitingRef.current) applySilently();
          } else {
            checkForUpdate();
          }
        };
        document.addEventListener('visibilitychange', onVisibility);
        window.addEventListener('online', checkForUpdate);
        cleanups.push(() => {
          window.clearInterval(hourly);
          document.removeEventListener('visibilitychange', onVisibility);
          window.removeEventListener('online', checkForUpdate);
        });
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
      cleanups.forEach((fn) => fn());
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
          waitingRef.current?.postMessage({ type: 'SKIP_WAITING' });
          window.setTimeout(() => window.location.reload(), 60);
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
