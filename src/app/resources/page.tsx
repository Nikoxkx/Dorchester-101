'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { OrgLogo } from '@/components/ui/OrgLogo';
import { useAppStore } from '@/stores/appStore';
import { useTranslation } from '@/lib/i18n';
import { useToast } from '@/stores/toastStore';
import { useShare } from '@/lib/share';
import { COMMUNITY_RESOURCES, type CommunityResource, type ResourceCategory } from '@/data/resources';
import { telHref } from '@/lib/utils';
import { formatFor } from '@/lib/i18n';
import { Heart, Phone, Globe, Share2, Printer, Search, PhoneCall } from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORY_KEYS: Record<ResourceCategory, Parameters<ReturnType<typeof useTranslation>['t']>[0]> = {
  housing: 'resources.title',
  legal: 'quick.legalHelp',
  healthcare: 'resources.title',
  food: 'nav.food',
  employment: 'resources.title',
  education: 'resources.education',
  family: 'resources.title',
  childcare: 'resources.title',
  disability: 'resources.title',
  emergency: 'emergency.title',
};

/** Orgs with real marks under /public/logos/ (see public/logos/MANIFEST.md). */
const LOGO_BY_ORG: Record<string, string> = {
  bha: 'bha',
  'mayors-office-of-housing': 'boston',
  'dorchester-bay-edc': 'dbedc',
  csndc: 'csndc',
  vietaid: 'vietaid',
  abcd: 'abcd',
  'city-life-vida-urbana': 'citylife',
  'project-bread': 'projectbread',
  gbfb: 'gbfb',
};

export default function ResourcesPage() {
  return (
    <MainLayout>
      <ResourcesView />
    </MainLayout>
  );
}

function ResourcesView() {
  const { language } = useAppStore();
  const { t, formatFor } = useTranslation(language);
  const params = useSearchParams();
  const initialCategory = (params.get('category') as ResourceCategory | null) ?? 'all';

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<ResourceCategory | 'all'>(initialCategory);

  const categories = useMemo(
    () => [...new Set(COMMUNITY_RESOURCES.map((r) => r.category))].sort(),
    [],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return COMMUNITY_RESOURCES.filter((r) => {
      if (category !== 'all' && r.category !== category) return false;
      if (!q) return true;
      return `${r.name} ${r.services} ${r.neighborhood ?? ''} ${r.languages.join(' ')}`.toLowerCase().includes(q);
    });
  }, [query, category]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-large font-bold tracking-tight text-1">{t('resources.title')}</h1>
        <p className="text-title3 text-text-2 mt-1.5 max-w-2xl leading-snug">{t('resources.description')}</p>
      </header>

      <section aria-label={t('resources.notSure')} className="content-card squircle p-5">
        <p className="kicker">{t('resources.notSure')}</p>
        <p className="text-subhead text-text-2 mt-1.5">{t('resources.call211')}</p>
        <a
          href="tel:211"
          className="mt-3.5 inline-flex items-center gap-2.5 h-11 px-5 rounded-full bg-ink text-canvas text-subhead font-semibold hover:opacity-85"
        >
          <PhoneCall className="w-4 h-4" strokeWidth={2} aria-hidden />
          <span className="num">2-1-1</span>
        </a>
      </section>

      {/* Category chips + search */}
      <div className="flex flex-wrap items-center gap-2 no-print">
        <label className="glass glass-clear glass-edge flex items-center gap-2 rounded-full h-10 px-4 flex-1 min-w-56 max-w-md">
          <Search className="w-4 h-4 text-text-3 shrink-0" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('resources.search')}
            aria-label={t('common.search')}
            className="w-full bg-transparent outline-none text-subhead text-1 placeholder:text-text-3"
          />
        </label>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label={t('resources.allCategories')}>
          <CategoryChip active={category === 'all'} onClick={() => setCategory('all')} label={t('common.all')} />
          {categories.map((c) => (
            <CategoryChip
              key={c}
              active={category === c}
              onClick={() => setCategory(c)}
              label={CATEGORY_LABELS[c] ? t(CATEGORY_LABELS[c]) : c}
            />
          ))}
        </div>
        <button
          onClick={() => window.print()}
          className="p-2.5 rounded-full glass glass-clear glass-edge text-1 hover:bg-[var(--glass-clear-hover)] no-print"
          aria-label={t('common.print')}
        >
          <Printer className="w-4 h-4" strokeWidth={2} aria-hidden />
        </button>
      </div>

      <p className="text-caption font-semibold uppercase tracking-wider text-text-3" aria-live="polite">
        {formatFor.number(results.length)} {t('common.results')} · {t('resources.verifyNote')}
      </p>

      {results.length === 0 ? (
        <div className="content-card squircle p-10 text-center">
          <p className="text-body font-semibold text-1">{t('common.empty')}</p>
          <p className="text-subhead text-text-2 mt-1.5">{t('projects.tryDifferent')}</p>
        </div>
      ) : (
        <ul className="grid md:grid-cols-2 gap-3">
          {results.map((r) => (
            <li key={r.id}>
              <ResourceCard resource={r} logoOrg={LOGO_BY_ORG[r.id]} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const CATEGORY_LABELS: Partial<Record<ResourceCategory, Parameters<ReturnType<typeof useTranslation>['t']>[0]>> = {
  housing: 'nav.affordable',
  legal: 'quick.legalHelp',
  food: 'nav.food',
  education: 'resources.education',
  employment: 'resources.title',
};

function CategoryChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'h-8 px-3.5 rounded-full text-caption font-semibold transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current',
        active ? 'bg-ink text-canvas' : 'glass glass-clear glass-edge text-1 hover:bg-[var(--glass-clear-hover)]',
      )}
    >
      {label}
    </button>
  );
}

function ResourceCard({ resource, logoOrg }: { resource: CommunityResource; logoOrg?: string }) {
  const { language } = useAppStore();
  const { t, formatFor } = useTranslation(language);
  const toast = useToast();
  const share = useShare();
  const { favorites, toggleFavorite } = useAppStore();
  const saved = favorites.some((f) => f.id === `resource-${resource.id}`);

  return (
    <article className="content-card squircle p-5 h-full flex flex-col print-block">
      <div className="flex items-start gap-3.5">
        {logoOrg && <OrgLogo org={logoOrg} name={resource.name} />}
        <div className="min-w-0 flex-1">
          <h2 className="text-body font-bold text-1 leading-snug">{resource.name}</h2>
          <p className="text-caption text-text-2 mt-0.5">
            {resource.neighborhood ?? resource.category}
            {resource.isFree ? ` · ${t('common.free')}` : ''}
          </p>
        </div>
        <button
          onClick={() => {
            const added = toggleFavorite({
              id: `resource-${resource.id}`,
              kind: 'resource',
              title: resource.name,
              href: '/resources',
            });
            toast(added ? t('resources.saved') : t('saved.removed'), 'success');
          }}
          className="p-2 -mt-1 -me-1 rounded-full hover:bg-[var(--surface-2)] text-1"
          aria-label={`${saved ? t('saved.remove') : t('common.save')} — ${resource.name}`}
          aria-pressed={saved}
        >
          <Heart className={cn('w-4.5 h-4.5', saved && 'fill-danger text-danger')} strokeWidth={2} aria-hidden />
        </button>
      </div>

      <p className="text-footnote text-text-1 mt-3 leading-relaxed">{resource.services}</p>

      {resource.eligibility && (
        <p className="text-caption text-text-2 mt-2">
          <span className="font-semibold text-1">{t('housing.howItWorks')}: </span>
          {resource.eligibility}
        </p>
      )}

      {resource.address && <p className="text-caption text-text-2 mt-2">{resource.address}</p>}
      <p className="text-caption text-text-2">
        <span className="font-semibold text-1">{t('food.languages')}: </span>
        {resource.languages.join(', ')}
      </p>

      <div className="flex flex-wrap items-center gap-2 mt-auto pt-4 no-print">
        <a
          href={telHref(resource.phone)}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full glass glass-clear glass-edge text-footnote font-semibold text-1"
        >
          <Phone className="w-3.5 h-3.5" strokeWidth={2} aria-hidden />
          <span className="num">{resource.phone}</span>
        </a>
        {resource.website && (
          <a
            href={resource.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full glass glass-clear glass-edge text-footnote font-semibold text-1"
          >
            <Globe className="w-3.5 h-3.5" strokeWidth={2} aria-hidden />
            {t('common.website')}
          </a>
        )}
        <button
          onClick={() => void share({ title: resource.name, url: resource.website ?? window.location.href })}
          className="p-2.5 rounded-full glass glass-clear glass-edge text-1 hover:bg-[var(--glass-clear-hover)]"
          aria-label={`${t('common.share')} — ${resource.name}`}
        >
          <Share2 className="w-4 h-4" strokeWidth={2} aria-hidden />
        </button>
      </div>

      <p className="text-caption2 text-text-3 mt-3">
        {t('common.lastVerified')}: {formatFor.date(resource.lastVerified)}
      </p>
    </article>
  );
}
