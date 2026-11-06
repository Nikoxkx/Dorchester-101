'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { useReduceMotion } from '@/stores/appStore';
import { usePrivacyStore } from '@/stores/privacyStore';
import { useI18n } from '@/i18n/hook';

const subscribeNoop = () => () => {};

/**
 * A transparent, non-blocking consent banner. Optional analytics stay off
 * until an explicit choice; both choices are equally available, and policy and
 * settings links remain visible without covering the page or trapping focus.
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
          aria-modal="false"
          aria-labelledby="privacy-choice-title"
          aria-describedby="privacy-choice-description"
          initial={{ opacity: 0, x: '-50%', y: reduceMotion ? 0 : 16 }}
          animate={{ opacity: 1, x: '-50%', y: 0 }}
          exit={{ opacity: 0, x: '-50%', y: reduceMotion ? 0 : 12 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') defer();
          }}
          className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-1/2 z-[1300] max-h-[calc(100dvh-1.5rem)] w-[min(54rem,calc(100vw-1.5rem))] overflow-y-auto rounded-2xl border border-[var(--color-border-strong)] bg-[var(--bg-raised-solid)] p-4 shadow-[var(--shadow-lg)] sm:p-5 print:hidden"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--color-bg-secondary)] text-[var(--color-accent-primary)]"
                aria-hidden="true"
              >
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2
                  id="privacy-choice-title"
                  className="font-heading text-base font-bold leading-snug text-[var(--color-text-primary)]"
                >
                  {t('consent.title')}
                </h2>
                <p
                  id="privacy-choice-description"
                  className="mt-1 max-w-3xl text-sm leading-relaxed text-[var(--color-text-secondary)]"
                >
                  {t('consent.body')}
                </p>
              </div>
            </div>

            <div className="w-full shrink-0 md:w-[19rem]">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => choose('decline')}
                  className="min-h-11 rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-bg-primary)] px-2.5 py-2 font-heading text-xs font-bold leading-snug text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-accent-primary)] hover:bg-[var(--color-bg-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]"
                >
                  {t('consent.decline')}
                </button>
                <button
                  type="button"
                  onClick={() => choose('allow')}
                  className="min-h-11 rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-bg-primary)] px-2.5 py-2 font-heading text-xs font-bold leading-snug text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-accent-primary)] hover:bg-[var(--color-bg-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]"
                >
                  {t('consent.accept')}
                </button>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[var(--color-text-muted)]">
                {t('consent.manage')}
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-[var(--color-border)] pt-2.5 font-heading text-xs font-semibold">
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
