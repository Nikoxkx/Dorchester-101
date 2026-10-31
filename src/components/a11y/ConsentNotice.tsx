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
 * Placement: this is an in-flow banner directly under the top bar, not a floating
 * box. It used to be a narrow card with its own `mx-4` margin, so on a wide screen
 * it hung off the top-left of the content column while the page below it centred
 * inside a wider container — it read as a stray panel rather than as part of the
 * page. The banner now spans the content column and repeats the same centred
 * `max-w-[86rem]` + horizontal padding as `<main>`, so its text lines up with the
 * page heading at every width. Buttons move beside the copy once there is room;
 * below `lg` they stack, keeping every control reachable on a 320 px phone.
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
        <motion.aside
          role="region"
          aria-labelledby="privacy-choice-title"
          initial={{ opacity: 0, y: reduceMotion ? 0 : -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduceMotion ? 0 : -8 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          className="border-b border-[var(--color-border-strong)] bg-[var(--bg-raised-solid)] print:hidden"
        >
          <div className="mx-auto w-full max-w-[86rem] px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-8">
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
                  <p className="mt-1 max-w-3xl text-sm leading-relaxed text-[var(--color-text-secondary)]">
                    {t('consent.body')}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-[var(--color-text-muted)]">{t('consent.manage')}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-1 font-heading text-sm font-semibold">
                    <Link
                      href="/privacy"
                      onClick={defer}
                      className="inline-flex min-h-10 items-center text-[var(--color-accent-primary)] underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]"
                    >
                      {t('consent.policy')}
                    </Link>
                    <Link
                      href="/settings#privacy"
                      onClick={defer}
                      className="inline-flex min-h-10 items-center text-[var(--color-accent-primary)] underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]"
                    >
                      {t('consent.settingsLink')}
                    </Link>
                    <Link
                      href="/settings#permissions"
                      onClick={defer}
                      className="inline-flex min-h-10 items-center text-[var(--color-accent-primary)] underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]"
                    >
                      {t('consent.permissions')}
                    </Link>
                  </div>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 lg:w-[24rem] lg:shrink-0">
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
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
