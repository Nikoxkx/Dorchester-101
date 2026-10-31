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
 * Presentation: the conventional cookie card — a small floating panel pinned to
 * the bottom corner of the viewport (`end` keeps it bottom-right in LTR and
 * bottom-left in RTL). There is no scrim and the page stays scrollable and
 * clickable underneath, so it never blocks a resident who came for a phone
 * number. Escape, "Continue without analytics" or any of the links dismiss it
 * for the session and record nothing; only the two buttons store a choice.
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
          initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') defer();
          }}
          className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] end-[max(1rem,env(safe-area-inset-right))] z-[1300] max-h-[calc(100dvh-2rem)] w-[min(23rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-[var(--color-border-strong)] bg-[var(--bg-raised-solid)] p-4 shadow-[var(--shadow-lg)] print:hidden"
        >
          <div className="flex items-start gap-3">
            <span
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--color-bg-secondary)] text-[var(--color-accent-primary)]"
              aria-hidden="true"
            >
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h2
                id="privacy-choice-title"
                className="font-heading text-base font-bold text-[var(--color-text-primary)]"
              >
                {t('consent.title')}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">{t('consent.body')}</p>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => choose('decline')}
              className="min-h-11 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-bg-primary)] px-3 py-2 font-heading text-[0.8125rem] font-bold leading-snug text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-accent-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]"
            >
              {t('consent.decline')}
            </button>
            <button
              type="button"
              onClick={() => choose('allow')}
              className="min-h-11 rounded-xl border border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)] px-3 py-2 font-heading text-[0.8125rem] font-bold leading-snug text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)] focus-visible:ring-offset-2"
            >
              {t('consent.accept')}
            </button>
          </div>

          <p className="mt-3 text-xs leading-relaxed text-[var(--color-text-muted)]">{t('consent.manage')}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 font-heading text-xs font-semibold">
            <Link
              href="/privacy"
              onClick={defer}
              className="inline-flex min-h-9 items-center text-[var(--color-accent-primary)] underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]"
            >
              {t('consent.policy')}
            </Link>
            <Link
              href="/settings#privacy"
              onClick={defer}
              className="inline-flex min-h-9 items-center text-[var(--color-accent-primary)] underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]"
            >
              {t('consent.settingsLink')}
            </Link>
            <Link
              href="/settings#permissions"
              onClick={defer}
              className="inline-flex min-h-9 items-center text-[var(--color-accent-primary)] underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]"
            >
              {t('consent.permissions')}
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
