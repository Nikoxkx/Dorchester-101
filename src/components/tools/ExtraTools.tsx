'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { CalendarClock, CheckCircle2, CircleAlert, Info, KeyRound, Scale, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Cite } from '@/components/sources/SourceMark';
import { cn, formatCurrency } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import type { TranslationKey } from '@/i18n/en';

/**
 * Three calculators added because they answer questions residents actually bring
 * to a housing clinic, and because every one of them can be run from a public
 * rule with no guessing:
 *  - Move-in cost: Massachusetts caps what a landlord may collect up front
 *    (M.G.L. c.186 §15B), so the maximum legal move-in cost is arithmetic.
 *  - Benefits screener: the thresholds are published each year by DTA,
 *    MassHealth, LIHEAP and the MBTA. A "you may qualify" is a nudge to apply,
 *    never a determination.
 *  - Eviction timeline: the summary-process steps and their statutory minimum
 *    notice periods, so a tenant with a notice in hand knows what happens next
 *    and when to call a lawyer.
 * Nothing typed here leaves the browser.
 */

const field =
  'w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-3 py-2.5 font-mono focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)]';

/* ───────────────────────────── Move-in cost ───────────────────────────── */

export function MoveInCostTool() {
  const { t, format } = useI18n();
  const [rent, setRent] = useState(2200);
  const [lastMonth, setLastMonth] = useState(true);
  const [deposit, setDeposit] = useState(true);
  const [lockFee, setLockFee] = useState(0);
  const [brokerFee, setBrokerFee] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(4500);

  const legalMax = rent * (1 + (lastMonth ? 1 : 0) + (deposit ? 1 : 0)) + lockFee;
  const total = legalMax + brokerFee;
  const monthsOfIncome = monthlyIncome > 0 ? total / monthlyIncome : 0;

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-[var(--color-accent-primary)]" aria-hidden="true" /> {t('tool.moveIn.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-[var(--color-text-secondary)]">
            {t('tool.moveIn.intro')}
          </p>
          <label className="block text-sm font-heading font-medium">
            {t('tool.moveIn.rent')}
            <div className="relative mt-1.5">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">$</span>
              <input type="number" min={0} value={rent} onChange={(e) => setRent(Number(e.target.value))} className={cn(field, 'pl-8')} />
            </div>
          </label>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] p-2.5 text-sm">
              <input type="checkbox" checked={lastMonth} onChange={(e) => setLastMonth(e.target.checked)} className="h-4 w-4 accent-[var(--color-accent-primary)]" />
              {t('tool.moveIn.lastMonth')}
            </label>
            <label className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] p-2.5 text-sm">
              <input type="checkbox" checked={deposit} onChange={(e) => setDeposit(e.target.checked)} className="h-4 w-4 accent-[var(--color-accent-primary)]" />
              {t('tool.moveIn.deposit')}
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-heading font-medium">
              {t('tool.moveIn.lock')}
              <div className="relative mt-1.5">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">$</span>
                <input type="number" min={0} value={lockFee} onChange={(e) => setLockFee(Number(e.target.value))} className={cn(field, 'pl-8')} />
              </div>
            </label>
            <label className="block text-sm font-heading font-medium">
              {t('tool.moveIn.broker')}
              <div className="relative mt-1.5">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">$</span>
                <input type="number" min={0} value={brokerFee} onChange={(e) => setBrokerFee(Number(e.target.value))} className={cn(field, 'pl-8')} />
              </div>
            </label>
          </div>
          <label className="block text-sm font-heading font-medium">
            {t('tool.moveIn.income')}
            <div className="relative mt-1.5">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">$</span>
              <input type="number" min={0} value={monthlyIncome} onChange={(e) => setMonthlyIncome(Number(e.target.value))} className={cn(field, 'pl-8')} />
            </div>
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('tool.moveIn.expected')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl bg-[var(--color-bg-tertiary)] p-4 text-center">
            <p className="text-sm text-[var(--color-text-muted)]">{t('tool.moveIn.total')}</p>
            <p className="font-mono text-3xl font-bold">{format.currency(total, { cents: true })}</p>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              {monthlyIncome > 0 ? t('tool.moveIn.monthsOfIncome', { months: monthsOfIncome.toFixed(1) }) : t('tool.moveIn.enterIncome')}
            </p>
          </div>
          <ul className="space-y-1.5 text-sm">
            <Row label={t('tool.moveIn.rowFirst')} value={rent} />
            {lastMonth && <Row label={t('tool.moveIn.rowLast')} value={rent} note={t('tool.moveIn.rowLastNote')} />}
            {deposit && <Row label={t('tool.moveIn.rowDeposit')} value={rent} note={t('tool.moveIn.rowDepositNote')} />}
            {lockFee > 0 && <Row label={t('tool.moveIn.rowLock')} value={lockFee} />}
            {brokerFee > 0 && <Row label={t('tool.moveIn.rowBroker')} value={brokerFee} note={t('tool.moveIn.rowBrokerNote')} />}
          </ul>
          <div className="rounded-lg border border-[var(--color-accent-green)]/40 bg-[var(--color-accent-green)]/10 p-3 text-sm">
            <p className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-accent-green)]" aria-hidden="true" />
              <span>
                <strong>{t('tool.moveIn.helpTitle')}</strong> {t('tool.moveIn.helpBody')}{' '}
                <Link href="/resources" className="font-semibold text-[var(--color-accent-primary)] underline decoration-dotted underline-offset-2">{t('tool.moveIn.seeListing')}</Link>.
              </span>
            </p>
          </div>
          <Cite id="masslegal" note={t('tool.moveIn.cite')} href="https://www.masslegalhelp.org/housing-apartments-shelter/security-deposits" />
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value, note }: { label: string; value: number; note?: string }) {
  const { format } = useI18n();
  return (
    <li className="rounded-lg border border-[var(--color-border)]/70 px-3 py-2">
      <div className="flex items-baseline justify-between gap-3">
        <span>{label}</span>
        <span className="font-mono font-semibold">{format.currency(value, { cents: true })}</span>
      </div>
      {note && <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{note}</p>}
    </li>
  );
}

/* ───────────────────────────── Benefits screener ─────────────────────── */

/**
 * 2026 thresholds, checked 4 October 2026. Each line names its publisher so
 * the number can be checked and updated in one place when the agencies
 * re-issue them.
 *  - Federal poverty guideline, 2026 (HHS, effective 13 January 2026):
 *    $15,960 for 1, +$5,680 each extra person.
 *  - SNAP (MA, BBCE): gross income ≤ 200% FPL.
 *  - MassHealth Standard, adults: ≤ 133% FPL (138% with the 5% disregard).
 *  - LIHEAP / Fuel Assistance (MA, program year 2027): ≤ 60% state median
 *    income, the published table by household size below (the publisher's
 *    chart runs past size 8; this screener caps household size at 8).
 *  - MBTA Reduced Fare (Income-Eligible): ≤ 200% FPL, ages 18–64.
 *  - Boston Lifeline / ConnectAll and Good Neighbor Energy Fund omitted:
 *    their rules are administered case by case.
 */
const FPL_2026 = (size: number) => 15960 + 5680 * (Math.max(1, size) - 1);
const LIHEAP_2027: Record<number, number> = { 1: 53585, 2: 70073, 3: 86561, 4: 103049, 5: 119536, 6: 136024, 7: 139116, 8: 142207 };
/**
 * HUD FY2026 low-income (80%) limits for the Boston-Cambridge-Quincy HMFA,
 * 1–8 persons, as published in the FY2026 Section 8 workbook — 1.6 × the
 * 50% limits, rounded to $50. (MassHousing's Workforce Housing sheet prints a
 * slightly higher uncapped 80% series for sizes 7–8; the city's Boston-only
 * income-restricted lotteries use these HUD figures.)
 */
const HUD_BOSTON_80 = [96000, 109700, 123400, 137100, 148100, 159050, 170050, 181000];

/** Programme copy lives in the dictionary so every line of the screener is translated. */
const PROGRAM_KEY: Record<string, { name: TranslationKey; rule: TranslationKey; apply: TranslationKey }> = {
  snap: { name: 'tool.prog.snap', rule: 'tool.prog.snapRule', apply: 'tool.prog.snapApply' },
  masshealth: { name: 'tool.prog.masshealth', rule: 'tool.prog.masshealthRule', apply: 'tool.prog.masshealthApply' },
  liheap: { name: 'tool.prog.liheap', rule: 'tool.prog.liheapRule', apply: 'tool.prog.liheapApply' },
  mbta: { name: 'tool.prog.mbta', rule: 'tool.prog.mbtaRule', apply: 'tool.prog.mbtaApply' },
  lottery: { name: 'tool.prog.lottery', rule: 'tool.prog.lotteryRule', apply: 'tool.prog.lotteryApply' },
};

export function BenefitsScreener() {
  const { t, format } = useI18n();
  const [size, setSize] = useState(3);
  const [annual, setAnnual] = useState(42000);
  const [adultsUnder65, setAdultsUnder65] = useState(true);

  const fpl = FPL_2026(size);
  const ratio = annual / fpl;
  const liheapCap = LIHEAP_2027[Math.min(8, Math.max(1, size))];

  const rows = useMemo(
    () => [
      {
        key: 'snap',
        ok: ratio <= 2.0,
        cap: fpl * 2,
        href: 'https://www.mass.gov/snap-benefits-food-stamps',
        source: 'dta' as const,
      },
      {
        key: 'masshealth',
        ok: ratio <= 1.38,
        cap: Math.round(fpl * 1.38),
        href: 'https://www.mass.gov/masshealth',
        source: 'massgov' as const,
      },
      {
        key: 'liheap',
        ok: annual <= liheapCap,
        cap: liheapCap,
        href: 'https://www.mass.gov/how-to/apply-for-home-heating-assistance',
        source: 'massgov' as const,
      },
      {
        key: 'mbta',
        ok: ratio <= 2.0 && adultsUnder65,
        cap: fpl * 2,
        href: 'https://www.mbta.com/fares/reduced/income-eligible',
        source: 'mbta' as const,
      },
      {
        key: 'lottery',
        ok: annual <= HUD_BOSTON_80[Math.min(8, Math.max(1, size)) - 1],
        cap: HUD_BOSTON_80[Math.min(8, Math.max(1, size)) - 1],
        href: 'https://www.boston.gov/metrolist',
        source: 'hud' as const,
      },
    ],
    [ratio, fpl, annual, liheapCap, adultsUnder65, size]
  );

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-[var(--color-accent-green)]" aria-hidden="true" /> {t('tool.benefits.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-[var(--color-text-secondary)]">
            {t('tool.benefits.intro')}
          </p>
          <label className="block text-sm font-heading font-medium">
            {t('tool.benefits.size')}
            <input type="number" min={1} max={8} value={size} onChange={(e) => setSize(Math.max(1, Math.min(8, Number(e.target.value))))} className={cn(field, 'mt-1.5')} />
          </label>
          <label className="block text-sm font-heading font-medium">
            {t('tool.benefits.income')}
            <div className="relative mt-1.5">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">$</span>
              <input type="number" min={0} value={annual} onChange={(e) => setAnnual(Number(e.target.value))} className={cn(field, 'pl-8')} />
            </div>
          </label>
          <label className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] p-2.5 text-sm">
            <input type="checkbox" checked={adultsUnder65} onChange={(e) => setAdultsUnder65(e.target.checked)} className="h-4 w-4 accent-[var(--color-accent-primary)]" />
            {t('tool.benefits.adult')}
          </label>
          <div className="rounded-lg bg-[var(--color-bg-tertiary)] p-3 text-sm">
            <p>
              {t('tool.benefits.yourIncome', { percent: `${Math.round(ratio * 100)}%`, count: size, amount: format.currency(fpl, { cents: true }) })}
            </p>
          </div>
          <Cite id="massgov" note={t('tool.benefits.cite')} href="https://aspe.hhs.gov/topics/poverty-economic-mobility/poverty-guidelines" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('tool.benefits.programs')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {rows.map((row) => (
              <li key={row.key} className={cn('rounded-xl border p-3', row.ok ? 'border-[var(--color-accent-green)]/40 bg-[var(--color-accent-green)]/8' : 'border-[var(--color-border)]')}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-heading font-semibold">{t(PROGRAM_KEY[row.key].name)}</p>
                    <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">{t(PROGRAM_KEY[row.key].rule)}</p>
                  </div>
                  <span className={cn('shrink-0 rounded-full px-2 py-0.5 font-heading text-[11px] font-bold', row.ok ? 'bg-[var(--color-accent-green)] text-white' : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]')}>
                    {row.ok ? t('tool.benefits.mayQualify') : t('tool.benefits.overLimit')}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-[var(--color-text-muted)]">
                    {t('tool.benefits.limitFor', { size, amount: format.currency(row.cap, { cents: true }) })}
                  </span>
                  <a href={row.href} target="_blank" rel="noopener noreferrer" className="font-heading font-semibold text-[var(--color-accent-primary)] underline decoration-dotted underline-offset-2">
                    {t(PROGRAM_KEY[row.key].apply)}
                  </a>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-3 flex items-start gap-2 text-xs text-[var(--color-text-muted)]">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {t('tool.benefits.note')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

/* ───────────────────────────── Eviction timeline ─────────────────────── */

/** Steps are numbered so the copy can live in the dictionary, one key per field. */
const STEPS = ['1', '2', '3', '4', '5', '6'] as const;

export function EvictionTimeline() {
  const { t } = useI18n();
  const [open, setOpen] = useState(0);
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-[var(--color-accent-secondary)]" aria-hidden="true" /> {t('tool.eviction.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
            {t('tool.eviction.intro')}
          </p>
          <ol className="relative space-y-2 border-s-2 border-[var(--color-border)] ps-5">
            {STEPS.map((step, i) => (
              <li key={step} className="relative">
                <span
                  className={cn(
                    'absolute -start-[27px] top-3 grid h-5 w-5 place-items-center rounded-full border-2 bg-[var(--color-bg-secondary)] font-mono text-[10px] font-bold',
                    open === i ? 'border-[var(--color-accent-secondary)] text-[var(--color-accent-secondary)]' : 'border-[var(--color-border-strong)] text-[var(--color-text-muted)]'
                  )}
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <button
                  type="button"
                  aria-expanded={open === i}
                  onClick={() => setOpen(i)}
                  className={cn('w-full rounded-xl border p-3 text-left transition-colors', open === i ? 'border-[var(--color-accent-secondary)]/50 bg-[var(--color-accent-secondary)]/8' : 'border-[var(--color-border)] hover:bg-[var(--color-bg-tertiary)]')}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-heading font-semibold">{t(`tool.eviction.step${step}.title` as 'tool.eviction.step1.title')}</span>
                    <span className="shrink-0 font-mono text-xs text-[var(--color-text-muted)]">{t(`tool.eviction.step${step}.when` as 'tool.eviction.step1.when')}</span>
                  </div>
                  {open === i && (
                    <div className="mt-2 space-y-2 text-sm">
                      <p className="text-[var(--color-text-secondary)]">{t(`tool.eviction.step${step}.detail` as 'tool.eviction.step1.detail')}</p>
                      <p className="flex items-start gap-2 rounded-lg bg-[var(--color-bg-tertiary)] p-2.5">
                        <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-accent-secondary)]" aria-hidden="true" />
                        <span><strong>{t('tool.eviction.doThis')}</strong> {t(`tool.eviction.step${step}.action` as 'tool.eviction.step1.action')}</span>
                      </p>
                    </div>
                  )}
                </button>
              </li>
            ))}
          </ol>
          <Cite id="masslegal" note={t('tool.eviction.cite')} href="https://www.masslegalhelp.org/housing-apartments-shelter/eviction" className="mt-4" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-[var(--color-accent-primary)]" aria-hidden="true" /> {t('tool.legal.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <ul className="space-y-2">
            <li className="rounded-lg border border-[var(--color-border)] p-3">
              <p className="font-heading font-semibold">{t('tool.legal.gbls')}</p>
              <p className="text-xs text-[var(--color-text-secondary)]">{t('tool.legal.gblsBody')}</p>
              <a href="tel:+16173718234" className="font-mono text-[var(--color-accent-primary)]">(617) 371-1234</a>
            </li>
            <li className="rounded-lg border border-[var(--color-border)] p-3">
              <p className="font-heading font-semibold">{t('tool.legal.court')}</p>
              <p className="text-xs text-[var(--color-text-secondary)]">{t('tool.legal.courtBody')}</p>
            </li>
            <li className="rounded-lg border border-[var(--color-border)] p-3">
              <p className="font-heading font-semibold">{t('tool.legal.stability')}</p>
              <p className="text-xs text-[var(--color-text-secondary)]">{t('tool.legal.stabilityBody')}</p>
              <a href="tel:+16176354200" className="font-mono text-[var(--color-accent-primary)]">(617) 635-4200</a>
            </li>
            <li className="rounded-lg border border-[var(--color-border)] p-3">
              <p className="font-heading font-semibold">{t('tool.legal.counsel')}</p>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {t('tool.legal.counselBody')}
              </p>
            </li>
          </ul>
          <p className="text-xs text-[var(--color-text-muted)]">
            {t('tool.legal.disclaimer')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
