'use client';

import { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { useReduceMotion } from '@/stores/appStore';
import { usePrivacyStore } from '@/stores/privacyStore';
import { useI18n } from '@/i18n/hook';

const subscribeNoop = () => () => {};

/**
 * A real opt-in for optional analytics, not an acknowledgement treated as consent.
 *
 * Presentation: a compact cookie card centred on the bottom edge. There is no
 * scrim and the page stays scrollable and clickable underneath, so it never
 * blocks a resident who came for a phone number. Escape, "Continue without
 * analytics" or any of the links dismiss it for the session and record nothing;
 * only the two buttons store a choice.
 *
 * Centring uses `left-1/2` plus a motion `x: '-50%'`, because a `-translate-x-1/2`
 * class would be overwritten by the animation's inline transform.
 */
export function ConsentNotice() {
  const { t } = useI18n();
  const reduceMotion = useReduceMotion();
  const choice = usePrivacyStore((s) => s.choice);
  const hydrated = usePrivacyStore((s) => s.hydrated);
  const deferred = usePrivacyStore((s) => s.deferred);
  const choose = usePrivacyStore((s) => s.choose);
  const defer = usePrivacyStore((s) => s.defer);
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const visible = mounted && hydrated && choice === 'unset' && !deferred;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-labelledby="privacy-choice-title"
          initial={{ opacity: 0, x: '-50%', y: reduceMotion ? 0 : 16 }}
          animate={{ opacity: 1, x: '-50%', y: 0 }}
          exit={{ opacity: 0, x: '-50%', y: reduceMotion ? 0 : 12 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') defer();
          }}
          className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-1/2 z-[1300] max-h-[calc(100dvh-1.5rem)] w-[min(19rem,calc(100vw-1.5rem))] overflow-y-auto rounded-xl border border-[var(--color-border-strong)] bg-[var(--bg-raised-solid)] p-3 shadow-[var(--shadow-lg)] print:hidden"
        >
          <div className="flex items-start gap-2">
            <span
              className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[var(--color-bg-secondary)] text-[var(--color-accent-primary)]"
              aria-hidden="true"
            >
              <ShieldCheck className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <h2
                id="privacy-choice-title"
                className="font-heading text-sm font-bold leading-snug text-[var(--color-text-primary)]"
              >
                {t('consent.title')}
              </h2>
              <p className="mt-0.5 text-[0.8125rem] leading-relaxed text-[var(--color-text-secondary)]">
                {t('consent.body')}
              </p>
            </div>
          </div>

          <div className="mt-2.5 grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => choose('decline')}
              className="min-h-10 rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-bg-primary)] px-2 py-1.5 font-heading text-xs font-bold leading-snug text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-accent-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]"
            >
              {t('consent.decline')}
            </button>
            <button
              type="button"
              onClick={() => choose('allow')}
              className="min-h-10 rounded-lg border border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)] px-2 py-1.5 font-heading text-xs font-bold leading-snug text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)] focus-visible:ring-offset-2"
            >
              {t('consent.accept')}
            </button>
          </div>

          <p className="mt-2 text-[0.6875rem] leading-relaxed text-[var(--color-text-muted)]">{t('consent.manage')}</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 font-heading text-[0.6875rem] font-semibold">
            <Link
              href="/privacy"
              onClick={defer}
              className="inline-flex min-h-8 items-center text-[var(--color-accent-primary)] underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]"
            >
              {t('consent.policy')}
            </Link>
            <Link
              href="/settings#privacy"
              onClick={defer}
              className="inline-flex min-h-8 items-center text-[var(--color-accent-primary)] underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]"
            >
              {t('consent.settingsLink')}
            </Link>
            <Link
              href="/settings#permissions"
              onClick={defer}
              className="inline-flex min-h-8 items-center text-[var(--color-accent-primary)] underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]"
            >
              {t('consent.permissions')}
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
