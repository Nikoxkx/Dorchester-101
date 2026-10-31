'use client';

import { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { useReduceMotion } from '@/stores/appStore';
import { usePrivacyStore } from '@/stores/privacyStore';
import { useI18n } from '@/i18n/hook';

const subscribeNoop = () => () => {};

/** A real opt-in for optional analytics, not an acknowledgement treated as consent. */
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
        <motion.aside
          role="region"
          aria-labelledby="privacy-choice-title"
          initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          className="mx-4 mt-4 max-w-3xl rounded-2xl border border-[var(--color-border-strong)] bg-[var(--bg-raised-solid)] p-4 shadow-[var(--shadow-sm)] print:hidden sm:mx-6 sm:p-5 lg:mx-8"
        >
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--color-bg-secondary)] text-[var(--color-accent-primary)]" aria-hidden="true">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h2 id="privacy-choice-title" className="font-heading text-base font-bold text-[var(--color-text-primary)]">{t('consent.title')}</h2>
              <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">{t('consent.body')}</p>
            </div>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => choose('decline')}
              className="min-h-11 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-bg-primary)] px-4 py-2.5 text-center font-heading text-sm font-bold text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-accent-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]"
            >
              {t('consent.decline')}
            </button>
            <button
              type="button"
              onClick={() => choose('allow')}
              className="min-h-11 rounded-xl border border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)] px-4 py-2.5 text-center font-heading text-sm font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)] focus-visible:ring-offset-2"
            >
              {t('consent.accept')}
            </button>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-[var(--color-text-muted)]">{t('consent.manage')}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm font-heading font-semibold">
            <Link href="/privacy" onClick={defer} className="inline-flex min-h-10 items-center text-[var(--color-accent-primary)] underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]">
              {t('consent.policy')}
            </Link>
            <Link href="/settings#privacy" onClick={defer} className="inline-flex min-h-10 items-center text-[var(--color-accent-primary)] underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]">
              {t('consent.settingsLink')}
            </Link>
            <Link href="/settings#permissions" onClick={defer} className="inline-flex min-h-10 items-center text-[var(--color-accent-primary)] underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]">
              {t('consent.permissions')}
            </Link>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
