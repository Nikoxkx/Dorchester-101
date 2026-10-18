'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Shirt, X } from 'lucide-react';
import { useWeather } from '@/hooks/useWeather';
import { useNow } from '@/hooks/useNow';
import { useI18n } from '@/i18n/hook';
import { useAppStore, useReduceMotion } from '@/stores/appStore';
import { buildStyleTips, localDateKey } from '@/lib/weather';
import { TIP_ICON, tipText, tipsNeedCoat, useTempUnit } from './shared';

/**
 * The what-to-wear pop-up: one small card in the corner of every page with
 * today's single most useful clothing tip — "Dress in layers today.
 * Temperatures move between 31°F and 55°F." — and, whenever the tip implies
 * warm gear, the way to get it free.
 *
 * Non-invasive by construction:
 *   · It is computed fresh from the live weather payload on every render,
 *     and the minute-ticking clock re-derives it as the day and the
 *     temperature move (morning chill in the morning, evening layer later).
 *   · Dismissing remembers *this advice*, keyed by Boston date + tip +
 *     5°F feel-like band. Tomorrow's advice, or the same advice after the
 *     temperature has actually changed bands, shows again — stale silence
 *     is the failure mode a weather pop-up must not have.
 *   · It never steals focus, never covers the nav (bottom-end corner,
 *     max width, safe-area aware), and respects reduced motion.
 */

const DISMISSED_KEY = 'dor101-wear-toast-dismissed-v1';

export function WearTodayToast() {
  const { t, format } = useI18n();
  const { data } = useWeather();
  const [unit] = useTempUnit();
  const reduceMotion = useReduceMotion();
  const mobileOpen = useAppStore((s) => s.mobileNavOpen);
  const now = useNow(60_000);
  // Lazy read: the card is invisible until `settled`, so the server render
  // and the first client render agree (nothing on screen) — no effect, no
  // hydration mismatch, no flash of already-dismissed advice.
  const [dismissedSig, setDismissedSig] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      return window.localStorage.getItem(DISMISSED_KEY);
    } catch {
      return null;
    }
  });
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    // Give the page a beat to be a page before the card glides in.
    const id = window.setTimeout(() => setSettled(true), 1200);
    return () => window.clearTimeout(id);
  }, []);

  const feelsNow =
    data?.current?.feelsLikeF ?? data?.hourly.find((h) => new Date(h.end).getTime() > now)?.feelsLikeF ?? 0;
  const derived = useMemo(() => {
    if (!data) return null;
    const at = new Date(now);
    const tips = buildStyleTips(data, at);
    const top = tips[0];
    if (!top) return null;
    const band = Math.round(feelsNow / 5);
    const sig = `${localDateKey(at.toISOString())}|${top.kind}|${band}`;
    return { top, tips, sig, needsCoat: tipsNeedCoat(tips) };
  }, [data, now, feelsNow]);

  const visible = Boolean(derived && settled && !mobileOpen && dismissedSig !== derived.sig);
  const Icon = derived ? TIP_ICON[derived.top.kind] : Shirt;

  const dismiss = () => {
    if (!derived) return;
    setDismissedSig(derived.sig);
    try {
      window.localStorage.setItem(DISMISSED_KEY, derived.sig);
    } catch {
      /* session-only dismissal still works via state */
    }
  };

  return (
    <AnimatePresence>
      {visible && derived && (
        <motion.aside
          key={derived.sig}
          initial={{ opacity: 0, y: reduceMotion ? 0 : 18, scale: reduceMotion ? 1 : 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: reduceMotion ? 0 : 10, scale: reduceMotion ? 1 : 0.98 }}
          transition={{ duration: reduceMotion ? 0.08 : 0.28, ease: [0.22, 1, 0.36, 1] }}
          aria-live="polite"
          aria-label={t('weather.wearToday')}
          className="dor101-glass fixed bottom-[max(1rem,env(safe-area-inset-bottom))] end-[max(1rem,env(safe-area-inset-right))] z-[60] w-[min(21rem,calc(100vw-2rem))] rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-raised)] p-3.5 shadow-[var(--shadow-lg)] print:hidden"
        >
          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 shrink-0 rounded-full bg-[var(--color-accent-primary)]/12 p-2 text-[var(--color-accent-primary)]">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-heading text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-accent-primary)]">
                {t('weather.wearToday')}
              </p>
              <p className="mt-0.5 text-sm font-medium leading-snug text-[var(--color-text-primary)]">
                {tipText(t, derived.top, unit, format)}
              </p>
            </div>
            <button
              type="button"
              onClick={dismiss}
              aria-label={t('common.close')}
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[var(--color-border)] text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)]"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-2.5 flex flex-wrap gap-1.5 ps-[2.7rem]">
            {derived.needsCoat && (
              <Link
                href="/winter-clothing"
                className="inline-flex items-center gap-1 rounded-full bg-[var(--color-accent-primary)] px-3 py-1.5 font-heading text-xs font-bold text-white transition-transform active:scale-[0.97]"
              >
                {t('weather.noCoatShort')} <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
              </Link>
            )}
            <Link
              href="/weather"
              className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] px-3 py-1.5 font-heading text-xs font-bold text-[var(--color-accent-primary)] transition-colors hover:border-[var(--color-accent-primary)]"
            >
              {t('weather.viewFull')} <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
            </Link>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
