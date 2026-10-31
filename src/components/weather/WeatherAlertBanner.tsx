'use client';

import Link from 'next/link';
import { ArrowRight, TriangleAlert } from 'lucide-react';
import { useWeather } from '@/hooks/useWeather';
import { useI18n } from '@/i18n/hook';

/**
 * The site-wide severe-weather warning, mounted in the page frame so an
 * active storm warning greets every visitor on every page — not only the
 * ones who came looking for the weather. It renders nothing while the feed
 * is loading, nothing when the NWS reports no active alerts, and — the
 * important case — nothing reassuring when the alert feed itself is
 * unreachable; the weather page explains that state instead.
 *
 * Severe and Extreme alerts use `role="alert"` so screen readers announce
 * them; lesser advisories are polite. The banner names the top alert and
 * links to the full text and instructions on /weather.
 */
export function WeatherAlertBanner() {
  const { t, lang, format } = useI18n();
  const { data } = useWeather();

  if (!data || data.alerts.length === 0) return null;
  const [top, ...rest] = data.alerts;
  const urgent = top.severity === 'Extreme' || top.severity === 'Severe';

  return (
    <div className="mx-auto w-full max-w-[86rem] px-4 pt-4 sm:px-6 lg:px-8">
      <div
        role={urgent ? 'alert' : 'status'}
        className={
          urgent
            ? 'flex flex-wrap items-start gap-3 rounded-[var(--radius-md)] bg-[var(--color-accent-secondary)] px-4 py-3 text-white shadow-[var(--shadow)]'
            : 'flex flex-wrap items-start gap-3 rounded-[var(--radius-md)] border border-amber-500/50 bg-amber-500/15 px-4 py-3 text-[var(--color-text-primary)]'
        }
      >
        <TriangleAlert className={`mt-0.5 h-5 w-5 shrink-0 ${urgent ? 'text-white' : 'text-amber-600 dark:text-amber-400'}`} aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="font-heading text-sm font-extrabold leading-snug">
            <span lang="en" dir="auto">{top.event}</span>
            {(top.ends ?? top.expires) ? ` · ${t('weather.alertEnds', { time: format.time((top.ends ?? top.expires) as string) })}` : ''}
          </p>
          {top.headline && <p lang="en" dir="auto" className={`text-sm leading-snug ${urgent ? 'text-white/90' : 'text-[var(--color-text-secondary)]'}`}>{top.headline}</p>}
          {lang !== 'en' && <p className={`text-xs ${urgent ? 'text-white/80' : 'text-[var(--color-text-muted)]'}`}>{t('weather.alertEnglish')}</p>}
          {rest.length > 0 && (
            <p lang="en" dir="auto" className={`text-xs ${urgent ? 'text-white/80' : 'text-[var(--color-text-secondary)]'}`}>{rest.map((a) => a.event).join(' · ')}</p>
          )}
        </div>
        <Link
          href="/weather#alerts"
          className={
            urgent
              ? 'inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-3.5 py-1.5 font-heading text-sm font-bold text-[var(--color-accent-secondary)] transition-transform active:scale-[0.97]'
              : 'inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--color-accent-primary)] px-3.5 py-1.5 font-heading text-sm font-bold text-white transition-transform active:scale-[0.97]'
          }
        >
          {t('weather.alertDetails')} <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
