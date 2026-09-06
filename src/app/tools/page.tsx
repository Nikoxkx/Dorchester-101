'use client';

import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { cn, formatCurrency, calculateRentBurden, calculateAMIPercentage, getAMIBand } from '@/lib/utils';
import { HUD_AMI_FY2026 } from '@/data/programs';
import { useAppStore } from '@/stores/appStore';
import { useTranslation } from '@/lib/i18n';

const CHECKLIST_KEY = 'dor101-doc-checklist';

const DOCS = [
  { category: 'Identity', items: ['Photo ID', 'Social Security cards', 'Birth certificates'] },
  { category: 'Income', items: ['Last 4–8 weeks of pay stubs', 'Latest 1040', 'W-2s', 'SSI/SSDI letters', 'Unemployment', 'Child support'] },
  { category: 'Household', items: ['Lease or utility bill', 'Landlord reference', 'Custody papers if needed'] },
  { category: 'Assets', items: ['3 months of bank statements', 'Retirement statements', 'Car registration'] },
];

export default function ToolsPage() {
  const { language } = useAppStore();
  const { t } = useTranslation(language);
  const [tab, setTab] = useState<'rent' | 'ami' | 'documents'>('rent');
  const [monthlyIncome, setMonthlyIncome] = useState(4500);
  const [monthlyRent, setMonthlyRent] = useState(2000);
  const [householdSize, setHouseholdSize] = useState(2);
  const [annualIncome, setAnnualIncome] = useState(50000);
  const [checked, setChecked] = useState<string[]>([]);

  useEffect(() => {
    try { setChecked(JSON.parse(localStorage.getItem(CHECKLIST_KEY) || '[]')); } catch { /* */ }
  }, []);

  const toggleDoc = (item: string) => {
    const next = checked.includes(item) ? checked.filter((x) => x !== item) : [...checked, item];
    setChecked(next);
    localStorage.setItem(CHECKLIST_KEY, JSON.stringify(next));
  };

  const rentBurden = calculateRentBurden(monthlyIncome, monthlyRent);
  const amiPercentage = calculateAMIPercentage(householdSize, annualIncome);
  const amiBand = getAMIBand(amiPercentage);

  return (
    <MainLayout>
      <div className="max-w-4xl space-y-8">
        <header className="pb-7 border-b-2 border-[var(--charcoal)]">
          <p className="masthead-date mb-3">07 — Tools · calculators that never leave your device</p>
          <h1 className="font-display font-bold uppercase leading-[0.95] tracking-[0.005em] text-[clamp(1.9rem,4vw,3rem)] text-[var(--charcoal)]">{t('tools.title')}</h1>
          <p className="text-[15px] leading-relaxed text-[var(--ink-soft)] mt-3.5 max-w-2xl">
            {t('tools.description')} Nothing here sends your numbers anywhere — the math runs in
            this browser, on this device.
          </p>
        </header>

        <div className="flex gap-1 border-b border-[var(--line)]">
          {([
            ['rent', t('tools.rentBurden')],
            ['ami', t('tools.amiCalc')],
            ['documents', t('tools.documents')],
          ] as const).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} className={cn('px-4 py-2 text-sm font-bold border-b-2 -mb-px', tab === id ? 'border-[var(--red)]' : 'border-transparent text-[var(--muted)]')}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'rent' && (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="desk-panel p-4 space-y-4">
              <Input label="Monthly gross income" type="number" value={monthlyIncome} onChange={(e) => setMonthlyIncome(Number(e.target.value))} className="font-mono" />
              <Input label="Monthly rent" type="number" value={monthlyRent} onChange={(e) => setMonthlyRent(Number(e.target.value))} className="font-mono" />
              <p className="text-xs text-[var(--muted)]">The 30% line is HUD&apos;s guideline — many Dot renters live well above it. This is a planning number, not a judgment.</p>
            </div>
            <div className="desk-panel p-5 flex flex-col justify-between">
              <div>
                <p className="text-[11px] font-display font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Your rent takes</p>
                <p className="font-display text-6xl font-black text-[var(--charcoal)] leading-none mt-2">{rentBurden.percentage}%</p>
                <p className="font-display text-lg font-bold mt-2 text-[var(--red)]">{rentBurden.label}</p>
                <p className="text-sm mt-3 text-[var(--ink-soft)] leading-relaxed">
                  {rentBurden.status === 'affordable' && 'Within the HUD guideline — this rent leaves room for everything else.'}
                  {rentBurden.status === 'cost-burdened' && 'Above the 30% guideline. Look for income-restricted units, RAFT, or a rent negotiation before signing.'}
                  {rentBurden.status === 'severely-burdened' && 'Severely cost-burdened. Housing help exists — start with the housing listings and the RAFT program.'}
                </p>
              </div>
              {rentBurden.status !== 'affordable' && (
                <Button className="mt-5" variant="primary" onClick={() => { window.location.href = '/affordable-housing'; }}>
                  Housing guide
                </Button>
              )}
            </div>
          </div>
        )}

        {tab === 'ami' && (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="desk-panel p-4 space-y-4">
              <Select label="Household size" value={householdSize} onChange={(e) => setHouseholdSize(Number(e.target.value))}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <option key={n} value={n}>{n}</option>)}
              </Select>
              <Input label="Annual income" type="number" value={annualIncome} onChange={(e) => setAnnualIncome(Number(e.target.value))} className="font-mono" />
              <p className="text-xs text-[var(--muted)]">FY2026 100% AMI: {formatCurrency(HUD_AMI_FY2026.byHouseholdSize[householdSize].ami100)}</p>
            </div>
            <div className="desk-panel p-4">
              <p className="font-display text-5xl">{amiPercentage}%</p>
              <p className="font-bold mt-1">{amiBand}</p>
              <Button className="mt-4" onClick={() => { window.location.href = '/affordable-housing'; }}>Find housing at this band</Button>
            </div>
          </div>
        )}

        {tab === 'documents' && (
          <div className="desk-panel p-4 space-y-6">
            <p className="text-sm text-[var(--muted)]">Checks stay on this device only.</p>
            {DOCS.map((section) => (
              <div key={section.category}>
                <h3 className="font-bold mb-2">{section.category}</h3>
                <ul className="space-y-2">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <input type="checkbox" checked={checked.includes(item)} onChange={() => toggleDoc(item)} className="mt-1" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
