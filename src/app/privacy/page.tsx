'use client';

import { motion, type Variants } from 'framer-motion';
import { Shield } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { useI18n } from '@/i18n/hook';
import { REPO_URL } from '@/lib/site';

const pv: Variants = { initial: { opacity: 0, y: 20 }, enter: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function PrivacyPage() {
  const { t, format } = useI18n();
  const updated = format.date(new Date(2026, 9, 31), 'long');

  return (
    <MainLayout>
      <motion.div variants={pv} initial="initial" animate="enter" className="max-w-3xl mx-auto space-y-8">
        <header className="space-y-2">
          <h1 className="font-display text-3xl font-bold flex items-center gap-3">
            <Shield className="w-8 h-8 text-[var(--color-accent-primary)]" aria-hidden="true" />
            {t('privacy.title')}
          </h1>
          <p className="text-[var(--color-text-muted)]">{t('legal.lastUpdated', { date: updated })}</p>
        </header>

        <aside className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4" aria-labelledby="privacy-review-title">
          <h2 id="privacy-review-title" className="font-heading font-semibold">{t('privacy.reviewTitle')}</h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{t('privacy.reviewBody')}</p>
        </aside>

        <Card>
          <CardContent className="py-6 prose prose-sm max-w-none text-[var(--color-text-secondary)] space-y-6">
            <section>
              <h2 className="font-heading font-semibold text-lg text-[var(--color-text-primary)]">{format.number(1)}. {t('privacy.overview.title')}</h2>
              <p>{t('privacy.draftScope')}</p>
              <p>{t('consent.body')}</p>
            </section>
            <section>
              <h2 className="font-heading font-semibold text-lg text-[var(--color-text-primary)]">{format.number(2)}. {t('privacy.storage.title')}</h2>
              <p>{t('privacy.localDraft')}</p>
              <p>{t('privacy.clearDraft')}</p>
            </section>
            <section>
              <h2 className="font-heading font-semibold text-lg text-[var(--color-text-primary)]">{format.number(3)}. {t('privacy.external.title')}</h2>
              <p>{t('privacy.externalDraft')}</p>
              <p>{t('privacy.analyticsDetails')}</p>
              <p>{t('privacy.weatherFallback')}</p>
              <p>{t('privacy.newsTranslation')}</p>
            </section>
            <section>
              <h2 className="font-heading font-semibold text-lg text-[var(--color-text-primary)]">{format.number(4)}. {t('privacy.offline.title')}</h2>
              <p>{t('privacy.offlineDraft')}</p>
            </section>
            <section>
              <h2 className="font-heading font-semibold text-lg text-[var(--color-text-primary)]">{format.number(5)}. {t('privacy.contact.title')}</h2>
              <p>{t('privacy.contactDraft')}</p>
              <a href={REPO_URL} target="_blank" rel="noreferrer noopener" className="underline">{t('about.sourceCode')}</a>
            </section>
          </CardContent>
        </Card>
      </motion.div>
    </MainLayout>
  );
}
