'use client';

import { useMemo, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAppStore } from '@/stores/appStore';
import { useTranslation } from '@/lib/i18n';
import { useLiveApi } from '@/hooks/useLiveApi';
import { useRealtime } from '@/hooks/useRealtime';
import { formatFor } from '@/lib/i18n';
import { GlassSegmented } from '@/components/glass/GlassControls';
import { RadioTower, Share2, Search } from 'lucide-react';
import { useShare } from '@/lib/share';
import { cn } from '@/lib/utils';

interface Article {
  id: string;
  title: string;
  summary: string;
  source: string;
  sourceUrl: string;
  category: string;
  publishedAt: string;
}

type NewsFilter = 'all' | 'Housing' | 'Transportation' | 'Food Security' | 'Community';

export default function NewsPage() {
  return (
    <MainLayout>
      <NewsView />
    </MainLayout>
  );
}

function NewsView() {
  const { language } = useAppStore();
  const { t, formatFor } = useTranslation(language);
  const share = useShare();
  const [filter, setFilter] = useState<NewsFilter>('all');
  const [query, setQuery] = useState('');

  const { data, loading, error, realtime } = useLiveApi<{ articles?: Article[]; sources?: { name: string; category: string }[]; lastUpdated?: string }>(
    '/api/news',
    { channels: ['news'], intervalMs: 5 * 60_000 },
  );
  const connection = useRealtime(undefined, ['news']);

  const articles = useMemo(() => {
    let list = data?.articles ?? [];
    if (filter !== 'all') list = list.filter((a) => a.category === filter);
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((a) => `${a.title} ${a.summary}`.toLowerCase().includes(q));
    return list;
  }, [data, filter, query]);

  const isLive = realtime === 'live' || connection.status === 'live';

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-large font-bold tracking-tight text-1">{t('news.title')}</h1>
          <p className="text-subhead text-text-2 mt-1 max-w-2xl">{t('news.description')}</p>
        </div>
        <span
          className={cn(
            'inline-flex items-center gap-1.5 text-caption2 font-bold uppercase tracking-wider',
            isLive ? 'text-success' : 'text-text-3',
          )}
          role="status"
        >
          <RadioTower className="w-3.5 h-3.5" aria-hidden />
          {t('news.liveUpdates')}
        </span>
      </header>

      <p className="text-caption text-text-2">{t('news.autoRefresh')}</p>

      {data?.sources && (
        <p className="text-caption2 text-text-3">
          {t('news.sourcesDesc')} {data.sources.map((s) => s.name).join(' · ')}
        </p>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <label className="glass glass-clear glass-edge flex items-center gap-2 rounded-full h-10 px-4 flex-1 min-w-48 max-w-sm">
          <Search className="w-4 h-4 text-text-3 shrink-0" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('common.search')}
            aria-label={t('common.search')}
            className="w-full bg-transparent outline-none text-subhead text-1 placeholder:text-text-3"
          />
        </label>
        <GlassSegmented<NewsFilter>
          ariaLabel={t('news.title')}
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: t('common.all') },
            { value: 'Housing', label: t('nav.affordableShort') },
            { value: 'Transportation', label: t('nav.map') },
            { value: 'Food Security', label: t('nav.food') },
            { value: 'Community', label: t('nav.neighborhood') },
          ]}
        />
      </div>

      {/* States */}
      {loading && articles.length === 0 && (
        <div className="space-y-2.5" aria-hidden>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-20" />
          ))}
        </div>
      )}
      {error && articles.length === 0 && (
        <div role="alert" className="content-card squircle p-6 text-center">
          <p className="text-body font-semibold text-1">{t('common.error')}</p>
          <p className="text-subhead text-text-2 mt-1">{t('common.errorHint')}</p>
        </div>
      )}
      {!loading && !error && articles.length === 0 && (
        <div className="content-card squircle p-10 text-center">
          <p className="text-body font-semibold text-1">{t('common.empty')}</p>
          <p className="text-subhead text-text-2 mt-1.5">{t('projects.tryDifferent')}</p>
        </div>
      )}

      {/* Feed — content layer */}
      <ul className="space-y-0">
        {articles.map((a, idx) => (
          <li key={a.id} className="border-b border-separator last:border-0">
            <article className="py-4">
              <div className="flex items-start gap-4">
                <time
                  dateTime={a.publishedAt}
                  className="text-caption2 font-bold uppercase tracking-wider text-text-3 w-16 shrink-0 pt-1 num"
                >
                  {formatFor.date(a.publishedAt, { month: 'short', day: 'numeric' })}
                </time>
                <div className="min-w-0 flex-1">
                  <a
                    href={a.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-body font-semibold text-1 leading-snug hover:underline underline-offset-2 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-current rounded"
                  >
                    {a.title}
                  </a>
                  {a.summary && (
                    <p className="text-footnote text-text-2 mt-1 leading-relaxed line-clamp-2">{a.summary}</p>
                  )}
                  <p className="text-caption2 text-text-3 mt-1.5">
                    {a.source} · {a.category}
                    {idx === 0 && (
                      <span className="ms-2 font-bold uppercase text-success">{t('news.new')}</span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => void share({ title: a.title, url: a.sourceUrl })}
                  className="p-2 rounded-full text-text-2 hover:text-1 hover:bg-[var(--surface)] shrink-0 no-print"
                  aria-label={`${t('common.share')} — ${a.title}`}
                >
                  <Share2 className="w-4 h-4" strokeWidth={2} aria-hidden />
                </button>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
