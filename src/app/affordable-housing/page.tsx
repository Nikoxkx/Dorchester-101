'use client';

import { useMemo, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { AMIBadge, Badge, StatusBadge } from '@/components/ui/Badge';
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
    applicationDeadline?: string | null;
    propertyManagerPhone: string;
    applyUrl: string;
    transitAccess: string;
    notes: string;
  }[];
  bha: { section8TenantBased: string; publicHousing: string; note: string; asOf: string; applyUrl: string; phone: string; source: string };
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
        <header className="pb-6 border-b border-[var(--line)]">
          <p className="kicker mb-3">Housing desk</p>
          <h1 className="font-display text-[clamp(2.4rem,5vw,4.25rem)] font-black leading-[0.95] tracking-[-0.03em] text-[var(--charcoal)]">Affordable <span className="text-[var(--red)]">housing</span></h1>
          <p className="text-[var(--ink-soft)] mt-4 max-w-2xl leading-relaxed">
            Income-restricted apartments across the Dot — every listing checked against BPDA, BHA,
            or HUD records, with a real phone and an application link. If a waitlist is open, it
            says so here. Rents, AMI math, and lotteries included.
          </p>
          <div className="flex flex-wrap gap-2 mt-5">
            <Badge variant="green">Public housing waitlist: open</Badge>
            <Badge variant="red">Section 8 (tenant-based): closed</Badge>
            <Badge variant="amber">RAFT: up to $7,000 / 12 mo</Badge>
          </div>
        </header>

        {data?.bha && (
          <aside className="desk-card p-5 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <p className="kicker">Boston Housing Authority · as of {data.bha.asOf}</p>
              <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--muted)]">{data.bha.source}</span>
            </div>
            <p className="font-display text-xl md:text-2xl font-bold text-[var(--charcoal)] leading-snug">
              Tenant-based Section 8: <span className="text-[var(--red)]">{data.bha.section8TenantBased}</span> ·
              Public housing: <span className="text-[var(--sage)]">{data.bha.publicHousing}</span>
            </p>
            <p className="text-sm text-[var(--ink-soft)] mt-2 leading-relaxed">{data.bha.note}</p>
            <div className="flex flex-wrap gap-3 mt-4">
              <a href={telHref(data.bha.phone)} className="cta cta-outline cta-md">Call {data.bha.phone}</a>
              <a href={data.bha.applyUrl} target="_blank" rel="noreferrer" className="cta cta-primary cta-md">Apply at boston.myhousing.com</a>
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
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <a href={telHref(listing.propertyManagerPhone)} className="text-sm font-bold underline underline-offset-2 hover:text-[var(--red)]">{listing.propertyManagerPhone}</a>
                  <a href={listing.applyUrl} target="_blank" rel="noreferrer" className="cta cta-dark cta-sm">Apply / open source</a>
                  {listing.applicationDeadline && (
                    <span className="text-xs text-[var(--muted)]">Deadline: {new Date(listing.applicationDeadline).toLocaleDateString()}</span>
                  )}
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
