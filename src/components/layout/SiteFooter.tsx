'use client';

import Link from 'next/link';
import { useAppStore } from '@/stores/appStore';
import { useTranslation } from '@/lib/i18n';

export function SiteFooter() {
  const { language } = useAppStore();
  const { t } = useTranslation(language);

  return (
    <footer className="mt-12 pt-6 border-t border-separator text-subhead text-text-2">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="text-title3 font-bold text-1">DOR101</p>
          <p className="mt-1 max-w-md">{t('footer.tagline')}</p>
        </div>
        <nav className="flex flex-wrap gap-x-4 gap-y-1" aria-label="Footer">
          <Link href="/privacy" className="underline underline-offset-2 hover:text-1">{t('footer.privacy')}</Link>
          <Link href="/terms" className="underline underline-offset-2 hover:text-1">{t('footer.terms')}</Link>
          <Link href="/resources" className="underline underline-offset-2 hover:text-1">{t('footer.directory')}</Link>
          <Link href="/faq" className="underline underline-offset-2 hover:text-1">{t('footer.questions')}</Link>
          <a
            href="https://github.com/Nikoxkx/Dorchester-101/issues/new?labels=correction&title=Correction%20needed"
            className="underline underline-offset-2 hover:text-1"
            target="_blank"
            rel="noreferrer"
          >
            {t('footer.feedback')}
          </a>
          <a
            href="https://github.com/Nikoxkx/Dorchester-101"
            className="underline underline-offset-2 hover:text-1"
            target="_blank"
            rel="noreferrer"
          >
            {t('footer.source')}
          </a>
        </nav>
      </div>
      <p className="mt-4 text-caption text-text-3">{t('footer.disclaimer')}</p>
    </footer>
  );
}
