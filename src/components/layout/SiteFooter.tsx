'use client';

import Link from 'next/link';
import { Heart, Keyboard, Mail } from 'lucide-react';
import { useI18n } from '@/i18n/hook';
import { APP_EVENTS } from '@/hooks/useKeyboardShortcuts';
import { ReportProblem } from '@/components/a11y';
import { RESOURCES, lastReviewedOn, reviewBacklog } from '@/data/resources';
import { APP_VERSION, REPO_URL } from '@/lib/site';

/**
 * Site-wide footer, rendered by the layout instead of by individual pages, so a
 * page cannot forget it and so the review date is computed from the data rather
 * than typed into a component.
 *
 * "Directory last reviewed" is the newest verification stamp across every record;
 * the backlog figure is live too, because a directory that claims to be current
 * while six entries are a year old has stopped being a public utility.
 */
export function SiteFooter() {
  const { t, format } = useI18n();
  const reviewed = lastReviewedOn();
  const backlog = reviewBacklog();

  return (
    <footer className="mt-12 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)]/70 backdrop-blur-sm">
      <div className="mx-auto grid w-full max-w-[86rem] gap-8 px-4 py-8 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <p className="font-display text-base font-bold">{t('site.name')}</p>
          <p className="mt-1 max-w-prose text-sm text-[var(--color-text-secondary)]">{t('dashboard.footer.line1')}</p>
          <p className="mt-2 max-w-prose text-xs leading-relaxed text-[var(--color-text-muted)]">{t('dashboard.footer.line2')}</p>

          <dl className="mt-4 space-y-1 text-xs">
            <div className="flex flex-wrap items-baseline gap-x-2">
              <dt className="font-heading font-semibold text-[var(--color-text-secondary)]">{t('dashboard.footer.verified')}</dt>
              <dd>
                <time dateTime={reviewed}>{format.date(reviewed, 'medium')}</time>
                {backlog.needsReview > 0 && (
                  <span className="ms-2 rounded-[var(--radius-pill)] border border-[var(--color-accent-amber)]/40 px-1.5 py-0.5 text-[10px] text-[var(--color-accent-amber)]">
                    {t('directory.needsReview')} · {backlog.needsReview}/{backlog.total}
                  </span>
                )}
              </dd>
            </div>
            <div className="flex flex-wrap items-baseline gap-x-2">
              <dt className="font-heading font-semibold text-[var(--color-text-secondary)]">{t('about.sources')}</dt>
              <dd>
                <span className="font-mono">{format.number(RESOURCES.length)}</span> · {t('directory.title')}
              </dd>
            </div>
          </dl>
        </div>

        <nav aria-label={t('site.name')}>
          <ul className="space-y-1.5 text-sm">
            <li>
              <Link href="/about" className="inline-flex items-center gap-1.5 text-[var(--color-text-secondary)] hover:text-[var(--color-accent-primary)] hover:underline">
                <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                {t('about.title')}
              </Link>
            </li>
            <li>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent(APP_EVENTS.SHORTCUT_HELP_EVENT))}
                className="inline-flex items-center gap-1.5 text-[var(--color-text-secondary)] hover:text-[var(--color-accent-primary)] hover:underline"
              >
                <Keyboard className="w-3.5 h-3.5" aria-hidden="true" />
                {t('a11y.keyboardMap')}
              </button>
            </li>
            <li>
              <Link href="/settings#accessibility" className="text-[var(--color-text-secondary)] hover:text-[var(--color-accent-primary)] hover:underline">
                {t('dashboard.footer.accessibility')}
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label={t('legal.privacyTitle')}>
          <ul className="space-y-1.5 text-sm">
            <li>
              <Link href="/privacy" className="text-[var(--color-text-secondary)] hover:text-[var(--color-accent-primary)] hover:underline">
                {t('dashboard.footer.privacy')}
              </Link>
            </li>
            <li>
              <Link href="/terms" className="text-[var(--color-text-secondary)] hover:text-[var(--color-accent-primary)] hover:underline">
                {t('dashboard.footer.terms')}
              </Link>
            </li>
            <li>
              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-accent-primary)] hover:underline"
              >
                {t('about.openSource')}
              </a>
            </li>
            <li>
              <ReportProblem />
            </li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-[var(--color-border)]">
        <div className="mx-auto flex w-full max-w-[86rem] flex-col gap-2 px-4 py-3 text-[11px] text-[var(--color-text-muted)] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p className="flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-[var(--color-accent-secondary)]" aria-hidden="true" />
            <span>{t('dashboard.footer.photoCredit')}</span>
          </p>
          <p className="font-mono">{t('settings.version', { version: APP_VERSION })}</p>
        </div>
      </div>
    </footer>
  );
}
