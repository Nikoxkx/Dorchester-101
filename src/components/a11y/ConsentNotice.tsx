'use client';

import { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { useAppStore, useReduceMotion } from '@/stores/appStore';
import { useI18n } from '@/i18n/hook';

const subscribeNoop = () => () => {};

/**
 * The plain-language privacy notice, shown once on first visit.
 *
 * What it must not do is pretend to be a cookie wall: this site sets no
 * tracking cookies, runs no ads and has no accounts, so there is nothing
 * to "accept" in the legal sense — settings persist in on-device local
 * storage because a resident's language and colors should survive a
 * refresh. The notice says exactly that, once, and points at the two
 * places with real controls (Settings → Permissions, and the Privacy
 * page). Browser permissions themselves are never requested here; they
 * stay behind their own labelled buttons.
 */
export function ConsentNotice() {
  const { t } = useI18n();
  const reduceMotion = useReduceMotion();
  const hydrated = useAppStore((s) => s.hydrated);
  const consentSeen = useAppStore((s) => s.consentSeen);
  const setConsentSeen = useAppStore((s) => s.setConsentSeen);
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);

  const visible = mounted && hydrated && !consentSeen;

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          role="region"
          aria-label={t('consent.title')}
          initial={{ opacity: 0, y: reduceMotion ? 0 : 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          className="dor101-safe-bottom fixed inset-x-3 bottom-3 z-[1180] mx-auto max-w-xl rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-raised)] p-4 shadow-[var(--shadow-lg)] print:hidden sm:inset-x-6 sm:bottom-5"
        >
          <h2 className="flex items-center gap-2 font-heading text-sm font-extrabold">
            <ShieldCheck className="h-4.5 w-4.5 text-[var(--color-accent-green)]" aria-hidden="true" />
            {t('consent.title')}
          </h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">{t('consent.body')}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setConsentSeen(true)}
              className="rounded-full bg-[var(--color-accent-primary)] px-4 py-2 font-heading text-sm font-bold text-white transition-transform active:scale-[0.97]"
            >
              {t('consent.accept')}
            </button>
            <Link
              href="/settings#permissions"
              onClick={() => setConsentSeen(true)}
              className="rounded-full border border-[var(--color-border-strong)] px-3.5 py-2 font-heading text-xs font-bold text-[var(--color-accent-primary)]"
            >
              {t('consent.permissions')}
            </Link>
            <Link href="/privacy" onClick={() => setConsentSeen(true)} className="px-1.5 font-heading text-xs font-bold text-[var(--color-text-secondary)] underline decoration-dotted underline-offset-2">
              {t('dashboard.footer.privacy')}
            </Link>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
