'use client';

import { useMemo, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAppStore } from '@/stores/appStore';
import { useTranslation } from '@/lib/i18n';
import { useToast } from '@/stores/toastStore';
import { useShare } from '@/lib/share';
import { GlassButton, GlassSegmented } from '@/components/glass/GlassControls';
import { GlassSheet } from '@/components/glass/GlassSheet';
import { GlassMenu } from '@/components/glass/GlassMenu';
import { DEVELOPMENT_PROJECTS, type DevelopmentProject } from '@/data/housing';
import { formatFor } from '@/lib/i18n';
import { Heart, ExternalLink, SlidersHorizontal, Search, Share2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type StatusFilter = 'all' | 'planning' | 'approved' | 'under_construction' | 'complete';
type SortKey = 'newest' | 'units' | 'affordable';

const ALL_NEIGHBORHOODS = [...new Set(DEVELOPMENT_PROJECTS.map((p) => p.neighborhood))].sort();

export default function ProjectsPage() {
  return (
    <MainLayout>
      <ProjectsView />
    </MainLayout>
  );
}

function ProjectsView() {
  const { language } = useAppStore();
  const { t, formatFor } = useTranslation(language);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [neighborhood, setNeighborhood] = useState('all');
  const [sort, setSort] = useState<SortKey>('newest');
  const [selected, setSelected] = useState<DevelopmentProject | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = DEVELOPMENT_PROJECTS.filter((p) => {
      if (status !== 'all' && p.status !== status) return false;
      if (neighborhood !== 'all' && p.neighborhood !== neighborhood) return false;
      if (!q) return true;
      return `${p.name} ${p.developer} ${p.address} ${p.neighborhood}`.toLowerCase().includes(q);
    });
    list = [...list].sort((a, b) => {
      if (sort === 'units') return (b.totalUnits ?? 0) - (a.totalUnits ?? 0);
      if (sort === 'affordable') return (b.incomeRestrictedUnits ?? 0) - (a.incomeRestrictedUnits ?? 0);
      return new Date(b.approvalDate ?? 0).getTime() - new Date(a.approvalDate ?? 0).getTime();
    });
    return list;
  }, [query, status, neighborhood, sort]);

  const totals = useMemo(
    () => ({
      projects: results.length,
      units: results.reduce((sum, p) => sum + (p.totalUnits ?? 0), 0),
      affordable: results.reduce((sum, p) => sum + (p.incomeRestrictedUnits ?? 0), 0),
    }),
    [results],
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-large font-bold tracking-tight text-1">{t('projects.title')}</h1>
        <p className="text-title3 text-text-2 mt-1.5 max-w-2xl leading-snug">{t('projects.description')}</p>
      </header>

      {/* Filters — clear-glass control row */}
      <div className="flex flex-wrap items-center gap-2 no-print">
        <label className="glass glass-clear glass-edge flex items-center gap-2 rounded-full h-10 px-4 flex-1 min-w-56 max-w-md">
          <Search className="w-4 h-4 text-text-3 shrink-0" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('projects.search')}
            className="w-full bg-transparent outline-none text-subhead text-1 placeholder:text-text-3"
            aria-label={t('common.search')}
          />
          {query && (
            <button onClick={() => setQuery('')} aria-label={t('common.clearFilters')}>
              <X className="w-3.5 h-3.5 text-text-3" />
            </button>
          )}
        </label>

        <GlassSegmented<StatusFilter>
          ariaLabel={t('projects.allStatuses')}
          value={status}
          onChange={setStatus}
          options={[
            { value: 'all', label: t('common.all') },
            { value: 'planning', label: t('projects.status.planning') },
            { value: 'approved', label: t('projects.status.approved') },
            { value: 'under_construction', label: t('projects.status.under_construction') },
            { value: 'complete', label: t('projects.status.complete') },
          ]}
        />

        <GlassMenu
          label={t('nav.neighborhood')}
          value={neighborhood}
          onChange={setNeighborhood}
          options={[
            { value: 'all', label: t('nav.neighborhood') },
            ...ALL_NEIGHBORHOODS.map((n) => ({ value: n, label: n })),
          ]}
          triggerClassName="glass glass-clear glass-edge rounded-full h-10 px-4 text-subhead font-semibold text-1 hover:bg-[var(--glass-clear-hover)]"
          trigger={
            <span className="inline-flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4" strokeWidth={2} aria-hidden />
              <span className="max-w-32 truncate">{neighborhood === 'all' ? t('nav.neighborhood') : neighborhood}</span>
            </span>
          }
          width="w-56"
        />

        <GlassMenu
          label={t('common.sort')}
          value={sort}
          onChange={(v) => setSort(v as SortKey)}
          options={[
            { value: 'newest', label: t('common.sortNewest') },
            { value: 'units', label: t('projects.totalUnits') },
            { value: 'affordable', label: t('projects.affordableUnits') },
          ]}
          triggerClassName="glass glass-clear glass-edge rounded-full h-10 px-4 text-subhead font-semibold text-1 hover:bg-[var(--glass-clear-hover)]"
          trigger={<span>{t('common.sort')}</span>}
          width="w-52"
        />
      </div>

      {/* Result totals */}
      <div className="grid grid-cols-3 gap-2.5" aria-live="polite">
        <MiniStat label={t('projects.totalProjects')} value={formatFor.number(totals.projects)} />
        <MiniStat label={t('projects.totalUnits')} value={formatFor.number(totals.units)} />
        <MiniStat label={t('projects.affordableUnits')} value={formatFor.number(totals.affordable)} />
      </div>

      {/* List — content layer */}
      {results.length === 0 ? (
        <div className="content-card squircle p-10 text-center">
          <p className="text-body font-semibold text-1">{t('projects.noResults')}</p>
          <p className="text-subhead text-text-2 mt-1.5">{t('projects.tryDifferent')}</p>
          <GlassButton
            className="mt-4"
            size="sm"
            onClick={() => {
              setQuery('');
              setStatus('all');
              setNeighborhood('all');
            }}
          >
            {t('common.clearFilters')}
          </GlassButton>
        </div>
      ) : (
        <ul className="grid md:grid-cols-2 gap-3">
          {results.map((p) => (
            <li key={p.id}>
              <ProjectCard project={p} onOpen={() => setSelected(p)} />
            </li>
          ))}
        </ul>
      )}

      <p className="text-caption text-text-3">
        {t('projects.dataSource')} · {t('common.lastVerified')}: {formatFor.date('2026-09-06')}
      </p>

      <GlassSheet open={!!selected} onClose={() => setSelected(null)} title={t('projects.detailTitle')}>
        {selected && <ProjectDetail project={selected} />}
      </GlassSheet>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="content-card squircle px-4 py-3">
      <p className="text-caption2 font-semibold uppercase tracking-wider text-text-2 truncate">{label}</p>
      <p className="text-title2 font-bold text-1 num">{value}</p>
    </div>
  );
}

function ProjectCard({ project, onOpen }: { project: DevelopmentProject; onOpen: () => void }) {
  const { language } = useAppStore();
  const { t } = useTranslation(language);
  return (
    <article className="content-card squircle p-5 h-full flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <button
          onClick={onOpen}
          className="text-start focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current rounded"
        >
          <h2 className="text-body font-bold text-1 leading-snug hover:underline underline-offset-2">
            {project.name}
          </h2>
          <p className="text-caption text-text-2 mt-0.5">
            {project.neighborhood} · {project.developer}
          </p>
        </button>
        <StatusBadge status={project.status} />
      </div>

      <div className="flex items-baseline gap-4 mt-4 num">
        <span className="text-title1 font-bold text-1">
          {project.totalUnits ?? '—'}
          <span className="text-footnote font-medium text-text-2 ms-1">{t('common.units')}</span>
        </span>
        {project.incomeRestrictedUnits != null && (
          <span className="text-subhead font-semibold text-success">
            {project.incomeRestrictedUnits} {t('projects.affordable').toLowerCase()}
          </span>
        )}
      </div>

      <button
        onClick={onOpen}
        className="mt-4 self-start text-footnote font-semibold text-text-2 hover:text-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current rounded"
        aria-label={`${t('common.viewDetails')} — ${project.name}`}
      >
        {t('common.viewDetails')} →
      </button>
    </article>
  );
}

function StatusBadge({ status }: { status: DevelopmentProject['status'] }) {
  const { language } = useAppStore();
  const { t } = useTranslation(language);
  const label = t(`projects.status.${status}` as const);
  const tone =
    status === 'complete' ? 'dot-open' : status === 'under_construction' ? 'dot-open' : 'dot-pending';
  return (
    <span className="inline-flex items-center gap-1.5 text-caption2 font-bold uppercase tracking-wider text-text-2 shrink-0">
      <span aria-hidden className={cn('dot', tone)} />
      {label}
    </span>
  );
}

function ProjectDetail({ project }: { project: DevelopmentProject }) {
  const { language } = useAppStore();
  const { t, formatFor } = useTranslation(language);
  const toast = useToast();
  const share = useShare();
  const { favorites, toggleFavorite } = useAppStore();
  const saved = favorites.some((f) => f.id === `project-${project.id}`);

  const amiEntries = Object.entries(project.amiBreakdown);

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-title2 font-bold text-1 leading-tight">{project.name}</h3>
          <button
            onClick={() => {
              const added = toggleFavorite({
                id: `project-${project.id}`,
                kind: 'project',
                title: project.name,
                href: '/projects',
              });
              toast(added ? t('common.saved') : t('saved.removed'), 'success');
            }}
            className="p-2 -mt-1 rounded-full hover:bg-[var(--surface-2)] text-1"
            aria-label={`${saved ? t('saved.remove') : t('common.save')} — ${project.name}`}
            aria-pressed={saved}
          >
            <Heart
              className={cn('w-5 h-5', saved && 'fill-danger text-danger')}
              strokeWidth={2}
              aria-hidden
            />
          </button>
        </div>
        <p className="text-footnote text-text-2 mt-1">
          {project.neighborhood} · {project.developer}
        </p>
        <p className="text-footnote text-text-2">{project.address}</p>
      </div>

      <p className="text-subhead text-text-1 leading-relaxed">{project.description}</p>

      <dl className="grid grid-cols-2 gap-2.5">
        <div className="content-card squircle px-4 py-3">
          <dt className="text-caption2 font-semibold uppercase tracking-wider text-text-2">{t('projects.totalUnits')}</dt>
          <dd className="text-title2 font-bold text-1 num">{project.totalUnits ?? t('projects.tbd')}</dd>
        </div>
        <div className="content-card squircle px-4 py-3">
          <dt className="text-caption2 font-semibold uppercase tracking-wider text-text-2">{t('projects.affordableUnits')}</dt>
          <dd className="text-title2 font-bold text-success num">{project.incomeRestrictedUnits ?? '—'}</dd>
        </div>
        <div className="content-card squircle px-4 py-3">
          <dt className="text-caption2 font-semibold uppercase tracking-wider text-text-2">{t('projects.status.planning')}</dt>
          <dd className="text-footnote font-semibold text-1">
            {t(`projects.status.${project.status}` as const)}
          </dd>
        </div>
        <div className="content-card squircle px-4 py-3">
          <dt className="text-caption2 font-semibold uppercase tracking-wider text-text-2">{t('projects.status.approved')}</dt>
          <dd className="text-footnote font-semibold text-1 num">
            {project.approvalDate ? formatFor.date(project.approvalDate) : t('projects.tbd')}
          </dd>
        </div>
      </dl>

      {amiEntries.length > 0 && (
        <div>
          <p className="kicker mb-2">{t('projects.amiBreakdown')}</p>
          <ul className="space-y-1.5">
            {amiEntries.map(([band, count]) => (
              <li key={band} className="flex items-center gap-3">
                <span className="text-footnote font-bold text-1 w-14 num shrink-0">{band}% AMI</span>
                <span className="flex-1 h-2.5 rounded-full bg-[var(--surface-2)] overflow-hidden" aria-hidden>
                  <span
                    className="block h-full rounded-full bg-ink"
                    style={{ width: `${Math.min(100, (count / (project.totalUnits ?? count)) * 100)}%` }}
                  />
                </span>
                <span className="text-footnote text-text-2 num w-16 text-end shrink-0">
                  {formatFor.number(count)} {t('common.units')}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap gap-2 no-print">
        <GlassButton
          size="sm"
          onClick={() =>
            void share({
              title: project.name,
              url: project.bpdaLink,
              text: `${project.name} — ${t('projects.title')}`,
            })
          }
          icon={<Share2 className="w-4 h-4" aria-hidden />}
        >
          {t('common.share')}
        </GlassButton>
        <a
          href={project.bpdaLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 h-8 px-3 rounded-full text-caption font-semibold text-1 glass glass-clear glass-edge hover:bg-[var(--glass-clear-hover)]"
        >
          <ExternalLink className="w-3.5 h-3.5" aria-hidden />
          {t('projects.bpdaDetails')}
        </a>
      </div>

      <p className="text-caption2 text-text-3">
        {t('common.source')}: BPDA · {t('common.asOf')} {formatFor.date('2026-09-06')}
      </p>
    </div>
  );
}
