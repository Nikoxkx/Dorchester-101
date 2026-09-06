'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { CalendarClock, CheckCircle2, CircleAlert, Info, KeyRound, Scale, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Cite } from '@/components/sources/SourceMark';
import { cn, formatCurrency } from '@/lib/utils';

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
            <KeyRound className="h-5 w-5 text-[var(--color-accent-primary)]" aria-hidden="true" /> Move-in cost planner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-[var(--color-text-secondary)]">
            Massachusetts law limits what a landlord can collect before you move in to <strong>first month, last month, a security deposit no larger than one month, and the cost of a new lock</strong>. Anything else — an
            application fee, a pet deposit, a “holding fee” — is illegal to charge.
          </p>
          <label className="block text-sm font-heading font-medium">
            Monthly rent
            <div className="relative mt-1.5">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">$</span>
              <input type="number" min={0} value={rent} onChange={(e) => setRent(Number(e.target.value))} className={cn(field, 'pl-8')} />
            </div>
          </label>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] p-2.5 text-sm">
              <input type="checkbox" checked={lastMonth} onChange={(e) => setLastMonth(e.target.checked)} className="h-4 w-4 accent-[var(--color-accent-primary)]" />
              Landlord asks for last month
            </label>
            <label className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] p-2.5 text-sm">
              <input type="checkbox" checked={deposit} onChange={(e) => setDeposit(e.target.checked)} className="h-4 w-4 accent-[var(--color-accent-primary)]" />
              Landlord asks for a security deposit
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-heading font-medium">
              New lock / key fee
              <div className="relative mt-1.5">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">$</span>
                <input type="number" min={0} value={lockFee} onChange={(e) => setLockFee(Number(e.target.value))} className={cn(field, 'pl-8')} />
              </div>
            </label>
            <label className="block text-sm font-heading font-medium">
              Broker fee (if you hired a broker)
              <div className="relative mt-1.5">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">$</span>
                <input type="number" min={0} value={brokerFee} onChange={(e) => setBrokerFee(Number(e.target.value))} className={cn(field, 'pl-8')} />
              </div>
            </label>
          </div>
          <label className="block text-sm font-heading font-medium">
            Your household&apos;s monthly income (to see how many months this equals)
            <div className="relative mt-1.5">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">$</span>
              <input type="number" min={0} value={monthlyIncome} onChange={(e) => setMonthlyIncome(Number(e.target.value))} className={cn(field, 'pl-8')} />
            </div>
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What you should expect to pay</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl bg-[var(--color-bg-tertiary)] p-4 text-center">
            <p className="text-sm text-[var(--color-text-muted)]">Total due at signing</p>
            <p className="font-mono text-3xl font-bold">{formatCurrency(total)}</p>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              {monthlyIncome > 0 ? `${monthsOfIncome.toFixed(1)} months of your income` : 'Enter your income to compare'}
            </p>
          </div>
          <ul className="space-y-1.5 text-sm">
            <Row label="First month's rent" value={rent} />
            {lastMonth && <Row label="Last month's rent" value={rent} note="Landlord owes you 5% interest per year, or the bank rate, paid every year." />}
            {deposit && <Row label="Security deposit (max one month)" value={rent} note="Must be held in a separate Massachusetts bank account; you must get the bank name, account number and a signed statement of condition within 10 days." />}
            {lockFee > 0 && <Row label="New lock and key" value={lockFee} />}
            {brokerFee > 0 && <Row label="Broker fee" value={brokerFee} note="Legal only if a licensed broker actually worked for you. A landlord cannot charge one for showing their own unit." />}
          </ul>
          <div className="rounded-lg border border-[var(--color-accent-green)]/40 bg-[var(--color-accent-green)]/10 p-3 text-sm">
            <p className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-accent-green)]" aria-hidden="true" />
              <span>
                <strong>Can&apos;t cover it?</strong> RAFT (Residential Assistance for Families in Transition) can pay up to $7,000 toward move-in costs and back rent for eligible households. Metro Housing Boston handles applications for Dorchester.{' '}
                <Link href="/resources" className="font-semibold text-[var(--color-accent-primary)] underline decoration-dotted underline-offset-2">See the listing</Link>.
              </span>
            </p>
          </div>
          <Cite id="masslegal" note="M.G.L. c.186 §15B — Security deposits and last month's rent" href="https://www.masslegalhelp.org/housing-apartments-shelter/security-deposits" />
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value, note }: { label: string; value: number; note?: string }) {
  return (
    <li className="rounded-lg border border-[var(--color-border)]/70 px-3 py-2">
      <div className="flex items-baseline justify-between gap-3">
        <span>{label}</span>
        <span className="font-mono font-semibold">{formatCurrency(value)}</span>
      </div>
      {note && <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{note}</p>}
    </li>
  );
}

/* ───────────────────────────── Benefits screener ─────────────────────── */

/**
 * 2025 thresholds. Each line names its publisher so the number can be checked
 * and updated in one place when the agencies re-issue them.
 *  - Federal poverty guideline, 2025 (HHS): $15,650 for 1, +$5,500 each extra.
 *  - SNAP (MA, BBCE): gross income ≤ 200% FPL.
 *  - MassHealth Standard, adults: ≤ 133% FPL (138% with the 5% disregard).
 *  - LIHEAP / Fuel Assistance (MA DHCD): ≤ 60% state median income; the
 *    published 2024–25 table is approximated by household size below.
 *  - MBTA Reduced Fare (Income-Eligible): ≤ 200% FPL, ages 18–64.
 *  - Boston Lifeline / ConnectAll and Good Neighbor Energy Fund omitted:
 *    their rules are administered case by case.
 */
const FPL_2025 = (size: number) => 15650 + 5500 * (Math.max(1, size) - 1);
const LIHEAP_2025: Record<number, number> = { 1: 49196, 2: 64333, 3: 79469, 4: 94608, 5: 109745, 6: 124882, 7: 127720, 8: 130557 };

export function BenefitsScreener() {
  const [size, setSize] = useState(3);
  const [annual, setAnnual] = useState(42000);
  const [adultsUnder65, setAdultsUnder65] = useState(true);

  const fpl = FPL_2025(size);
  const ratio = annual / fpl;
  const liheapCap = LIHEAP_2025[Math.min(8, Math.max(1, size))];

  const rows = useMemo(
    () => [
      {
        name: 'SNAP (food benefits)',
        ok: ratio <= 2.0,
        rule: 'Gross income at or below 200% of the federal poverty level',
        cap: fpl * 2,
        apply: 'DTAConnect.com or call (877) 382-2363',
        href: 'https://www.mass.gov/snap-benefits-food-stamps',
        source: 'dta' as const,
      },
      {
        name: 'MassHealth (health coverage, adults)',
        ok: ratio <= 1.38,
        rule: 'Income at or below 138% of the poverty level for adults; children and pregnant people qualify at higher incomes',
        cap: Math.round(fpl * 1.38),
        apply: 'MAhealthconnector.org or call (800) 841-2900',
        href: 'https://www.mass.gov/masshealth',
        source: 'massgov' as const,
      },
      {
        name: 'Fuel Assistance (LIHEAP)',
        ok: annual <= liheapCap,
        rule: 'Income at or below 60% of the state median income; renters with heat included qualify too',
        cap: liheapCap,
        apply: 'ABCD Boston, (617) 357-6012, from November 1',
        href: 'https://www.mass.gov/how-to/apply-for-home-heating-assistance',
        source: 'massgov' as const,
      },
      {
        name: 'MBTA income-eligible reduced fare',
        ok: ratio <= 2.0 && adultsUnder65,
        rule: 'Ages 18–64 with income at or below 200% of the poverty level; half-price fares on every mode',
        cap: fpl * 2,
        apply: 'mbta.com/reducedfare or any CharlieCard store',
        href: 'https://www.mbta.com/fares/reduced/income-eligible',
        source: 'mbta' as const,
      },
      {
        name: 'Boston affordable-housing lotteries (80% AMI and below)',
        ok: annual <= [91900, 105000, 118100, 131150, 141650, 152150, 162650, 173100][Math.min(8, Math.max(1, size)) - 1] * 0.8,
        rule: 'Most income-restricted units are open to households at or below 80% of area median income',
        cap: Math.round([91900, 105000, 118100, 131150, 141650, 152150, 162650, 173100][Math.min(8, Math.max(1, size)) - 1] * 0.8),
        apply: 'Boston One Stop and MassAccess listings',
        href: 'https://www.boston.gov/departments/housing/boston-one-stop',
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
            <CheckCircle2 className="h-5 w-5 text-[var(--color-accent-green)]" aria-hidden="true" /> Benefits screener
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-[var(--color-text-secondary)]">
            Enter your household and yearly income before taxes. This checks the published income limits only; each program also has its own rules about assets, immigration status and household
            makeup. A green line means <em>apply</em>, not <em>approved</em>.
          </p>
          <label className="block text-sm font-heading font-medium">
            People in your household
            <input type="number" min={1} max={8} value={size} onChange={(e) => setSize(Math.max(1, Math.min(8, Number(e.target.value))))} className={cn(field, 'mt-1.5')} />
          </label>
          <label className="block text-sm font-heading font-medium">
            Household income per year, before taxes
            <div className="relative mt-1.5">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">$</span>
              <input type="number" min={0} value={annual} onChange={(e) => setAnnual(Number(e.target.value))} className={cn(field, 'pl-8')} />
            </div>
          </label>
          <label className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] p-2.5 text-sm">
            <input type="checkbox" checked={adultsUnder65} onChange={(e) => setAdultsUnder65(e.target.checked)} className="h-4 w-4 accent-[var(--color-accent-primary)]" />
            An adult aged 18–64 lives here
          </label>
          <div className="rounded-lg bg-[var(--color-bg-tertiary)] p-3 text-sm">
            <p>
              Your income is <strong>{Math.round(ratio * 100)}%</strong> of the 2025 federal poverty level for {size} {size === 1 ? 'person' : 'people'} ({formatCurrency(fpl)}).
            </p>
          </div>
          <Cite id="massgov" note="HHS 2025 poverty guidelines; program limits as published by each agency" href="https://aspe.hhs.gov/topics/poverty-economic-mobility/poverty-guidelines" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Programs to look at</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {rows.map((row) => (
              <li key={row.name} className={cn('rounded-xl border p-3', row.ok ? 'border-[var(--color-accent-green)]/40 bg-[var(--color-accent-green)]/8' : 'border-[var(--color-border)]')}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-heading font-semibold">{row.name}</p>
                    <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">{row.rule}</p>
                  </div>
                  <span className={cn('shrink-0 rounded-full px-2 py-0.5 font-heading text-[11px] font-bold', row.ok ? 'bg-[var(--color-accent-green)] text-white' : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]')}>
                    {row.ok ? 'May qualify' : 'Over the limit'}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-[var(--color-text-muted)]">
                    Limit for {size}: <span className="font-mono">{formatCurrency(row.cap)}</span>/yr
                  </span>
                  <a href={row.href} target="_blank" rel="noopener noreferrer" className="font-heading font-semibold text-[var(--color-accent-primary)] underline decoration-dotted underline-offset-2">
                    {row.apply}
                  </a>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-3 flex items-start gap-2 text-xs text-[var(--color-text-muted)]">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            Applying for SNAP or MassHealth does not affect immigration status under the current public-charge rule, and using them is never reported to landlords. Free help with applications is listed in the directory.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

/* ───────────────────────────── Eviction timeline ─────────────────────── */

const STEPS: Array<{ title: string; when: string; detail: string; action: string }> = [
  {
    title: 'Notice to Quit',
    when: 'Day 0',
    detail:
      'For non-payment: 14 days. For no-fault or lease violations: 30 days, or one full rental period if longer. The notice must be in writing. You do not have to leave when it expires; only a judge can order you out.',
    action: 'Do not move. Pay if you can — paying all rent owed before the answer date ends a non-payment case for tenants with a lease.',
  },
  {
    title: 'Summons and Complaint served',
    when: 'After the notice expires',
    detail:
      'A constable or sheriff delivers court papers. They list an “entry date”; your Answer is due the Monday after that, and the first court event is typically about two weeks later.',
    action: 'Read the entry date. Apply for RAFT now — a pending application can pause the case under the state’s eviction-diversion rules.',
  },
  {
    title: 'File your Answer',
    when: 'The Monday after the entry date',
    detail:
      'Your Answer raises defences (bad conditions, retaliation, discrimination, improper notice) and counterclaims. Filing it is what gets you a trial instead of a default judgment.',
    action: 'Use MADE (gbls.org/MADE) — a free guided form — or the Housing Court’s Lawyer for the Day desk.',
  }, 
  {
    title: 'First Tier Court Event: mediation',
    when: '~2 weeks after entry',
    detail: 'You meet a Housing Specialist, not a judge. Most cases end here in a written agreement — a payment plan, repairs, or a move-out date you choose.',
    action: 'Do not sign an agreement you cannot keep; a missed payment can restart the eviction with no new trial.',
  },
  {
    title: 'Trial',
    when: 'If mediation fails',
    detail: 'A judge or jury hears the case. Landlords must prove every step was done correctly. Tenants who filed an Answer and appear win or settle a large share of cases.',
    action: 'Bring photos, texts, receipts, inspection reports. Ask for a jury if you want one — you must ask in the Answer.',
  },
  {
    title: 'Judgment and Execution',
    when: '10 days after judgment, at the earliest',
    detail:
      'If the landlord wins, they must wait 10 days, then obtain an “execution” — the document that lets a sheriff move you out with 48 hours’ notice. Judges can grant up to 6 months to stay (12 for people over 60 or with disabilities).',
    action: 'File a Motion to Stay. Call 211 or Boston’s Office of Housing Stability for emergency shelter and relocation help.',
  },
];

export function EvictionTimeline() {
  const [open, setOpen] = useState(0);
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-[var(--color-accent-secondary)]" aria-hidden="true" /> What happens after a notice to quit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
            The Massachusetts “summary process” has fixed steps and minimum waiting periods. Knowing where you are tells you how much time you have and what to do next. Click a step.
          </p>
          <ol className="relative space-y-2 border-s-2 border-[var(--color-border)] ps-5">
            {STEPS.map((step, i) => (
              <li key={step.title} className="relative">
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
                    <span className="font-heading font-semibold">{step.title}</span>
                    <span className="shrink-0 font-mono text-xs text-[var(--color-text-muted)]">{step.when}</span>
                  </div>
                  {open === i && (
                    <div className="mt-2 space-y-2 text-sm">
                      <p className="text-[var(--color-text-secondary)]">{step.detail}</p>
                      <p className="flex items-start gap-2 rounded-lg bg-[var(--color-bg-tertiary)] p-2.5">
                        <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-accent-secondary)]" aria-hidden="true" />
                        <span><strong>Do this:</strong> {step.action}</span>
                      </p>
                    </div>
                  )}
                </button>
              </li>
            ))}
          </ol>
          <Cite id="masslegal" note="Summary process, M.G.L. c.239 and Uniform Summary Process Rules" href="https://www.masslegalhelp.org/housing-apartments-shelter/eviction" className="mt-4" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-[var(--color-accent-primary)]" aria-hidden="true" /> Free legal help, right now
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <ul className="space-y-2">
            <li className="rounded-lg border border-[var(--color-border)] p-3">
              <p className="font-heading font-semibold">Greater Boston Legal Services</p>
              <p className="text-xs text-[var(--color-text-secondary)]">Free representation for income-eligible tenants. Eviction intake line.</p>
              <a href="tel:+16173718234" className="font-mono text-[var(--color-accent-primary)]">(617) 371-1234</a>
            </li>
            <li className="rounded-lg border border-[var(--color-border)] p-3">
              <p className="font-heading font-semibold">Eastern Housing Court — Lawyer for the Day</p>
              <p className="text-xs text-[var(--color-text-secondary)]">Free attorney at the courthouse on hearing days. Arrive by 8:30 AM. 24 New Chardon St, Boston.</p>
            </li>
            <li className="rounded-lg border border-[var(--color-border)] p-3">
              <p className="font-heading font-semibold">City of Boston Office of Housing Stability</p>
              <p className="text-xs text-[var(--color-text-secondary)]">Case managers, emergency funds, relocation help. Speaks your language on request.</p>
              <a href="tel:+16176356257" className="font-mono text-[var(--color-accent-primary)]">(617) 635-4200</a>
            </li>
            <li className="rounded-lg border border-[var(--color-border)] p-3">
              <p className="font-heading font-semibold">Right to counsel</p>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Boston does not yet guarantee a lawyer in eviction cases, but tenants with a lawyer stay housed far more often. Ask for one at every step.
              </p>
            </li>
          </ul>
          <p className="text-xs text-[var(--color-text-muted)]">
            This is general information about Massachusetts procedure, not legal advice about your case. Dates in your papers control.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
