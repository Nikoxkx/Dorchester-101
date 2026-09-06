'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner, DataRefreshIndicator } from '@/components/ui/LoadingSpinner';
import { getRelativeTime } from '@/lib/utils';
import { useApi } from '@/hooks/useApi';
import { useAppStore } from '@/stores/appStore';
import { useTranslation } from '@/lib/i18n';

interface Article {
  id: string;
  title: string;
  summary: string;
  source: string;
  sourceUrl: string;
  category: string;
  publishedAt: string;
}

interface NewsPayload {
  articles: Article[];
  sources: { name: string; url: string }[];
  lastUpdated: string;
}

const categories = ['All', 'Housing', 'Food Security', 'Healthcare', 'Transportation', 'Employment', 'Community'];

export default function NewsPage() {
  const { language } = useAppStore();
  const { t } = useTranslation(language);
  const { data, loading, error, reload } = useApi<NewsPayload>('/api/news', 5 * 60 * 1000);
  const [cat, setCat] = useState('All');
  const [saved, setSaved] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem('dor101-news-saved') || '[]'); } catch { return []; }
  });

  const toggle = (id: string) => {
    const next = saved.includes(id) ? saved.filter((x) => x !== id) : [...saved, id];
    setSaved(next);
    localStorage.setItem('dor101-news-saved', JSON.stringify(next));
  };

  const articles = (data?.articles || []).filter((a) => cat === 'All' || a.category === cat);

  return (
    <MainLayout>
      <div className="space-y-6 max-w-3xl">
        <header className="border-b-2 border-[var(--ink)] pb-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="kicker">The desk</p>
              <h1 className="font-display text-4xl">{t('news.title')}</h1>
            </div>
            <DataRefreshIndicator lastUpdated={data ? new Date(data.lastUpdated).toLocaleTimeString() : null} isRefreshing={loading} />
          </div>
          <p className="text-[var(--muted)] mt-2">{t('news.description')}</p>
        </header>

        <div className="flex flex-wrap gap-1">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={c === cat ? 'bg-[var(--ink)] text-[var(--paper)] px-3 py-1 text-xs font-bold' : 'border border-[var(--line)] px-3 py-1 text-xs'}
            >
              {c}
            </button>
          ))}
        </div>

        {loading && !data && <LoadingSpinner />}
        {error && <button onClick={reload} className="underline">{t('common.retry')}</button>}

        <ul>
          {articles.map((a) => (
            <li key={a.id} className="news-item py-4 border-b border-[var(--line)]">
              <div className="flex items-center gap-2 mb-1">
                <Badge>{a.category}</Badge>
                <span className="text-[11px] text-[var(--muted)]">{a.source} · {getRelativeTime(new Date(a.publishedAt))}</span>
              </div>
              <h2 className="font-display text-xl leading-snug">{a.title}</h2>
              {a.summary && <p className="text-sm text-[var(--ink-soft)] mt-1">{a.summary}</p>}
              <div className="flex gap-4 mt-2 text-xs">
                {a.sourceUrl && <a href={a.sourceUrl} target="_blank" rel="noreferrer" className="underline">Read at source</a>}
                <button onClick={() => toggle(a.id)} className="underline">
                  {saved.includes(a.id) ? 'Saved' : 'Save on this device'}
                </button>
              </div>
            </li>
          ))}
        </ul>

        {articles.length === 0 && !loading && <p className="text-sm text-[var(--muted)]">No items in this category right now.</p>}

        <p className="text-xs text-[var(--muted)]">
          {t('news.sourcesDesc')} {(data?.sources || []).map((s) => s.name).join(', ')}.
        </p>
      </div>
    </MainLayout>
  );
}
