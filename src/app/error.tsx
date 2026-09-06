'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RotateCcw } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { useTranslation } from '@/lib/i18n';

/** Error boundary — matches the design system, offers a way out. */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { language } = useAppStore();
  const { t } = useTranslation(language);

  useEffect(() => {
    // Console only — no telemetry, no tracking, privacy-first.
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-dvh grid place-items-center px-6">
      <div className="content-card squircle p-8 md:p-12 text-center max-w-md w-full">
        <p className="kicker">DOR101</p>
        <h1 className="text-title1 font-bold text-1 mt-2">{t('error.title')}</h1>
        <p className="text-subhead text-text-2 mt-2">{t('error.body')}</p>
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-ink text-canvas text-subhead font-semibold hover:opacity-85"
          >
            <RotateCcw className="w-4 h-4" strokeWidth={2} aria-hidden />
            {t('common.retry')}
          </button>
          <Link
            href="/"
            className="inline-flex items-center h-11 px-5 rounded-full glass glass-clear glass-edge text-subhead font-semibold text-1 hover:bg-[var(--glass-clear-hover)]"
          >
            {t('error.home')}
          </Link>
        </div>
      </div>
    </div>
  );
}
