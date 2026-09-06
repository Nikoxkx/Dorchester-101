import { describe, it, expect } from 'vitest';
import { normalize, relevant, categorize, RSS_FEEDS } from '@/lib/news';
import type { Parser } from 'rss-parser';

describe('news parser', () => {
  const item = (over: Partial<Parser.Item> = {}): Parser.Item => ({
    title: 'City approves 60 new income-restricted apartments in Fields Corner',
    link: 'https://example.com/article-1',
    pubDate: 'Mon, 31 Aug 2026 12:00:00 GMT',
    contentSnippet: 'The BPDA board voted Thursday on the Dorchester Avenue project.',
    ...over,
  });

  it('normalizes an RSS item into the shared Article shape', () => {
    const a = normalize(item(), 'Dorchester Reporter');
    expect(a.title).toMatch(/Fields Corner/);
    expect(a.source).toBe('Dorchester Reporter');
    expect(a.sourceUrl).toBe('https://example.com/article-1');
    expect(a.publishedAt).toBe(new Date('2026-08-31T12:00:00.000Z').toISOString());
    expect(a.id).toBeTruthy();
    expect(typeof a.isVerified).toBe('boolean');
  });

  it('strips HTML from summaries and caps length', () => {
    const a = normalize(item({ contentSnippet: '<p>' + 'x'.repeat(500) + '</p>' }), 'WBUR');
    expect(a.summary).not.toMatch(/</);
    expect(a.summary.length).toBeLessThanOrEqual(280);
  });

  it('survives missing link/title/pubDate without throwing', () => {
    const a = normalize({ contentSnippet: 'just text' }, 'GBH News');
    expect(a.title).toBe('Untitled');
    expect(a.sourceUrl).toBe('');
    expect(a.publishedAt).toBeTruthy();
  });

  it('relevance filter matches Dorchester vocabulary', () => {
    expect(relevant('Rent in Dorchester rises', '')).toBe(true);
    expect(relevant('Red Line delays at Ashmont', '')).toBe(true);
    expect(relevant('Weather report: sunny', 'mild afternoon')).toBe(false);
  });

  it('categorizes by topic', () => {
    expect(categorize('BHA waitlist opens', '')).toBe('Housing');
    expect(categorize('MBTA cuts service', '')).toBe('Transportation');
    expect(categorize('SNAP benefits expand', '')).toBe('Food Security');
    expect(categorize('Farmers market returns', '')).toBe('Community');
  });

  it('feed list carries the outlets that cover the neighborhood', () => {
    const names = RSS_FEEDS.map((f) => f.name);
    expect(names).toContain('Dorchester Reporter');
    expect(names).toContain('Bay State Banner');
    expect(names).toContain('WBUR Boston');
    expect(names).toContain('GBH News');
    // Boston Globe discontinued public RSS in 2023 — deliberately absent.
    expect(names).not.toContain('Boston Globe');
  });
});

describe('realtime notification builder', () => {
  it('builds from verified datasets only, sorted newest first', async () => {
    const { buildNotifications } = await import('@/lib/notifications');
    const list = await buildNotifications();
    expect(list.length).toBeGreaterThan(3);
    // Every notification names its source
    for (const n of list) {
      expect(n.source).toBeTruthy();
      expect(n.createdAt).toBeTruthy();
      expect(['low', 'medium', 'high', 'urgent']).toContain(n.priority);
    }
    const times = list.map((n) => new Date(n.createdAt).getTime());
    for (let i = 1; i < times.length; i++) {
      expect(times[i - 1]).toBeGreaterThanOrEqual(times[i]);
    }
  });
});
