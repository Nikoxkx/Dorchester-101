'use client';

import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';
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
 * Presentation: a small modal pop-up over the page on first visit — centred on a
 * desktop, docked to the bottom on a phone. It is dismissible without choosing:
 * the backdrop and Escape both hide it for the session and record nothing, so
 * optional analytics stay off and nobody is locked out of a page until they
 * answer. Focus moves into the panel and Tab cycles inside it while it is open.
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
  const panel = useRef<HTMLDivElement>(null);

  const dismiss = useCallback(() => defer(), [defer]);

  useEffect(() => {
    if (!visible) return;
    const node = panel.current;
    const previous = document.activeElement as HTMLElement | null;
    node?.querySelector<HTMLElement>('button, a[href]')?.focus();

    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        dismiss();
        return;
      }
      if (event.key !== 'Tab' || !node) return;
      const focusable = Array.from(node.querySelectorAll<HTMLElement>('button, a[href]')).filter(
        (el) => !el.hasAttribute('disabled'),
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previous?.focus?.();
    };
  }, [visible, dismiss]);

  const panelMotion = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 24, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 16, scale: 0.98 },
      };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="privacy-consent"
          className="fixed inset-0 z-[1300] flex items-end justify-center p-4 sm:items-center print:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <div
            className="absolute inset-0 bg-[var(--color-scrim)]"
            aria-hidden="true"
            onClick={dismiss}
          />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="privacy-choice-title"
            {...panelMotion}
            transition={{ type: 'spring', stiffness: 340, damping: 32 }}
            className="relative max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-[var(--color-border-strong)] bg-[var(--bg-raised-solid)] p-5 shadow-[var(--shadow-lg)]"
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
                <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                  {t('consent.body')}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => choose('decline')}
                className="min-h-11 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-bg-primary)] px-3 py-2.5 text-center font-heading text-sm font-bold text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-accent-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]"
              >
                {t('consent.decline')}
              </button>
              <button
                type="button"
                onClick={() => choose('allow')}
                className="min-h-11 rounded-xl border border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)] px-3 py-2.5 text-center font-heading text-sm font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)] focus-visible:ring-offset-2"
              >
                {t('consent.accept')}
              </button>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-[var(--color-text-muted)]">{t('consent.manage')}</p>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 font-heading text-xs font-semibold sm:text-sm">
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
