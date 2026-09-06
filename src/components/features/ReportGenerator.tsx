'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, Calculator, FileText, RefreshCw } from '@/components/ui/icons';

interface ReportData {
  ami?: {
    householdSize: number;
    income: number;
    amiPct: number;
    band: string;
    ami100: number;
    source: string;
  };
  rent?: {
    fmrTwoBed: number;
    rentBurdenPercent: number;
    rentBurdenLabel: string;
  };
  directory?: {
    listingsNearBand: number;
    openWaitlists: number;
    foodSitesInDirectory: number;
    legalAidOrgs: number;
  };
  computedSummary?: string;
}

export function ReportGenerator() {
  const [householdSize, setHouseholdSize] = useState(2);
  const [income, setIncome] = useState(50000);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`/api/report?householdSize=${householdSize}&income=${income}`);
      const d = await r.json();
      if (!r.ok || d.success === false) throw new Error(d?.error || 'Report engine unavailable');
      setResult(d.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Report engine unavailable');
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  // Auto-run once when opened via the desktop app menu (?report=1)
  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has('report')) return;
    void run();
    window.history.replaceState({}, '', '/');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="bg-[var(--wax)] border border-[var(--line)] rounded-[2px] p-5 md:p-7">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-5">
        <div>
          <p className="kicker mb-2">Snapshot report</p>
          <h2 className="font-display text-2xl md:text-3xl font-extrabold">Your snapshot, in one read</h2>
          <p className="text-sm text-[var(--ink-soft)] mt-2 max-w-2xl">
            Type in your household size and income — DOR101 computes your FY2026 AMI band, what a
            2BR at the Fair Market Rent would cost you, and which listings in the directory are near
            your band. Numbers come from HUD and the same sources used on every page.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden lg:inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[var(--muted)]">
            <FileText className="w-3.5 h-3.5" /> server-side · dated
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-[auto_1fr_auto] items-end gap-3">
        <label className="block text-sm font-bold">
          Household size
          <select
            value={householdSize}
            onChange={(e) => setHouseholdSize(Number(e.target.value))}
            className="mt-1 block w-full md:w-40 px-3 py-2.5 bg-[var(--paper)] border border-[var(--line)] rounded-[2px] font-mono"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={n}>{n} {n === 1 ? 'person' : 'people'}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-bold">
          Annual gross income ($)
          <input
            type="number"
            min={0}
            value={income}
            onChange={(e) => setIncome(Number(e.target.value))}
            className="mt-1 block w-full px-3 py-2.5 bg-[var(--paper)] border border-[var(--line)] rounded-[2px] font-mono"
            aria-label="Annual gross income"
          />
        </label>
        <button
          onClick={run}
          disabled={loading || !Number.isFinite(income)}
          className="cta cta-primary cta-lg disabled:opacity-50"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
          {loading ? 'Computing…' : 'Run snapshot'}
        </button>
      </div>

      {error && <p className="text-sm text-[var(--red)] mt-4">{error}</p>}

      {result && !error && (
        <div className="mt-6">
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="bg-[var(--paper)] border border-[var(--line)] rounded-[2px] p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">AMI band (FY2026)</p>
              <p className="font-display text-3xl font-black text-[var(--charcoal)] mt-1">{result.ami?.band}</p>
              <p className="text-xs text-[var(--ink-soft)] mt-1">
                Household of {result.ami?.householdSize} at {result.ami?.amiPct}% of the {result.ami?.ami100?.toLocaleString()} 100% AMI line.
              </p>
            </div>
            <div className="bg-[var(--paper)] border border-[var(--line)] rounded-[2px] p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Rent burden · 2BR FMR</p>
              <p className="font-display text-3xl font-black text-[var(--charcoal)] mt-1">
                {result.rent?.rentBurdenPercent}% <span className="text-base font-bold text-[var(--ink-soft)]">of income</span>
              </p>
              <p className="text-xs text-[var(--ink-soft)] mt-1">{result.rent?.rentBurdenLabel}.</p>
            </div>
            <div className="bg-[var(--paper)] border border-[var(--line)] rounded-[2px] p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Listings near your band</p>
              <p className="font-display text-3xl font-black text-[var(--charcoal)] mt-1">{result.directory?.listingsNearBand ?? '—'}</p>
              <p className="text-xs text-[var(--ink-soft)] mt-1">
                {result.directory?.openWaitlists ?? '—'} taking applications right now · {result.directory?.foodSitesInDirectory} food sites · {result.directory?.legalAidOrgs} legal-aid orgs in the directory.
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3 bg-[var(--parchment)] border border-[var(--line)] rounded-[2px] p-4">
            <p className="text-sm leading-relaxed max-w-3xl">{result.computedSummary}</p>
            <a href="/affordable-housing" className="cta cta-dark cta-md shrink-0">
              See the listings <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </section>
  );
}
