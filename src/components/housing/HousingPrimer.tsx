'use client';

import Link from 'next/link';
import { BookOpenText, ClipboardList, FileCheck2, Landmark, ListOrdered, Ticket, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Cite, SourceMark } from '@/components/sources/SourceMark';
import { useTranslation } from '@/lib/i18n';

/** Always-visible three-sentence orientation above the tabs. */
export function HousingStartHere({ onLearnMore }: { onLearnMore: () => void }) {
  const { t } = useTranslation();
  return (
    <section aria-labelledby="start-here" className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/90 p-4">
      <h2 id="start-here" className="flex items-center gap-2 font-heading text-base font-bold">
        <BookOpenText className="h-4 w-4 text-[var(--color-accent-primary)]" aria-hidden="true" /> {t('primer.heading')}
      </h2>
      <div className="mt-2 grid gap-3 text-sm leading-relaxed text-[var(--color-text-secondary)] md:grid-cols-3">
        <p>
          <strong className="text-[var(--color-text-primary)]">{t('primer.capTitle')}</strong> {t('primer.capBody')}
        </p>
        <p>
          <strong className="text-[var(--color-text-primary)]">{t('primer.bandTitle')}</strong> {t('primer.bandBody')}
        </p>
        <p>
          <strong className="text-[var(--color-text-primary)]">{t('primer.lotteryTitle')}</strong> {t('primer.lotteryBody')}
        </p>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <button type="button" onClick={onLearnMore} className="rounded-full bg-[var(--color-accent-primary)] px-3.5 py-1.5 font-heading font-bold text-white">
          {t('primer.stepByStep')}
        </button>
        <Link href="/tools#ami" className="rounded-full border border-[var(--color-border)] px-3.5 py-1.5 font-heading font-bold no-underline hover:border-[var(--color-accent-primary)]">
          {t('primer.findBand')}
        </Link>
        <span className="ms-auto inline-flex items-center gap-1.5 text-[var(--color-text-muted)]">
          {t('primer.rulesFrom')} <SourceMark id="bostongov" size="xs" withName /> · <SourceMark id="hud" size="xs" withName />
        </span>
      </div>
    </section>
  );
}

const STEPS = [
  {
    icon: Users,
    key: '1',
  },
  {
    icon: ClipboardList,
    key: '2',
  },
  {
    icon: Landmark,
    key: '3',
  },
  {
    icon: Ticket,
    key: '4',
  },
  {
    icon: FileCheck2,
    key: '5',
  },
  {
    icon: ListOrdered,
    key: '6',
  },
];

export function HowToApply() {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('primer.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
          {t('primer.intro')}
        </p>
        <ol className="mt-4 space-y-3">
          {STEPS.map((s, i) => (
            <li key={s.key} className="flex gap-3 rounded-xl border border-[var(--color-border)] p-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)]">
                <s.icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="font-heading font-semibold">
                  <span className="me-1.5 font-mono text-xs text-[var(--color-text-muted)]">{i + 1}</span>
                  {t(`primer.step${s.key}.title` as 'primer.step1.title')}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">{t(`primer.step${s.key}.body` as 'primer.step1.body')}</p>
                <p className="mt-1.5 rounded-lg bg-[var(--color-bg-tertiary)] px-2.5 py-1.5 text-xs leading-snug"><strong>{t('primer.tipLabel')}</strong> {t(`primer.step${s.key}.tip` as 'primer.step1.tip')}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-4 grid gap-2 text-xs sm:grid-cols-3">
          <a href="https://www.bostonhousing.org" target="_blank" rel="noopener noreferrer" className="rounded-xl border border-[var(--color-border)] p-3 no-underline hover:border-[var(--color-accent-primary)]">
            <SourceMark id="bha" size="sm" withName asSpan />
            <p className="mt-1.5 text-[var(--color-text-secondary)]">{t('primer.bhaCard')}</p>
          </a>
          <a href="https://www.boston.gov/metrolist" target="_blank" rel="noopener noreferrer" className="rounded-xl border border-[var(--color-border)] p-3 no-underline hover:border-[var(--color-accent-primary)]">
            <SourceMark id="bostongov" size="sm" withName asSpan />
            <p className="mt-1.5 text-[var(--color-text-secondary)]">{t('primer.metrolistCard')}</p>
          </a>
          <a href="https://housingnavigatorma.org" target="_blank" rel="noopener noreferrer" className="rounded-xl border border-[var(--color-border)] p-3 no-underline hover:border-[var(--color-accent-primary)]">
            <span className="font-heading font-semibold">{t('housing.operator.navigator')}</span>
            <p className="mt-1.5 text-[var(--color-text-secondary)]">{t('primer.navigatorCard')}</p>
          </a>
        </div>
        <Cite id="bostongov" note={t('primer.citeNote')} href="https://www.boston.gov/income-restricted-housing-guide" className="mt-3" />
      </CardContent>
    </Card>
  );
}
