'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Home, RotateCcw } from 'lucide-react';
import { useI18n } from '@/i18n/hook';
import { ReportProblem } from '@/components/a11y/ReportProblem';

/**
 * Route error boundary.
 *
 * A crash on one page must not blank the site: this keeps the shell, names what
 * happened in the reader's language, offers the two actions that actually help
 * (retry, go home) and lets them tell us. The error message is shown only inside a
 * disclosure, because a stack trace is noise to a resident and signal to a
 * maintainer — both of whom land here.
 */
export default function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useI18n();

  useEffect(() => {
    // The console copy is what a maintainer pastes into an issue; the digest ties
    // it to the server log line for the same failure.
    console.error('[DOR101] route error', error);
  }, [error]);

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-16">
      <h1 className="font-heading text-2xl font-extrabold">{t('error.title')}</h1>
      <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">{t('error.body')}</p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent-primary)] px-4 py-2 font-heading text-sm font-bold text-white transition-transform active:scale-[0.98]"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          {t('common.retry')}
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] px-4 py-2 font-heading text-sm font-bold transition-colors hover:border-[var(--color-accent-primary)]"
        >
          <Home className="h-4 w-4" aria-hidden="true" />
          {t('error.backHome')}
        </Link>
      </div>

      <ReportProblem />

      <details className="rounded-2xl border border-[var(--color-border)] p-3 text-xs">
        <summary className="cursor-pointer font-heading font-bold text-[var(--color-text-secondary)]">{t('error.technical')}</summary>
        <pre className="mt-2 overflow-x-auto whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-[var(--color-text-muted)]">
          {error.message}
          {error.digest ? `\n\ndigest: ${error.digest}` : ''}
        </pre>
      </details>
    </main>
  );
}
