'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner, DataRefreshIndicator } from '@/components/ui/LoadingSpinner';
import { getRelativeTime } from '@/lib/utils';
import { useApi } from '@/hooks/useApi';
import { useAppStore } from '@/stores/appStore';
import { useTranslation } from '@/lib/i18n';
import { Bookmark, ExternalLink } from '@/components/ui/icons';

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
      <div className="grid lg:grid-cols-[1fr_280px] gap-8 items-start">
        <div className="space-y-6 min-w-0">
          <header className="pb-7 border-b-2 border-[var(--charcoal)]">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="masthead-date mb-3">08 — News · matched to Dorchester</p>
                <h1 className="font-display font-bold uppercase leading-[0.95] tracking-[0.005em] text-[clamp(1.9rem,4vw,3rem)] text-[var(--charcoal)]">{t('news.title')}</h1>
              </div>
              <DataRefreshIndicator lastUpdated={data ? new Date(data.lastUpdated).toLocaleTimeString() : null} isRefreshing={loading} />
            </div>
            <p className="text-[15px] leading-relaxed text-[var(--ink-soft)] mt-3.5 max-w-2xl">
              {t('news.description')} Every story is keyword-matched to Dorchester — we don&apos;t
              scrape the whole city, and we don&apos;t republish paywalled text.
            </p>
          </header>

          <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Filter by topic">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                aria-pressed={cat === c}
                className={c === cat
                  ? 'bg-[var(--charcoal)] text-[var(--paper)] px-3.5 py-1.5 text-xs font-bold rounded-full'
                  : 'border border-[var(--line)] px-3.5 py-1.5 text-xs font-bold rounded-full hover:border-[var(--ink-soft)] transition-colors'}
              >
                {c}
              </button>
            ))}
          </div>

          {loading && !data && <LoadingSpinner />}
          {error && <button onClick={reload} className="underline">{t('common.retry')}</button>}

          <ul>
            {articles.map((a) => (
              <li key={a.id} className="news-item py-5 border-b border-[var(--line)] last:border-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <Badge>{a.category}</Badge>
                  <span className="text-[11px] text-[var(--muted)]">{a.source} · {getRelativeTime(new Date(a.publishedAt))}</span>
                </div>
                <h2 className="font-display text-xl md:text-2xl font-bold leading-snug text-[var(--charcoal)]">{a.title}</h2>
                {a.summary && <p className="text-sm text-[var(--ink-soft)] mt-1.5 leading-relaxed">{a.summary}</p>}
                <div className="flex gap-5 mt-3 text-xs font-bold">
                  {a.sourceUrl && (
                    <a href={a.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline underline-offset-2 hover:text-[var(--blue)]">
                      Read at source <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <button onClick={() => toggle(a.id)} className={`inline-flex items-center gap-1 underline underline-offset-2 hover:text-[var(--blue)] ${saved.includes(a.id) ? 'text-[var(--sage)]' : ''}`}>
                    <Bookmark className="w-3 h-3" />
                    {saved.includes(a.id) ? 'Saved on this device' : 'Save'}
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {articles.length === 0 && !loading && (
            <div className="desk-card p-8 text-center">
              <p className="font-display text-lg font-bold">No items in this category right now.</p>
              <p className="text-sm text-[var(--muted)] mt-1">Feeds can go quiet over weekends — try &ldquo;All&rdquo; or the source directly.</p>
            </div>
          )}

          <p className="text-xs text-[var(--muted)]">
            {t('news.sourcesDesc')} {(data?.sources || []).map((s) => s.name).join(', ')}.
          </p>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20">
          <div className="desk-card p-4">
            <p className="kicker mb-2">Sources</p>
            <ul className="space-y-2.5">
              {(data?.sources || []).map((s) => (
                <li key={s.name}>
                  <a href={s.url} target="_blank" rel="noreferrer" className="text-sm font-bold underline underline-offset-2 hover:text-[var(--blue)]">
                    {s.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="desk-card p-4">
            <p className="kicker mb-2">Saved here</p>
            <p className="font-display text-2xl font-black text-[var(--charcoal)]">{saved.length}</p>
            <p className="text-xs text-[var(--muted)] mt-1">Stories you bookmarked on this device.</p>
            {saved.length > 0 && (
              <button onClick={() => { setSaved([]); localStorage.removeItem('dor101-news-saved'); }} className="text-xs font-bold underline underline-offset-2 mt-2 hover:text-[var(--blue)]">
                Clear bookmarks
              </button>
            )}
          </div>

          <div className="bg-[var(--red)] text-white rounded-[2px] p-4">
            <p className="text-[10px] font-display font-bold uppercase tracking-[0.18em] text-white/80">Something urgent?</p>
            <p className="font-display text-lg font-black mt-1">Call 2-1-1</p>
            <p className="text-xs text-white/85 mt-1">Free, 24/7, any language — housing, food, heat, or just a person to talk to.</p>
          </div>
        </aside>
      </div>
    </MainLayout>
  );
}
