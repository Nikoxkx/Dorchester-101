import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { globalCache, CACHE_TTL } from '@/lib/cache';

const parser = new Parser({
  timeout: 8000,
  headers: { 'User-Agent': 'DOR101/1.3 (https://github.com/Nikoxkx/Dorchester-101)' },
});

const RSS_FEEDS = [
  { name: 'Dorchester Reporter', url: 'https://www.dotnews.com/rss.xml', category: 'Local' },
  { name: 'Boston.gov News', url: 'https://www.boston.gov/news/feed', category: 'Government' },
  { name: 'WBUR Boston', url: 'https://www.wbur.org/rss.xml', category: 'Public Radio' },
  { name: 'GBH News', url: 'https://www.wgbh.org/rss', category: 'Public Media' },
];

const KEYWORDS = [
  'dorchester', 'fields corner', 'codman', 'ashmont', 'savin hill', 'uphams',
  'grove hall', 'lower mills', 'mattapan', 'neponset', 'columbia road',
  'bha', 'boston housing', 'mbta', 'masshealth', 'section 8', 'affordable housing',
  'rent', 'eviction', 'snap', 'ebt', 'bpda', 'red line', 'fairmount',
];

interface Article {
  id: string;
  title: string;
  summary: string;
  source: string;
  sourceUrl: string;
  category: string;
  publishedAt: string;
  isVerified: boolean;
}

function relevant(title: string, summary: string) {
  const content = `${title} ${summary}`.toLowerCase();
  return KEYWORDS.some((k) => content.includes(k));
}

function categorize(title: string, summary: string): string {
  const c = `${title} ${summary}`.toLowerCase();
  if (/housing|rent|bha|evict|affordable/.test(c)) return 'Housing';
  if (/mbta|bus|subway|train|red line/.test(c)) return 'Transportation';
  if (/food|snap|pantr|meal/.test(c)) return 'Food Security';
  if (/health|clinic|hospital|masshealth/.test(c)) return 'Healthcare';
  if (/school|job|youth|employ/.test(c)) return 'Employment';
  return 'Community';
}

function normalize(item: Parser.Item, source: string): Article {
  const publishedAt = item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString();
  const title = item.title || 'Untitled';
  const summary = (item.contentSnippet || item.content || '').replace(/<[^>]+>/g, '').slice(0, 280);
  const link = item.link || '';
  return {
    id: Buffer.from(link || title).toString('base64').slice(0, 24),
    title,
    summary,
    source,
    sourceUrl: link,
    category: categorize(title, summary),
    publishedAt,
    isVerified: true,
  };
}

async function fetchAll(): Promise<Article[]> {
  const batches = await Promise.allSettled(
    RSS_FEEDS.map(async (feed) => {
      const data = await parser.parseURL(feed.url);
      return (data.items || []).map((item) => normalize(item, feed.name));
    }),
  );

  const articles: Article[] = [];
  for (const batch of batches) {
    if (batch.status === 'fulfilled') articles.push(...batch.value);
  }

  const relevantOnes = articles.filter((a) => relevant(a.title, a.summary));
  const pool = relevantOnes.length > 0 ? relevantOnes : articles;

  const seen = new Map<string, Article>();
  for (const a of pool) {
    const key = a.title.toLowerCase().slice(0, 48);
    const existing = seen.get(key);
    if (!existing || new Date(a.publishedAt) > new Date(existing.publishedAt)) {
      seen.set(key, a);
    }
  }

  return Array.from(seen.values()).sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export async function GET() {
  try {
    const cached = globalCache.get<Article[]>('news:articles');
    if (cached && cached.length > 0) {
      return NextResponse.json({
        articles: cached,
        sources: RSS_FEEDS,
        lastUpdated: new Date().toISOString(),
        nextUpdate: new Date(Date.now() + CACHE_TTL.NEWS).toISOString(),
        refreshInterval: CACHE_TTL.NEWS,
        cached: true,
      });
    }

    const articles = await fetchAll();
    if (articles.length) globalCache.set('news:articles', articles, CACHE_TTL.NEWS);

    return NextResponse.json({
      articles,
      sources: RSS_FEEDS,
      lastUpdated: new Date().toISOString(),
      nextUpdate: new Date(Date.now() + CACHE_TTL.NEWS).toISOString(),
      refreshInterval: CACHE_TTL.NEWS,
      cached: false,
    });
  } catch {
    return NextResponse.json({
      articles: [],
      sources: RSS_FEEDS,
      lastUpdated: new Date().toISOString(),
      refreshInterval: CACHE_TTL.NEWS,
      error: 'News feeds unavailable',
    });
  }
}
