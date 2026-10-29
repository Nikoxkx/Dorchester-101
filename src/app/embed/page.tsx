'use client';

import { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ExternalLink, MapPin, Phone, Search } from 'lucide-react';
import { RESOURCES, type ResourceCategory } from '@/data/resources';
import { BOSTON_TZ, isOpenNow } from '@/lib/hours';
import { Badge } from '@/components/ui/Badge';
import { useI18n } from '@/i18n/hook';
import type { TranslationKey } from '@/i18n/en';
import { cn } from '@/lib/utils';

const CATEGORIES: Array<ResourceCategory | 'all'> = [
  'all',
  'food',
  'housing',
  'health',
  'legal',
  'community',
  'school',
];

const CATEGORY_KEYS: Record<ResourceCategory, TranslationKey> = {
  housing: 'map.housing',
  food: 'map.food',
  health: 'map.health',
  legal: 'map.legal',
  community: 'map.community',
  school: 'map.school',
};

function EmbedDirectoryInner() {
  const searchParams = useSearchParams();
  const { t, pickContent } = useI18n();
  const initialCat = (searchParams.get('category') as ResourceCategory | null) ?? 'all';
  const neighborhoodFilter = searchParams.get('neighborhood')?.toLowerCase() ?? '';
  const [category, setCategory] = useState<ResourceCategory | 'all'>(
    CATEGORIES.includes(initialCat) ? initialCat : 'all',
  );
  const [query, setQuery] = useState('');
  const [now] = useState(() => new Date());

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return RESOURCES.filter((r) => (category === 'all' ? true : r.category === category))
      .filter((r) =>
        neighborhoodFilter ? r.neighborhood.toLowerCase().includes(neighborhoodFilter) : true,
      )
      .filter((r) =>
        q
          ? `${r.name} ${r.address} ${r.neighborhood} ${r.summary.en}`
              .toLowerCase()
              .includes(q)
          : true,
      );
  }, [category, neighborhoodFilter, query]);

  return (
    <main className="min-h-screen bg-[var(--color-bg-primary)] p-4 text-[var(--color-text-primary)]">
      <div className="mx-auto max-w-3xl space-y-3">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-border)] pb-2.5">
          <div>
            <h1 className="font-heading text-base font-extrabold">
              {t('embed.title')}
            </h1>
            <p className="text-xs text-[var(--color-text-muted)]">
              {t('embed.subtitle', { count: items.length })}
            </p>
          </div>
          <Link
            href="/resources"
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1 rounded-full bg-[var(--color-accent-primary)] px-3 py-1 font-heading text-xs font-bold text-white"
          >
            {t('embed.fullSite')} <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </Link>
        </header>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[180px]">
            <Search
              className="pointer-events-none absolute inset-y-0 start-2.5 my-auto h-3.5 w-3.5 text-[var(--color-text-muted)]"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('embed.searchPlaceholder')}
              className="h-8 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] ps-8 pe-2.5 text-xs outline-none focus:border-[var(--color-accent-primary)]"
            />
          </div>
          <div className="flex flex-wrap gap-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={cn(
                  'rounded-full border px-2.5 py-1 font-heading text-[11px] font-semibold capitalize',
                  category === cat
                    ? 'border-transparent bg-[var(--color-accent-primary)] text-white'
                    : 'border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]',
                )}
              >
                {cat === 'all' ? t('common.all') : t(CATEGORY_KEYS[cat])}
              </button>
            ))}
          </div>
        </div>

        <ul className="grid gap-2.5 sm:grid-cols-2">
          {items.map((r) => {
            const open = r.hours ? isOpenNow(r.hours, now, BOSTON_TZ) : null;
            const summary = pickContent(r.summary).value;
            return (
              <li
                key={r.id}
                className="flex flex-col justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/60 p-3 text-xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-heading text-sm font-bold leading-snug">{r.name}</h2>
                    {open !== null && (
                      <Badge variant={open ? 'green' : 'default'}>
                        {open ? t('common.openShort') : t('common.closed')}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-2 text-[var(--color-text-secondary)]">{summary}</p>
                </div>
                <div className="mt-2.5 space-y-1 border-t border-[var(--color-border)] pt-2 text-[11px] text-[var(--color-text-muted)]">
                  <p className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                    <span className="truncate">{r.address}</span>
                  </p>
                  {r.phone && (
                    <p className="flex items-center gap-1">
                      <Phone className="h-3 w-3 shrink-0" aria-hidden="true" />
                      <a
                        href={`tel:${r.phone.replace(/[^\d+]/g, '')}`}
                        className="font-semibold text-[var(--color-accent-primary)] hover:underline"
                      >
                        {r.phone}
                      </a>
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}

export default function EmbedPage() {
  const { t } = useI18n();
  return (
    <Suspense fallback={<div className="p-4 text-xs">{t('embed.loading')}</div>}>
      <EmbedDirectoryInner />
    </Suspense>
  );
}
