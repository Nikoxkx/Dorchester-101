import { beforeEach, describe, expect, it, vi } from 'vitest';
import { globalCache } from '@/lib/cache';

const { translateNewsArticles } = vi.hoisted(() => ({ translateNewsArticles: vi.fn(async (articles: unknown[]) => articles) }));
vi.mock('@/lib/newsTranslation', () => ({ translateNewsArticles }));
import { GET } from '@/app/api/news/route';

beforeEach(() => { globalCache.clear(); translateNewsArticles.mockClear(); });

describe('news route language and cached response', () => {
  it('passes the validated language to translation and returns a complete cached payload', async () => {
    const article = { title: 'Original', sourceId: 'dotnews', language: 'en' };
    globalCache.set('news:dotnews::168', {
      articles: [article],
      results: [{ id: 'dotnews', name: 'Dorchester Reporter', homepage: 'https://www.dotnews.com', status: 'ok', count: 1 }],
      fetchedAt: '2026-10-01T12:00:00.000Z', snapshot: null,
    }, 60_000);
    const response = await GET(new Request('http://localhost/api/news?feeds=dotnews&sinceHours=168&lang=kea'));
    const json = await response.json();
    expect(response.status).toBe(200);
    expect(response.headers.get('X-Cache-Status')).toBe('HIT');
    expect(translateNewsArticles).toHaveBeenCalledWith([article], 'kea');
    expect(json).toMatchObject({ cached: true, okFeeds: 1, requestedFeeds: 1, feeds: [{ id: 'dotnews' }], articles: [article] });
    expect(json.lastUpdated).toBe('2026-10-01T12:00:00.000Z');
  });

  it('rejects unknown language codes instead of forwarding them', async () => {
    const response = await GET(new Request('http://localhost/api/news?lang=xx'));
    expect(response.status).toBe(400);
    expect(translateNewsArticles).not.toHaveBeenCalled();
  });
});
