import { beforeEach, describe, expect, it, vi } from 'vitest';
import { globalCache } from '@/lib/cache';

const { fetchPublicFeed } = vi.hoisted(() => ({
  fetchPublicFeed: vi.fn(async () => `<?xml version="1.0"?><rss version="2.0"><channel><title>Test feed</title><link>https://publisher.example/</link><description>Local</description>
    <item><title>Dorchester community update</title><link>https://publisher.example/local</link><description>News</description></item>
    <item><title>Dorchester unsafe link</title><link>javascript:alert(1)</link></item>
  </channel></rss>`),
}));
vi.mock('@/lib/publicFeed', () => ({ fetchPublicFeed }));
vi.mock('@/lib/newsTranslation', () => ({ translateNewsArticles: async (articles: unknown[]) => articles }));
import { GET } from '@/app/api/news/route';

beforeEach(() => { globalCache.clear(); fetchPublicFeed.mockClear(); });

describe('custom RSS route', () => {
  it('fetches multiple custom feeds through the guarded fetch and rejects unsafe article links', async () => {
    const params = new URLSearchParams({ feeds: 'none', custom: 'https://publisher.example/rss|https://another.example/rss', sinceHours: '168' });
    const response = await GET(new Request(`https://site.example/api/news?${params}`));
    const payload = await response.json();
    expect(fetchPublicFeed).toHaveBeenCalledTimes(2);
    expect(fetchPublicFeed).toHaveBeenCalledWith('https://publisher.example/rss');
    expect(fetchPublicFeed).toHaveBeenCalledWith('https://another.example/rss');
    expect(payload.feeds).toHaveLength(2);
    expect(payload.articles).toHaveLength(1); // duplicate title appears in both feeds
    expect(payload.articles[0].link).toBe('https://publisher.example/local');
    expect(payload.articles.every((article: { link: string }) => !article.link.startsWith('javascript:'))).toBe(true);
  });
});
