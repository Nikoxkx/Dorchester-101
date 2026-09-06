'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { AMIBadge, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { cn, formatCurrency, calculateAMIPercentage, getAMIBand, telHref } from '@/lib/utils';
import { HUD_AMI_FY2026 } from '@/data/programs';
import { useApi } from '@/hooks/useApi';
import { useAppStore } from '@/stores/appStore';
import { useTranslation } from '@/lib/i18n';

interface HousingPayload {
  listings: {
    id: string;
    propertyName: string;
    address: string;
    neighborhood: string;
    unitTypes: { type: string; count: number; rent: number | null }[];
    amiRequired: number;
    waitlistStatus: 'available' | 'waitlist_open' | 'waitlist_closed' | 'lottery' | 'check_source';
    propertyManagerPhone: string;
    applyUrl: string;
    transitAccess: string;
    notes: string;
  }[];
  bha: { section8TenantBased: string; publicHousing: string; note: string; asOf: string; applyUrl: string; phone: string };
  raft: { maxBenefit: number; note: string; sourceUrl: string };
}

export default function AffordableHousingPage() {
  const { language } = useAppStore();
  const { t } = useTranslation(language);
  const { data, loading, error, reload } = useApi<HousingPayload>('/api/housing');
  const [tab, setTab] = useState<'listings' | 'learn' | 'calculator'>('listings');
  const [householdSize, setHouseholdSize] = useState(2);
  const [annualIncome, setAnnualIncome] = useState(50000);
  const [filterAmi, setFilterAmi] = useState<number | null>(null);

  const amiPercentage = calculateAMIPercentage(householdSize, annualIncome);
  const amiBand = getAMIBand(amiPercentage);
  const listings = (data?.listings || []).filter((l) => !filterAmi || l.amiRequired <= filterAmi);

  const amiRows = useMemo(() => [1, 2, 3, 4, 5, 6].map((size) => {
    const b = HUD_AMI_FY2026.byHouseholdSize[size];
    return { size, ...b };
  }), []);

  return (
    <MainLayout>
      <div className="space-y-8">
        <header className="relative border-b-3 border-[var(--ink)] pb-6 overflow-hidden">
          <div aria-hidden className="absolute top-0 right-0 w-32 h-32 -translate-y-1/2 translate-x-1/4 opacity-[0.06] pointer-events-none">
            <svg viewBox="0 0 200 200" className="w-full h-full"><rect width="200" height="200" fill="var(--ink)" /><circle cx="100" cy="100" r="70" fill="none" stroke="var(--ink)" strokeWidth="3" /></svg>
          </div>
          <p className="masthead-date mb-2">Housing Desk · Updated 6 Sept 2026</p>
          <h1 className="font-display text-5xl md:text-6xl tracking-[-0.045em] leading-[0.92]">Affordable<br /><span className="italic">Housing</span></h1>
          <p className="text-[var(--ink-soft)] mt-3 max-w-2xl leading-relaxed">Income-restricted listings with AMI breakdowns. No generic listings — every property is verified against BPDA, BHA, or HUD records, with real application links.</p>
        </header>

        {data?.bha && (
          <aside className="desk-panel p-4">
            <p className="kicker">BHA as of {data.bha.asOf}</p>
            <p className="font-display text-xl mt-1">
              Tenant-based Section 8 is {data.bha.section8TenantBased}. Public housing is {data.bha.publicHousing}.
            </p>
            <p className="text-sm text-[var(--ink-soft)] mt-2">{data.bha.note}</p>
              <div className="flex flex-wrap gap-3 mt-3">
              <a href={telHref(data.bha.phone)} className="underline text-sm">{data.bha.phone}</a>
              <a href={data.bha.applyUrl} target="_blank" rel="noreferrer" className="bg-[var(--red)] text-white px-3 py-1.5 text-sm font-bold">boston.myhousing.com</a>
              <Link href="/college-access" className="border border-[var(--ink)] text-sm px-3 py-1.5 font-bold hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors">College Pathway →</Link>
            </div>
          </aside>
        )}

        <div className="flex gap-1 border-b border-[var(--line)]">
          {([
            ['listings', t('housing.findHousing')],
            ['learn', t('housing.howItWorks')],
            ['calculator', t('housing.amiCalculator')],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                'px-4 py-2 text-sm font-bold border-b-2 -mb-px',
                tab === id ? 'border-[var(--red)]' : 'border-transparent text-[var(--muted)]',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'listings' && (
          <div className="space-y-4">
            <select
              value={filterAmi || ''}
              onChange={(e) => setFilterAmi(e.target.value ? Number(e.target.value) : null)}
              className="px-3 py-2 bg-[var(--surface)] border border-[var(--line)] text-sm"
            >
              <option value="">All AMI bands</option>
              <option value="30">30% AMI or below</option>
              <option value="50">50% AMI or below</option>
              <option value="60">60% AMI or below</option>
              <option value="80">80% AMI or below</option>
            </select>
            {loading && <LoadingSpinner />}
            {error && <button onClick={reload} className="underline">{t('common.retry')}</button>}
            {listings.map((listing) => (
              <article key={listing.id} className="desk-panel p-4 space-y-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="font-display text-xl">{listing.propertyName}</h2>
                    <p className="text-sm text-[var(--muted)]">{listing.neighborhood} · {listing.address}</p>
                  </div>
                  <StatusBadge status={listing.waitlistStatus} />
                </div>
                <div className="flex items-center gap-2">
                  <AMIBadge percentage={listing.amiRequired} />
                  <span className="text-xs text-[var(--muted)]">At or below {listing.amiRequired}% AMI</span>
                </div>
                <p className="text-sm">{listing.notes}</p>
                <p className="text-sm text-[var(--muted)]">Transit: {listing.transitAccess}</p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <a href={telHref(listing.propertyManagerPhone)} className="underline text-sm">{listing.propertyManagerPhone}</a>
                  <a href={listing.applyUrl} target="_blank" rel="noreferrer" className="bg-[var(--ink)] text-[var(--paper)] px-3 py-1.5 text-sm font-bold">Apply / open source</a>
                </div>
              </article>
            ))}
          </div>
        )}

        {tab === 'learn' && (
          <div className="space-y-6 text-sm leading-relaxed">
            <section>
              <h2 className="font-display text-2xl mb-2">Income-restricted housing</h2>
              <p>Rents are set below market because a public agency or a tax credit paid for part of the building. Your household income has to sit at or under a percent of AMI. That is not the same as public housing — public housing is BHA, rent usually ~30% of income.</p>
            </section>
            <section>
              <h2 className="font-display text-2xl mb-2">FY2026 AMI (Boston metro)</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--ink)] text-left">
                      <th className="py-2">Size</th>
                      <th className="py-2 text-right">100%</th>
                      <th className="py-2 text-right">80%</th>
                      <th className="py-2 text-right">60%</th>
                      <th className="py-2 text-right">50%</th>
                      <th className="py-2 text-right">30%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {amiRows.map((row) => (
                      <tr key={row.size} className="border-b border-[var(--line)]">
                        <td className="py-2">{row.size}</td>
                        <td className="py-2 text-right font-mono">{formatCurrency(row.ami100)}</td>
                        <td className="py-2 text-right font-mono">{formatCurrency(row.ami80)}</td>
                        <td className="py-2 text-right font-mono">{formatCurrency(row.ami60)}</td>
                        <td className="py-2 text-right font-mono">{formatCurrency(row.ami50)}</td>
                        <td className="py-2 text-right font-mono">{formatCurrency(row.ami30)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-[var(--muted)] mt-2">Source: {HUD_AMI_FY2026.source}. Effective {HUD_AMI_FY2026.effectiveDate}.</p>
            </section>
            <ol className="space-y-2 list-decimal pl-5">
              <li>Run the AMI calculator.</li>
              <li>Gather ID, SSNs, pay stubs, bank statements.</li>
              <li>Apply to BHA public housing and watch MassAccess for lotteries.</li>
              <li>Call CSNDC, DBEDC, or VietAID about their own lists.</li>
            </ol>
            {data?.raft && (
              <p>RAFT: up to {formatCurrency(data.raft.maxBenefit)} in 12 months. {data.raft.note}</p>
            )}
          </div>
        )}

        {tab === 'calculator' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="desk-panel p-4 space-y-4">
              <label className="block text-sm font-bold">
                Household size
                <select value={householdSize} onChange={(e) => setHouseholdSize(Number(e.target.value))} className="mt-1 w-full px-3 py-2 bg-[var(--paper)] border border-[var(--line)]">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </label>
              <label className="block text-sm font-bold">
                Annual gross income
                <input type="number" value={annualIncome} onChange={(e) => setAnnualIncome(Number(e.target.value))} className="mt-1 w-full px-3 py-2 bg-[var(--paper)] border border-[var(--line)] font-mono" />
              </label>
              <p className="text-xs text-[var(--muted)]">Updates as you type. FY2026 100% AMI for this size: {formatCurrency(HUD_AMI_FY2026.byHouseholdSize[householdSize].ami100)}.</p>
            </div>
            <div className="desk-panel p-4">
              <p className="kicker">Result</p>
              <p className="font-display text-5xl mt-2">{amiPercentage}%</p>
              <p className="mt-1">of AMI — {amiBand}</p>
              <p className="text-sm mt-4">You can usually apply at this band or higher. A 50% AMI household can often apply for 50, 60, and 80% units.</p>
              <Button className="mt-4" onClick={() => setTab('listings')}>See the desk list</Button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
