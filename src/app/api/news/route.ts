import { NextResponse } from 'next/server';
import { globalCache, CACHE_TTL } from '@/lib/cache';
import { fetchAll, RSS_FEEDS } from '@/lib/news';

/**
 * GET /api/news — live aggregation, parsed server-side and cached.
 * Revalidated on a schedule; clients also learn about new articles
 * through the SSE channel (`news` event).
 */
export const revalidate = 900; // align with CACHE_TTL.NEWS

export async function GET() {
  try {
    const cached = globalCache.get<Awaited<ReturnType<typeof fetchAll>>>('news:articles');
    if (cached && cached.length > 0) {
      return NextResponse.json({
        articles: cached,
        sources: RSS_FEEDS.map(({ name, category }) => ({ name, category })),
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
      sources: RSS_FEEDS.map(({ name, category }) => ({ name, category })),
      lastUpdated: new Date().toISOString(),
      nextUpdate: new Date(Date.now() + CACHE_TTL.NEWS).toISOString(),
      refreshInterval: CACHE_TTL.NEWS,
      cached: false,
    });
  } catch {
    return NextResponse.json({
      articles: [],
      sources: RSS_FEEDS.map(({ name, category }) => ({ name, category })),
      lastUpdated: new Date().toISOString(),
      refreshInterval: CACHE_TTL.NEWS,
      error: 'News feeds unavailable',
    });
  }
}
