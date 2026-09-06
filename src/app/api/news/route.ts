import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { z } from 'zod';
import { globalCache, CACHE_TTL } from '@/lib/cache';
import { categorize, DEFAULT_NEWS_FEED_IDS, NEWS_FEEDS, type NewsCategorySlug } from '@/data/feeds';
import { NEWS_SNAPSHOT, NEWS_SNAPSHOT_AS_OF } from '@/data/news-snapshot';

export const dynamic = 'force-dynamic';

/**
 * News, from the publishers' own feeds.
 *
 * Three rules, all of them the opposite of what the first version of this route
 * did:
 *  1. Nothing is invented. When feeds fail, the response says which ones failed
 *     and returns the articles that did arrive; it never substitutes
 *     pre-written "local" stories.
 *  2. Nothing is re-published as body text. Titles and the feed's own short
 *     snippet are passed through, and reading happens at the publisher.
 *  3. Nothing claims to be verified. `isVerified` was always `true` for every
 *     article, including the fabricated ones, so it is gone. Age and publisher
 *     are the two honest signals and both are shown.
 */

const parser = new Parser({
  timeout: 8000,
  headers: {
    'User-Agent': 'DOR101 community hub (open-source; each fetch is cached for 15 minutes)',
    Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml',
  },
  customFields: { item: [['content:encoded', 'contentEncoded'], ['description', 'descriptionRaw']] as [string, string][] },
});

const query = z.object({
  /** comma-separated feed ids; empty means the defaults */
  feeds: z.string().optional(),
  /** extra feed urls added by the visitor in Settings */
  custom: z.string().optional(),
  limit: z.coerce.number().int().min(5).max(80).default(40),
  sinceHours: z.coerce.number().int().min(1).max(24 * 30).default(24 * 14),
});

export interface Article {
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

/** Dorchester-relevant, or from a source that is already local by definition. */
const LOCAL_SOURCE_IDS = new Set(['dotnews', 'boston-gov']);

const RELEVANCE = [
  'dorchester', 'fields corner', 'codman square', 'ashmont', 'mattapan', 'savin hill',
  'uphams corner', 'grove hall', 'lower mills', 'jfk', 'umass', 'columbia point',
  'neponset', 'blue hills', 'upton', 'washington st', 'martica', 'savill',
  'boston housing', 'bha', 'mbta', 'red line', 'fairmount', 'section 8',
  'affordable housing', 'rent', 'eviction', 'tenant', 'shelter', 'homeless',
  'masshealth', 'snap', 'ebt', 'food pantry', 'food bank', 'bpda',
];

function isRelevant(title: string, summary: string): boolean {
  const text = `${title} ${summary}`.toLowerCase();
  return RELEVANCE.some((word) => text.includes(word));
}

function snippet(item: { contentSnippet?: string; content?: string; contentEncoded?: string; descriptionRaw?: string }): string {
  const raw = item.contentSnippet || item.descriptionRaw || item.content || item.contentEncoded || '';
  const text = raw
    .replace(/<\s*(script|style)[\s\S]*?<\s*\/\s*\1>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > 320 ? `${text.slice(0, 317).trimEnd()}…` : text;
}

async function readFeed(feed: { id: string; name: string; url: string; language: string; homepage?: string }, sinceMs: number) {
  const articles: Article[] = [];
  let status: FeedResult['status'] = 'ok';
  let error: string | undefined;
  try {
    const parsed = await parser.parseURL(feed.url);
    for (const item of parsed.items ?? []) {
      const publishedAt = item.isoDate || item.pubDate;
      const when = publishedAt ? new Date(publishedAt) : null;
      if (when && Number.isFinite(when.getTime()) === false) continue;
      if (when && Date.now() - when.getTime() > sinceMs) continue;
      const title = (item.title ?? '').trim();
      if (!title) continue;
      const summary = snippet(item as never);
      const link = item.link ?? '';
      if (!link) continue;
      if (!LOCAL_SOURCE_IDS.has(feed.id) && !isRelevant(title, summary)) continue;
      articles.push({
        id: `a-${Buffer.from(link || title).toString('base64url').slice(0, 24)}`,
        title,
        summary,
        source: feed.name,
        sourceId: feed.id,
        sourceUrl: feed.homepage ?? '',
        link,
        publishedAt: (when ?? new Date()).toISOString(),
        ageHours: when ? Math.max(0, Math.round((Date.now() - when.getTime()) / 3_600_000)) : 0,
        category: categorize(`${title} ${summary}`),
        language: feed.language,
      });
    }
    if (!articles.length) status = 'empty';
  } catch (err) {
    status = 'failed';
    error = err instanceof Error ? err.message.slice(0, 160) : 'unreachable';
  }
  return { articles, status, error };
}

/**
 * Titles recur across newsrooms. The first publisher to have run the story keeps
 * it, ordered by feed priority, so a wire story does not appear four times.
 */
function fingerprint(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .slice(0, 8)
    .join(' ');
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = query.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid feed query', articles: [], feeds: [] }, { status: 400 });
  }
  const { feeds: feedIds, custom, limit, sinceHours } = parsed.data;

  const selected = feedIds
    ? NEWS_FEEDS.filter((f) => feedIds.split(',').map((s) => s.trim()).includes(f.id))
    : NEWS_FEEDS.filter((f) => DEFAULT_NEWS_FEED_IDS.includes(f.id));

  const customFeeds = (custom ?? '')
    .split('|')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .slice(0, 6)
    .map((entry, index) => {
      const [rawUrl, label] = entry.split('::');
      try {
        const safe = new URL(rawUrl.trim());
        if (safe.protocol !== 'https:' && safe.protocol !== 'http:') return null;
        return {
          id: `custom-${index}`,
          name: (label ?? safe.hostname).slice(0, 60),
          url: safe.toString(),
          language: 'en',
          homepage: safe.origin,
        };
      } catch {
        return null;
      }
    })
    .filter((f): f is { id: string; name: string; url: string; language: string; homepage: string } => f !== null);

  const cacheKey = `news:${selected.map((f) => f.id).join('+')}:${customFeeds.map((f) => f.url).join('+')}:${sinceHours}`;
  const cached = globalCache.get<{ articles: Article[]; results: FeedResult[]; fetchedAt: string; snapshot: { asOf: string; note: string } | null }>(cacheKey);
  if (cached) {
    return NextResponse.json(
      {
        ...cached,
        articles: cached.articles.slice(0, limit),
        cached: true,
        refreshInterval: CACHE_TTL.NEWS,
        nextUpdate: new Date(new Date(cached.fetchedAt).getTime() + CACHE_TTL.NEWS).toISOString(),
      },
      { headers: { 'cache-control': 'public, s-maxage=180, stale-while-revalidate=900', 'X-Cache-Status': 'HIT' } }
    );
  }

  const requested = [...selected, ...customFeeds];
  const results = await Promise.all(requested.map((feed) => readFeed(feed, sinceHours * 3_600_000)));

  const merged: Article[] = [];
  const feedResults: FeedResult[] = [];
  const seen = new Set<string>();

  requested.forEach((feed, index) => {
    const { articles, status, error } = results[index];
    for (const article of articles) {
      const key = fingerprint(article.title);
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(article);
    }
    feedResults.push({
      id: feed.id,
      name: feed.name,
      homepage: 'homepage' in feed ? feed.homepage : '',
      status: error ? 'failed' : status,
      count: articles.length,
      error,
    });
  });

  merged.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  // ── Last-resort offline snapshot ──────────────────────────────────────
  // If every requested built-in feed failed or returned nothing, serve the
  // verified point-in-time capture instead of an empty page, and say so.
  let snapshotNote: string | null = null;
  if (merged.length === 0) {
    const sinceMs = sinceHours * 3_600_000;
    const builtinIds = new Set(requested.filter((f) => 'id' in f).map((f) => f.id));
    const snapshotArticles = NEWS_SNAPSHOT.filter((article) => {
      if (!builtinIds.has(article.sourceId)) return false;
      const when = new Date(article.publishedAt).getTime();
      if (!Number.isFinite(when) || Date.now() - when > sinceMs) return false;
      if (!LOCAL_SOURCE_IDS.has(article.sourceId) && !isRelevant(article.title, article.summary)) return false;
      return true;
    });
    snapshotArticles
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .forEach((article) => {
        const key = fingerprint(article.title);
        if (seen.has(key)) return;
        seen.add(key);
        merged.push({ ...article, ageHours: Math.max(0, Math.round((Date.now() - new Date(article.publishedAt).getTime()) / 3_600_000)) } satisfies Article);
      });
    if (merged.length > 0) {
      snapshotNote = `Live feeds were unreachable, so these stories are a verified snapshot captured ${NEWS_SNAPSHOT_AS_OF}; visit a publisher for the latest.`;
      for (const feed of feedResults) {
        if (!builtinIds.has(feed.id) || feed.status !== 'failed' && feed.status !== 'empty') continue;
        const count = merged.filter((article) => article.sourceId === feed.id).length;
        if (count === 0) continue;
        feed.status = 'snapshot';
        feed.count = count;
        feed.error = undefined;
      }
    }
  }

  const payload = {
    articles: merged.slice(0, limit),
    feeds: feedResults,
    okFeeds: feedResults.filter((f) => f.status === 'ok').length,
    requestedFeeds: feedResults.length,
    fetchedAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    nextUpdate: new Date(Date.now() + CACHE_TTL.NEWS).toISOString(),
    refreshInterval: CACHE_TTL.NEWS,
    cached: false,
    snapshot: snapshotNote ? { asOf: NEWS_SNAPSHOT_AS_OF, note: snapshotNote } : null,
    relevanceFilter: 'All stories from the local publishers; others must mention Dorchester or a citywide service.',
  };

  // A snapshot answer is held for one minute only: it exists to keep the page
  // readable during a publisher outage, not to delay the live feed's return.
  // The route is asked at most once per panel poll, so this cannot hammer a
  // publisher that is down — it just means recovery takes ≤60 seconds.
  globalCache.set(cacheKey, { articles: merged, results: feedResults, fetchedAt: payload.fetchedAt, snapshot: payload.snapshot }, snapshotNote ? 60_000 : CACHE_TTL.NEWS);

  return NextResponse.json(payload, {
    // 200 even when some feeds fail: partial news is not an error, and the
    // per-feed status tells the interface which sentence to show.
    status: 200,
    headers: {
      'cache-control': 'public, s-maxage=180, stale-while-revalidate=900',
      'X-Cache-Status': 'MISS',
      'X-Articles-Count': String(merged.length),
    },
  });
}

/** Which feed ids the app should offer as defaults, for the settings screen. */
export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'X-Feeds': String(NEWS_FEEDS.length),
      'X-Default-Feeds': DEFAULT_NEWS_FEED_IDS.join(','),
      'X-Local-Sources': [...LOCAL_SOURCE_IDS].join(','),
    },
  });
}
