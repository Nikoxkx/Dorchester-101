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
      <div className="max-w-3xl space-y-8">
        <header className="border-b-2 border-[var(--ink)] pb-4">
          <p className="kicker">Pencil math</p>
          <h1 className="font-display text-4xl">{t('tools.title')}</h1>
          <p className="text-[var(--muted)] mt-2">{t('tools.description')}</p>
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
            </div>
            <div className="desk-panel p-4">
              <p className="font-display text-5xl">{rentBurden.percentage}%</p>
              <p className="font-bold mt-1">{rentBurden.label}</p>
              <p className="text-sm mt-3 text-[var(--ink-soft)]">
                HUD treats 30% as affordable. Over 50% is severe. This is a screening number, not a denial.
              </p>
              {rentBurden.status !== 'affordable' && (
                <Button className="mt-4" onClick={() => { window.location.href = '/affordable-housing'; }}>
                  Housing desk
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
