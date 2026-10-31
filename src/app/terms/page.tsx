'use client';

import { motion, type Variants } from 'framer-motion';
import { FileText } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { useI18n } from '@/i18n/hook';
import type { TranslationKey } from '@/i18n/en';

const pv: Variants = { initial: { opacity: 0, y: 20 }, enter: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const SECTIONS: ReadonlyArray<{ title: TranslationKey; body: TranslationKey; list?: TranslationKey }> = [
  { title: 'terms.accept.title', body: 'terms.accept.body' },
  { title: 'terms.service.title', body: 'terms.service.body' },
  { title: 'terms.cost.title', body: 'terms.cost.body' },
  { title: 'terms.accuracy.title', body: 'terms.accuracy.body', list: 'terms.accuracy.items' },
  { title: 'terms.advice.title', body: 'terms.advice.body' },
  { title: 'terms.links.title', body: 'terms.links.body' },
  { title: 'terms.property.title', body: 'terms.property.body' },
  { title: 'terms.liability.title', body: 'terms.liability.body' },
  { title: 'terms.access.title', body: 'terms.access.body' },
  { title: 'terms.changes.title', body: 'terms.changes.body' },
  { title: 'terms.law.title', body: 'terms.law.body' },
];

export default function TermsPage() {
  const { t, format } = useI18n();
  const updated = format.date(new Date(2026, 9, 31), 'long');

  return (
    <MainLayout>
      <motion.div variants={pv} initial="initial" animate="enter" className="max-w-3xl mx-auto space-y-8">
        <header className="space-y-2">
          <h1 className="font-display text-3xl font-bold flex items-center gap-3">
            <FileText className="w-8 h-8 text-[var(--color-accent-primary)]" />
            {t('legal.termsTitle')}
          </h1>
          <p className="text-[var(--color-text-muted)]">{t('legal.lastUpdated', { date: updated })}</p>
        </header>
        <aside className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4" aria-labelledby="terms-review-title">
          <h2 id="terms-review-title" className="font-heading font-semibold">{t('terms.reviewTitle')}</h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{t('terms.reviewBody')}</p>
        </aside>
        <Card>
          <CardContent className="py-6 prose prose-sm max-w-none text-[var(--color-text-secondary)] space-y-6">
            {SECTIONS.map((section, index) => (
              <section key={section.title}>
                <h2 className="font-heading font-semibold text-lg text-[var(--color-text-primary)]">{format.number(index + 1)}. {t(section.title)}</h2>
                <p>{t(section.body)}</p>
                {section.list && (
                  <ul className="list-disc ps-6 space-y-1">
                    {t(section.list).split('\n').map((item, itemIndex) => <li key={itemIndex}>{item}</li>)}
                  </ul>
                )}
              </section>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </MainLayout>
  );
}
