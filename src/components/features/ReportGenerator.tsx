'use client';

import { useState } from 'react';
import { Download, RefreshCw } from 'lucide-react';

export function ReportGenerator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const run = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/report?householdSize=2&income=50000');
      const d = await r.json();
      setResult(d.data);
    } catch {
      setResult({ error: 'Report engine unavailable' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="desk-panel p-6 space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <p className="kicker mb-1">Backend Engine</p>
          <h3 className="font-display text-2xl tracking-[-0.03em]">Cross-Source Report</h3>
        </div>
        <button onClick={run} disabled={loading} className="flex items-center gap-2 bg-[var(--ink)] text-[var(--bone)] px-4 py-2 text-sm font-bold hover:bg-[var(--charcoal)] transition-colors" aria-label="Generate report">
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} {loading ? 'Computing...' : 'Generate'}
        </button>
      </div>
      <p className="text-sm text-[var(--ink-soft)]">Combines HUD FY2026 AMI, FMR, rent estimates, and verified college-access resources into one computed analysis.</p>
      {result && !result.error && (
        <div className="bg-[var(--wax)] border border-[var(--line)] p-4 space-y-2 text-sm">
          <p><strong>AMI:</strong> {result.ami?.band} ({result.ami?.amiPct}%) · Household {result.ami?.householdSize}</p>
          <p><strong>Rent burden (2BR FMR):</strong> {result.rent?.rentBurdenPercent}%</p>
          <p><strong>College matches:</strong> {result.collegePathway?.resourcesMatched}</p>
          <p className="text-xs text-[var(--muted)] font-mono">{result.computedSummary}</p>
        </div>
      )}
      {result?.error && <p className="text-sm text-[var(--rust)]">{result.error}</p>}
    </div>
  );
}
