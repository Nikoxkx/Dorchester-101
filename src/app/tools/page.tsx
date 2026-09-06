'use client';

import { useEffect, useMemo, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAppStore } from '@/stores/appStore';
import { useTranslation } from '@/lib/i18n';
import { useToast } from '@/stores/toastStore';
import { GlassButton, GlassSegmented } from '@/components/glass/GlassControls';
import { calculateRentBurden, calculateAMIPercentage, getAMIBand } from '@/lib/utils';
import { HUD_AMI_FY2026, RAFT_PROGRAM } from '@/data/programs';
import { formatFor } from '@/lib/i18n';
import { CheckCircle2, Circle, Printer, RotateCcw, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const CHECKLIST_KEY = 'dor101-checklist';

const DOCUMENTS = [
  'Photo ID for every adult',
  'Social Security cards (or ITIN) for everyone',
  'Proof of income: 4 recent pay stubs',
  'Benefits letters: SSI/SSDI, MassHealth, child support',
  'Birth certificates for children',
  'Current lease or letter from landlord',
  'Last 2 months of bank statements',
  'Utility bill with your name and address',
] as const;

export default function ToolsPage() {
  return (
    <MainLayout>
      <ToolsView />
    </MainLayout>
  );
}

function ToolsView() {
  const { language } = useAppStore();
  const { t } = useTranslation(language);
  const [tab, setTab] = useState<'rent' | 'ami' | 'documents'>('rent');

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-large font-bold tracking-tight text-1">{t('tools.title')}</h1>
        <p className="text-title3 text-text-2 mt-1.5 max-w-2xl leading-snug">{t('tools.description')}</p>
      </header>

      <GlassSegmented
        ariaLabel={t('tools.title')}
        value={tab}
        onChange={setTab}
        options={[
          { value: 'rent', label: t('tools.rentBurden') },
          { value: 'ami', label: t('tools.amiCalc') },
          { value: 'documents', label: t('tools.documents') },
        ]}
      />

      {tab === 'rent' && <RentBurdenCalc />}
      {tab === 'ami' && <AmiCalc />}
      {tab === 'documents' && <DocumentChecklist />}

      <p className="text-caption2 text-text-3 flex items-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5" aria-hidden />
        {t('settings.noDataCollected')} · {t('tools.checklist.savedLocally')}
      </p>
    </div>
  );
}

function RentBurdenCalc() {
  const { language } = useAppStore();
  const { t, formatFor } = useTranslation(language);
  const [income, setIncome] = useState(3600);
  const [rent, setRent] = useState(1800);

  const { percentage, status } = calculateRentBurden(income, rent);
  const statusText =
    status === 'affordable' ? t('tools.rentResult.affordable')
    : status === 'cost-burdened' ? t('tools.rentResult.burdened')
    : t('tools.rentResult.severe');
  const tone = status === 'affordable' ? 'text-success' : status === 'cost-burdened' ? 'text-warning' : 'text-danger';
  const barTone = status === 'affordable' ? 'bg-success-fill' : status === 'cost-burdened' ? 'bg-warning-fill' : 'bg-danger-fill';

  return (
    <section className="content-card squircle p-5 md:p-7">
      <div className="grid md:grid-cols-2 gap-7">
        <div className="space-y-5">
          <NumberField
            id="monthly-income"
            label={t('tools.monthlyIncome')}
            value={income}
            onChange={setIncome}
            prefix="$"
          />
          <NumberField
            id="monthly-rent"
            label={t('tools.monthlyRent')}
            value={rent}
            onChange={setRent}
            prefix="$"
          />
          <div>
            <div className="flex justify-between text-caption2 font-semibold text-text-2 num">
              <span>0%</span>
              <span>30%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
            <div className="mt-1 h-3 rounded-full bg-[var(--surface-2)] overflow-hidden relative" aria-hidden>
              <div
                className={cn('absolute inset-y-0 start-0 rounded-full transition-all', barTone)}
                style={{ width: `${Math.min(100, percentage)}%` }}
              />
              <div className="absolute inset-y-0" style={{ insetInlineStart: '30%', width: 2, background: 'var(--separator-strong)' }} />
              <div className="absolute inset-y-0" style={{ insetInlineStart: '50%', width: 2, background: 'var(--separator-strong)' }} />
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-subhead text-text-2">{t('tools.rentBurden')}</p>
          <p className="text-[3.4rem] leading-none font-bold text-1 num mt-1" aria-live="polite">
            {formatFor.percent(percentage / 100)}
          </p>
          <p className={cn('text-body font-bold mt-1.5', tone)}>{statusText}</p>
          <p className="text-caption text-text-2 mt-4 leading-relaxed">{t('tools.rentExplainer')}</p>
          <p className="text-caption2 text-text-3 mt-3">
            {t('common.source')}: {RAFT_PROGRAM.source} · RAFT {t('common.asOf')} {formatFor.date('2026-07-30')}
          </p>
        </div>
      </div>
    </section>
  );
}

function AmiCalc() {
  const { language } = useAppStore();
  const { t, formatFor } = useTranslation(language);
  const [size, setSize] = useState(3);
  const [income, setIncome] = useState(65000);

  const pct = calculateAMIPercentage(size, income);
  const band = getAMIBand(pct);
  const limits = HUD_AMI_FY2026.byHouseholdSize[Math.min(Math.max(size, 1), 8)];

  return (
    <section className="content-card squircle p-5 md:p-7">
      <div className="grid md:grid-cols-2 gap-7">
        <div className="space-y-5">
          <div>
            <label htmlFor="ami-size" className="text-subhead font-semibold text-1 block mb-2">
              {t('tools.householdSize')}
            </label>
            <input
              id="ami-size"
              type="range"
              min={1}
              max={8}
              step={1}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full accent-black dark:accent-white"
              aria-valuetext={t('common.household', { n: size })}
            />
            <p className="text-caption text-text-2 mt-1 num">{t('common.household', { n: size })}</p>
          </div>
          <NumberField
            id="ami-income"
            label={t('tools.annualIncome')}
            value={income}
            onChange={setIncome}
            prefix="$"
          />
          <p className="text-caption2 text-text-3">
            {HUD_AMI_FY2026.source} · {HUD_AMI_FY2026.area} · {t('common.asOf')}{' '}
            {formatFor.date(HUD_AMI_FY2026.effectiveDate)}
          </p>
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-subhead text-text-2">{t('tools.amiVar.label')}</p>
          <p className="text-[3.4rem] leading-none font-bold text-1 num mt-1" aria-live="polite">{pct}%</p>
          <p className="text-body font-bold text-1 mt-1">{band} · {t('tools.amiVar.ofAmi')}</p>
          <ul className="mt-5 space-y-1.5">
            {([30, 50, 60, 80, 100] as const).map((b) => (
              <li key={b} className="flex items-center gap-2.5">
                <span className={cn('text-caption2 font-bold w-12 num', pct <= b ? 'text-1' : 'text-text-3')}>
                  {b}% AMI
                </span>
                <span className="flex-1 h-2 rounded-full bg-[var(--surface-2)] overflow-hidden" aria-hidden>
                  <span
                    className={cn('block h-full rounded-full', pct <= b ? 'bg-ink' : 'bg-[var(--separator-strong)]')}
                    style={{ width: `${Math.min(100, (pct / b) * 100)}%` }}
                  />
                </span>
                <span className="text-caption text-text-2 w-24 text-end num">
                  {formatFor.currency(b === 30 ? limits.ami30 : b === 50 ? limits.ami50 : b === 60 ? limits.ami60 : b === 80 ? limits.ami80 : limits.ami100)}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-caption text-text-2 mt-4 leading-relaxed">{t('tools.amivar.bandsHint')}</p>
        </div>
      </div>
    </section>
  );
}

function NumberField({
  id, label, value, onChange, prefix,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-subhead font-semibold text-1 block mb-2">
        {label}
      </label>
      <div className="flex items-center gap-2">
        {prefix && <span className="text-subhead font-bold text-text-2 num">{prefix}</span>}
        <input
          id={id}
          type="number"
          min={0}
          step={prefix ? 50 : 1}
          value={value || ''}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
          className="w-full bg-[var(--surface)] rounded-[var(--radius-sm)] px-4 h-12 text-body font-bold text-1 num outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-current"
        />
      </div>
    </div>
  );
}

function DocumentChecklist() {
  const { language } = useAppStore();
  const { t } = useTranslation(language);
  const toast = useToast();
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      try {
        const raw = JSON.parse(localStorage.getItem(CHECKLIST_KEY) ?? '[]') as number[];
        setChecked(new Set(raw));
      } catch {
        setChecked(new Set());
      }
      setHydrated(true);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const toggle = (i: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      try {
        localStorage.setItem(CHECKLIST_KEY, JSON.stringify([...next]));
      } catch {
        // private mode — state still works for this session
      }
      return next;
    });
    toast(t('common.saved'), 'success');
  };

  const done = checked.size;

  return (
    <section className="content-card squircle p-5 md:p-7 print-block">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-title2 font-bold text-1">{t('tools.checklist.items')}</h2>
        <p className="text-subhead font-bold text-1 num" aria-live="polite">
          {t('tools.checklist.progress', { done, total: DOCUMENTS.length })}
        </p>
      </div>

      <ul className="mt-5 space-y-1">
        {DOCUMENTS.map((doc, i) => {
          const isChecked = checked.has(i);
          return (
            <li key={doc}>
              <button
                onClick={() => toggle(i)}
                role="checkbox"
                aria-checked={isChecked}
                className={cn(
                  'w-full flex items-center gap-3.5 rounded-[var(--radius-sm)] px-3.5 py-3.5 text-start',
                  'transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-current',
                  'hover:bg-[var(--surface)]',
                  isChecked && 'opacity-70',
                )}
              >
                {isChecked ? (
                  <CheckCircle2 className="w-5 h-5 text-success shrink-0" strokeWidth={2} aria-hidden />
                ) : (
                  <Circle className="w-5 h-5 text-text-3 shrink-0" strokeWidth={2} aria-hidden />
                )}
                <span className={cn('text-subhead', isChecked ? 'text-text-2 line-through' : 'text-1 font-medium')}>
                  {doc}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="flex gap-2 mt-5 no-print">
        <GlassButton
          size="sm"
          onClick={() => {
            setChecked(new Set());
            try {
              localStorage.removeItem(CHECKLIST_KEY);
            } catch {
              // ignore
            }
            toast(t('tools.checklist.reset'), 'neutral');
          }}
          icon={<RotateCcw className="w-4 h-4" aria-hidden />}
        >
          {t('tools.checklist.reset')}
        </GlassButton>
        <GlassButton size="sm" onClick={() => window.print()} icon={<Printer className="w-4 h-4" aria-hidden />}>
          {t('common.print')}
        </GlassButton>
      </div>
      <p className="text-caption2 text-text-3 mt-4">{t('tools.checklist.savedLocally')}</p>
      <span hidden aria-hidden>{String(hydrated)}</span>
    </section>
  );
}
