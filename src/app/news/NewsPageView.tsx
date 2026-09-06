'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { CircleAlert, ExternalLink, Newspaper, RefreshCw, Rss, SlidersHorizontal } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProjectNote } from '@/components/layout/ProjectNote';
import { SourceMark } from '@/components/sources/SourceMark';
import { FEED_SOURCE } from '@/data/sources';
import { Badge } from '@/components/ui/Badge';
import { DataRefreshIndicator } from '@/components/ui/LoadingSpinner';
import { useI18n } from '@/i18n/hook';
import { useAppStore } from '@/stores/appStore';
import { useLivePolling } from '@/hooks/useLivePolling';
import { NEWS_FEEDS, type NewsCategorySlug } from '@/data/feeds';
import { cn } from '@/lib/utils';
import type { TranslationKey } from '@/i18n/en';

/**
 * Local news, read at the publisher.
 *
 * The page shows headlines and the feed's own snippet and then sends the reader to
 * the newsroom, because re-publishing body text is not what this project is
 * licensed to do. Two things a reader needs to judge a headline are always on
 * screen: how old it is, and which publisher it came from. Nothing here claims to
 * have verified a story; a feed that failed to load says so instead of being
 * quietly dropped.
 */

const SLUGS: NewsCategorySlug[] = ['housing', 'transportation', 'food', 'health', 'community', 'other'];
const CATEGORY_KEYS: Record<NewsCategorySlug, TranslationKey> = {
  housing: 'news.category.housing',
  transportation: 'news.category.transportation',
  food: 'news.category.food',
  health: 'news.category.health',
  community: 'news.category.community',
  other: 'news.category.other',
};

const WINDOWS = [
  { hours: 24, key: 'news.last24h' as TranslationKey },
  { hours: 72, key: 'time.daysAgo' as TranslationKey, label: '3 d' },
  { hours: 168, key: 'time.daysAgo' as TranslationKey, label: '7 d' },
  { hours: 336, key: 'time.daysAgo' as TranslationKey, label: '14 d' },
];

interface Article {
  id: string;
  title: string;
  summary: string;
  source: string;
  sourceId: string;
  sourceUrl: string;
  link: string;
  publishedAt: string;
  ageHours: number;
  category: NewsCategorySlug;
  language: string;
}

interface FeedResult {
  id: string;
  name: string;
  homepage: string;
  status: 'ok' | 'failed' | 'empty' | 'snapshot';
  count: number;
  error?: string;
}

interface NewsPayload {
  articles: Article[];
  feeds: FeedResult[];
  okFeeds: number;
  requestedFeeds: number;
  fetchedAt: string;
  lastUpdated: string;
  nextUpdate: string | null;
  refreshInterval: number;
  cached: boolean;
  snapshot?: { asOf: string; note: string } | null;
  relevanceFilter: boolean;
}

export function NewsPageView() {
  const { t, lang, format } = useI18n();
  const enabledSources = useAppStore((s) => s.enabledNewsSources);
  const customFeeds = useAppStore((s) => s.customFeeds);
  const setEnabledNewsSources = useAppStore((s) => s.setEnabledNewsSources);
  const announce = useAppStore((s) => s.announce);

  const [payload, setPayload] = useState<NewsPayload | null>(null);
  const [category, setCategory] = useState<NewsCategorySlug | 'all'>('all');
  const [sinceHours, setSinceHours] = useState(168);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [refreshing, setRefreshing] = useState(false);
  // Read inside `load` without changing the callback's identity — a new identity
  // would make useLivePolling treat a data arrival as a reason to fetch again.
  const hasPayloadRef = useRef(false);

  const load = useCallback(
    async (silent = false) => {
      // A silent poll never tears the list down: the reader keeps the stories
      // they are reading and the new payload swaps in underneath. Only the very
      // first load (or a hard retry after failure) shows the skeleton, which is
      // what keeps this page from flashing on its own refresh cycle.
      if (!silent && !hasPayloadRef.current) setState('loading');
      setRefreshing(!silent);
      try {
        const params = new URLSearchParams({
          limit: '60',
          sinceHours: String(sinceHours),
        });
        if (enabledSources.length > 0) params.set('feeds', enabledSources.join(','));
        if (customFeeds.length > 0) params.set('custom', customFeeds.map((feed) => feed.url).join(','));
        const response = await fetch(`/api/news?${params.toString()}`, {
          headers: { 'accept-language': lang },
        });
        if (!response.ok) throw new Error(String(response.status));
        const json = (await response.json()) as NewsPayload;
        hasPayloadRef.current = true;
        setPayload(json);
        setState('ready');
        if (silent) announce(t('news.autoRefreshed'), 'polite');
      } catch {
        setState((prev) => (prev === 'ready' ? prev : 'error'));
      } finally {
        setRefreshing(false);
      }
    },
    [announce, customFeeds, enabledSources, lang, sinceHours, t]
  );

  // The server holds each feed mix for 15 minutes, so polling faster than that
  // just re-downloads the same answer. Five minutes is the fastest the client
  // asks, and the tab must be visible (useLivePolling) for even that.
  //
  // The callback must be identity-stable: useLivePolling re-runs its fetch
  // effect whenever `refresh` changes, and an inline arrow would hand it a new
  // function on every render — fetch, re-render, fetch again, forever. That
  // loop was the page's old "constantly refreshing" behaviour.
  const loadSilent = useCallback(async () => load(true), [load]);
  const { intervalMs, enabled: polling } = useLivePolling(loadSilent, { minMs: 300_000 });

  const articles = useMemo(() => payload?.articles ?? [], [payload]);
  const counts = useMemo(() => {
    const map = new Map<NewsCategorySlug, number>();
    for (const article of articles) map.set(article.category, (map.get(article.category) ?? 0) + 1);
    return map;
  }, [articles]);

  const visible = useMemo(
    () => (category === 'all' ? articles : articles.filter((article) => article.category === category)),
    [articles, category]
  );

  const fresh = visible.filter((article) => article.ageHours <= 24);
  const older = visible.filter((article) => article.ageHours > 24);

  return (
    <MainLayout>
      <div className="flex flex-col gap-5 pb-10">
        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="inline-flex items-center gap-1.5 font-heading text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
              <Newspaper className="h-3.5 w-3.5" aria-hidden="true" />
              {t('news.kicker')}
            </p>
            <h1 className="mt-1 font-heading text-2xl font-extrabold leading-tight sm:text-3xl">{t('news.title')}</h1>
            <p className="mt-1 max-w-prose text-sm leading-relaxed text-[var(--color-text-secondary)]">{t('news.description')}</p>
            {payload?.snapshot && (
              <p role="status" className="mt-2 inline-flex max-w-prose items-start gap-1.5 rounded-lg border border-[var(--color-accent-amber)]/40 bg-[var(--color-accent-amber)]/10 px-2.5 py-1.5 text-xs text-[var(--color-text-secondary)]">
                <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-accent-amber)]" aria-hidden="true" />
                {payload.snapshot.note}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <DataRefreshIndicator
              lastUpdated={payload?.lastUpdated ?? null}
              isRefreshing={refreshing}
              nextUpdate={polling ? new Date(Date.now() + intervalMs).toISOString() : null}
            />
            <button
              type="button"
              onClick={() => void load()}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 font-heading text-xs font-bold transition-colors hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)]"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', refreshing && 'animate-spin')} aria-hidden="true" />
              {t('news.refresh')}
            </button>
          </div>
        </header>

        {/* Which publishers answered. A failed feed is named, not hidden. */}
        <section
          aria-label={t('common.sources')}
          className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/90 px-3 py-2.5"
        >
          <span className="inline-flex items-center gap-1.5 font-heading text-[11px] font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
            <Rss className="h-3.5 w-3.5" aria-hidden="true" />
            {payload ? t('news.feedPartial', { ok: String(payload.okFeeds), total: String(payload.requestedFeeds) }) : t('common.loading')}
          </span>
          <span className="mx-1 hidden h-4 w-px bg-[var(--color-border)] sm:block" aria-hidden="true" />
          {NEWS_FEEDS.filter((feed) => feed.language === 'en' || feed.language === lang).map((feed) => {
            const result = payload?.feeds?.find((f) => f.id === feed.id);
            const on = enabledSources.includes(feed.id);
            return (
              <button
                key={feed.id}
                type="button"
                aria-pressed={on}
                onClick={() => {
                  const base = enabledSources.length === 0 ? NEWS_FEEDS.filter((f) => f.enabledByDefault).map((f) => f.id) : enabledSources;
                  setEnabledNewsSources(base.includes(feed.id) ? base.filter((id) => id !== feed.id) : [...base, feed.id]);
                }}
                title={`${feed.name}${result?.error ? ` — ${t('news.feedFailed')}` : ''}`}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-heading text-[11px] font-semibold transition-colors',
                  on
                    ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)] text-white'
                    : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)]'
                )}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    background:
                      result?.status === 'ok'
                        ? 'var(--mbta-green)'
                        : result?.status === 'empty' || result?.status === 'snapshot'
                          ? 'var(--color-accent-amber)'
                          : 'var(--color-text-muted)',
                  }}
                  aria-hidden="true"
                />
                {feed.name}
              </button>
            );
          })}
        </section>

        <div className="flex flex-col gap-3 xl:flex-row xl:items-start">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <FilterChip active={category === 'all'} onClick={() => setCategory('all')} label={t('common.all')} count={articles.length} />
              {SLUGS.map((slug) => (
                <FilterChip
                  key={slug}
                  active={category === slug}
                  onClick={() => setCategory(slug)}
                  label={t(CATEGORY_KEYS[slug])}
                  count={counts.get(slug) ?? 0}
                />
              ))}
            </div>

            {state === 'loading' && (
              <ul className="mt-4 flex flex-col gap-3" aria-busy="true">
                {[0, 1, 2, 3].map((i) => (
                  <li key={i} className="skeleton h-28 rounded-2xl" />
                ))}
              </ul>
            )}

            {state === 'error' && (
              <p className="mt-4 flex items-center gap-2 rounded-2xl border border-[var(--color-accent-critical)]/40 bg-[var(--color-accent-critical)]/8 px-4 py-3 text-sm">
                {t('news.error')}
                <button type="button" onClick={() => void load()} className="font-heading font-bold underline decoration-dotted underline-offset-2">
                  {t('common.retry')}
                </button>
              </p>
            )}

            {state === 'ready' && visible.length === 0 && !refreshing && (
              <p className="mt-4 rounded-2xl border border-dashed border-[var(--color-border)] px-4 py-6 text-center text-sm text-[var(--color-text-secondary)]">
                {t('news.empty')}
              </p>
            )}

            {/* While a filter change refetches, the list keeps showing the stories
                already on screen (stale-while-revalidate) instead of collapsing to
                skeletons — the layout never jumps under the reader. */}
            {state !== 'loading' && state !== 'error' && visible.length > 0 && (
              <>
                {fresh.length > 0 && (
                  <section className="mt-4" aria-label={t('news.last24h')}>
                    <h2 className="font-heading text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">{t('news.last24h')}</h2>
                    <ul className="mt-2 flex flex-col gap-2.5">
                      {fresh.map((article) => (
                        <ArticleRow key={article.id} article={article} highlight />
                      ))}
                    </ul>
                  </section>
                )}

                {older.length > 0 && (
                  <section className="mt-5" aria-label={t('news.title')}>
                    {fresh.length > 0 && (
                      <h2 className="font-heading text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">{t('common.all')}</h2>
                    )}
                    <ul className="mt-2 flex flex-col gap-2.5">
                      {older.map((article) => (
                        <ArticleRow key={article.id} article={article} />
                      ))}
                    </ul>
                  </section>
                )}
              </>
            )}
          </div>

          <aside className="xl:w-72 xl:shrink-0">
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/90 p-3.5">
              <h2 className="flex items-center gap-1.5 font-heading text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
                <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                {t('common.filters')}
              </h2>
              <div className="mt-2 flex flex-wrap gap-1">
                {WINDOWS.map((window) => (
                  <button
                    key={window.hours}
                    type="button"
                    aria-pressed={sinceHours === window.hours}
                    onClick={() => setSinceHours(window.hours)}
                    className={cn(
                      'rounded-full border px-2.5 py-1 font-heading text-[11px] font-bold tabular-nums transition-colors',
                      sinceHours === window.hours
                        ? 'border-transparent bg-[var(--color-accent-primary)] text-white'
                        : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent-primary)]'
                    )}
                  >
                    {window.label ?? t('news.last24h')}
                  </button>
                ))}
              </div>
              <p className="mt-2.5 text-[11px] leading-snug text-[var(--color-text-muted)]">{t('news.sourcesNote')}</p>
              <p className="mt-1.5 text-[11px] leading-snug text-[var(--color-text-muted)]">{t('news.paywallNote')}</p>
              <Link
                href="/settings"
                className="mt-2.5 inline-flex items-center gap-1 font-heading text-[11px] font-bold text-[var(--color-accent-primary)] underline decoration-dotted underline-offset-2"
              >
                {t('settings.newsSources')}
              </Link>
            </div>
          </aside>
        </div>

        {/* About this information — a full-width block BELOW the two-column area.
            It used to sit inside the flex row as a third column, which squeezed it
            beside the filters sidebar and made its inner grid overlap the list. */}
        <ProjectNote sources={['dotnews', 'bostongov', 'wbur', 'gbh', 'globe', 'mbta']}>
          Headlines are read directly from each publisher&apos;s own feed, no more than once every five minutes while the page is open, and link back to the publisher. Nothing is rewritten, ranked by engagement or paid for. If a feed fails, the page says which one.
        </ProjectNote>
      </div>
    </MainLayout>
  );

  function ArticleRow({ article, highlight }: { article: Article; highlight?: boolean }) {
    return (
      <li>
        <motion.article
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className={cn(
            'rounded-2xl border bg-[var(--color-bg-primary)]/95 p-3.5 transition-colors hover:border-[var(--color-accent-primary)]',
            highlight ? 'border-[var(--color-accent-primary)]/40' : 'border-[var(--color-border)]'
          )}
        >
          <div className="flex flex-wrap items-center gap-1.5">
            {FEED_SOURCE[article.sourceId] ? (
              <SourceMark id={FEED_SOURCE[article.sourceId]} size="xs" withName />
            ) : (
              <span className="font-heading text-[11px] font-bold uppercase tracking-wide text-[var(--color-text-muted)]">{article.source}</span>
            )}
            <span className="text-[11px] text-[var(--color-text-muted)]" aria-hidden="true">
              ·
            </span>
            <span className="text-[11px] tabular-nums text-[var(--color-text-muted)]">{format.relative(article.publishedAt)}</span>
            <Badge variant="default">{t(CATEGORY_KEYS[article.category])}</Badge>
            {article.language !== lang && article.language !== 'en' && (
              <span className="rounded-full border border-[var(--color-border)] px-1.5 py-0.5 text-[10px] uppercase text-[var(--color-text-muted)]">
                {article.language}
              </span>
            )}
          </div>
          <h3 className="mt-1.5 font-heading text-base font-bold leading-snug">
            <a
              href={article.link}
              target="_blank"
              rel="noreferrer noopener"
              className="decoration-[var(--color-accent-primary)] underline-offset-2 hover:underline"
            >
              {article.title}
            </a>
          </h3>
          {article.summary && (
            <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-[var(--color-text-secondary)]" dir="auto">
              {article.summary}
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
            <a
              href={article.link}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 font-heading font-bold text-[var(--color-accent-primary)]"
            >
              {t('news.openStory', { source: article.source })} <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
            <a href={article.sourceUrl} target="_blank" rel="noreferrer noopener" className="text-[var(--color-text-muted)] hover:underline">
              {t('news.fromPublisher')}
            </a>
            <span className="text-[var(--color-text-muted)]">{t('news.published', { time: format.date(article.publishedAt, 'short') })}</span>
          </div>
        </motion.article>
      </li>
    );
  }
}

function FilterChip({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-heading text-xs font-semibold transition-colors',
        active
          ? 'border-transparent bg-[var(--color-accent-primary)] text-white'
          : 'border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)]'
      )}
    >
      {label}
      <span className={cn('tabular-nums', active ? 'text-white/80' : 'text-[var(--color-text-muted)]')}>{count}</span>
    </button>
  );
}
