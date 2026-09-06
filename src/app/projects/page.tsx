'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { AMIBadge, StatusBadge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useApi } from '@/hooks/useApi';
import { useAppStore } from '@/stores/appStore';
import { useTranslation } from '@/lib/i18n';

interface ProjectsPayload {
  projects: {
    id: string;
    name: string;
    developer: string;
    address: string;
    neighborhood: string;
    totalUnits: number | null;
    incomeRestrictedUnits: number | null;
    amiBreakdown: Record<string, number>;
    status: 'planning' | 'approved' | 'under_construction' | 'complete';
    approvalDate: string | null;
    expectedCompletion: string | null;
    description: string;
    bpdaLink: string;
  }[];
  totals: { count: number; units: number; affordable: number; underConstruction: number };
  source: string;
}

export default function ProjectsPage() {
  const { language } = useAppStore();
  const { t } = useTranslation(language);
  const { data, loading, error, reload } = useApi<ProjectsPayload>('/api/projects');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');

  const projects = (data?.projects || []).filter((p) => {
    const hay = `${p.name} ${p.neighborhood} ${p.address} ${p.developer}`.toLowerCase();
    return hay.includes(q.toLowerCase()) && (!status || p.status === status);
  });

  return (
    <MainLayout>
      <div className="space-y-8">
        <header className="pb-7 border-b-2 border-[var(--charcoal)]">
          <p className="masthead-date mb-3">04 — Development · BPDA public record</p>
          <h1 className="font-display font-bold uppercase leading-[0.95] tracking-[0.005em] text-[clamp(1.9rem,4vw,3rem)] text-[var(--charcoal)]">{t('projects.title')}</h1>
          <p className="text-[15px] leading-relaxed text-[var(--ink-soft)] mt-3.5 max-w-2xl">{t('projects.description')}</p>
        </header>

        {data && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-y border-[var(--line)] py-4">
            <div><p className="text-[11px] uppercase text-[var(--muted)]">{t('projects.totalProjects')}</p><p className="font-display text-3xl">{data.totals.count}</p></div>
            <div><p className="text-[11px] uppercase text-[var(--muted)]">{t('projects.totalUnits')}</p><p className="font-display text-3xl">{data.totals.units || '—'}</p></div>
            <div><p className="text-[11px] uppercase text-[var(--muted)]">{t('projects.affordableUnits')}</p><p className="font-display text-3xl">{data.totals.affordable || '—'}</p></div>
            <div><p className="text-[11px] uppercase text-[var(--muted)]">{t('projects.underConstruction')}</p><p className="font-display text-3xl">{data.totals.underConstruction}</p></div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('projects.search')} className="flex-1 px-3 py-2 bg-[var(--surface)] border border-[var(--line)] text-sm" />
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-2 bg-[var(--surface)] border border-[var(--line)] text-sm">
            <option value="">{t('projects.allStatuses')}</option>
            <option value="planning">{t('projects.planning')}</option>
            <option value="approved">{t('projects.approved')}</option>
            <option value="under_construction">{t('projects.underConstruction')}</option>
            <option value="complete">{t('projects.complete')}</option>
          </select>
        </div>

        {loading && <LoadingSpinner />}
        {error && <button onClick={reload} className="underline">{t('common.retry')}</button>}

        <div className="space-y-4">
          {projects.map((p) => (
            <article key={p.id} className="desk-panel p-4 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="font-display text-2xl">{p.name}</h2>
                  <p className="text-sm text-[var(--muted)]">{p.neighborhood} · {p.address}</p>
                </div>
                <StatusBadge status={p.status} />
              </div>
              <p className="text-sm">{p.description}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div><p className="text-[11px] uppercase text-[var(--muted)]">{t('projects.totalUnits')}</p><p className="font-mono">{p.totalUnits ?? t('projects.tbd')}</p></div>
                <div><p className="text-[11px] uppercase text-[var(--muted)]">{t('projects.affordable')}</p><p className="font-mono">{p.incomeRestrictedUnits ?? t('projects.tbd')}</p></div>
                <div><p className="text-[11px] uppercase text-[var(--muted)]">{t('projects.developer')}</p><p>{p.developer}</p></div>
                <div><p className="text-[11px] uppercase text-[var(--muted)]">{t('projects.expected')}</p><p>{p.expectedCompletion ? new Date(p.expectedCompletion).toLocaleDateString() : t('projects.tbd')}</p></div>
              </div>
              {Object.keys(p.amiBreakdown).length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {Object.entries(p.amiBreakdown).map(([ami, count]) => (
                    <div key={ami} className="flex items-center gap-2">
                      <AMIBadge percentage={Number(ami)} />
                      <span className="text-sm font-mono">{count} {t('projects.units')}</span>
                    </div>
                  ))}
                </div>
              )}
              <a href={p.bpdaLink} target="_blank" rel="noreferrer" className="inline-block text-sm underline">{t('projects.bpdaDetails')}</a>
            </article>
          ))}
        </div>

        {projects.length === 0 && !loading && (
          <p className="text-sm text-[var(--muted)]">{t('projects.noResults')}</p>
        )}
        <p className="text-xs text-[var(--muted)]">{data?.source} · <a className="underline" href="https://www.bostonplans.org" target="_blank" rel="noreferrer">bostonplans.org</a></p>
      </div>
    </MainLayout>
  );
}
