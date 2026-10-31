import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Article } from '@/app/api/news/route';

const { translate } = vi.hoisted(() => ({ translate: vi.fn() }));
vi.mock('@translated/lara', () => ({
  AccessKey: class { constructor(_id: string, _secret: string) {} },
  Translator: class { translate = translate; },
}));

const source: Article = {
  id: 'a1', title: 'A new local food pantry opens', summary: 'The pantry opens Monday.',
  source: 'Dorchester Reporter', sourceId: 'dotnews', sourceUrl: 'https://www.dotnews.com',
  link: 'https://www.dotnews.com/news', publishedAt: '2026-10-01T12:00:00Z', ageHours: 3,
  category: 'food', language: 'en',
};

beforeEach(() => {
  vi.resetModules();
  translate.mockReset();
  delete process.env.NEWS_TRANSLATION_PROVIDER;
  delete process.env.NEWS_TRANSLATION_DAILY_CHARS;
  delete process.env.LARA_ACCESS_KEY_ID;
  delete process.env.LARA_ACCESS_KEY_SECRET;
});
afterEach(() => vi.unstubAllEnvs());

function enable(budget = '10000') {
  vi.stubEnv('NEWS_TRANSLATION_PROVIDER', 'lara');
  vi.stubEnv('NEWS_TRANSLATION_DAILY_CHARS', budget);
  vi.stubEnv('LARA_ACCESS_KEY_ID', 'test-id');
  vi.stubEnv('LARA_ACCESS_KEY_SECRET', 'test-secret');
}

describe('optional public news translation', () => {
  it('does not call an external service unless explicitly enabled with credentials and a budget', async () => {
    const { translateNewsArticles } = await import('@/lib/newsTranslation');
    expect(await translateNewsArticles([source], 'es')).toEqual([source]);
    enable('0');
    expect(await translateNewsArticles([source], 'es')).toEqual([source]);
    expect(translate).not.toHaveBeenCalled();
  });

  it('translates built-in public excerpts, preserves originals, and deduplicates concurrent requests', async () => {
    enable();
    translate.mockResolvedValue({ translation: ['Despensa local', 'Abre el lunes.'] });
    const { translateNewsArticles } = await import('@/lib/newsTranslation');
    const [first, second] = await Promise.all([
      translateNewsArticles([source], 'es'), translateNewsArticles([source], 'es'),
    ]);
    expect(translate).toHaveBeenCalledTimes(1);
    expect(translate).toHaveBeenCalledWith([source.title, source.summary], 'en-US', 'es-419', expect.objectContaining({ contentType: 'text/plain', noTrace: true }));
    expect(first[0]).toMatchObject({
      title: 'Despensa local', summary: 'Abre el lunes.', language: 'es',
      translation: { originalTitle: source.title, originalSummary: source.summary, originalLanguage: 'en' },
    });
    expect(second).toEqual(first);
    expect(source.title).toBe('A new local food pantry opens');
    expect(await translateNewsArticles([source], 'es')).toEqual(first);
    expect(translate).toHaveBeenCalledTimes(1);
  });

  it('never sends visitor-supplied custom feeds, unknown languages or oversized text', async () => {
    enable();
    const { translateNewsArticles } = await import('@/lib/newsTranslation');
    const custom = { ...source, sourceId: 'custom-0' };
    const unknown = { ...source, language: 'und' };
    const oversized = { ...source, title: 'x'.repeat(1001) };
    expect(await translateNewsArticles([custom, unknown, oversized], 'es')).toEqual([custom, unknown, oversized]);
    expect(translate).not.toHaveBeenCalled();
  });

  it('keeps originals on provider failure, invalid output or insufficient budget', async () => {
    enable('100');
    translate.mockRejectedValueOnce(new Error('private provider error'));
    translate.mockResolvedValueOnce({ translation: ['incomplete'] });
    const { translateNewsArticles } = await import('@/lib/newsTranslation');
    expect(await translateNewsArticles([source], 'ar')).toEqual([source]);
    // The failed call still consumes its reservation: a retry cannot overspend.
    expect(await translateNewsArticles([source], 'ar')).toEqual([source]);
    expect(translate).toHaveBeenCalledTimes(1);
  });

  it('falls back when numeric facts change but accepts equivalent Arabic digit scripts', async () => {
    enable();
    const dated = { ...source, title: 'Pantry opens on 31 October 2026', summary: 'Call 211.' };
    translate.mockResolvedValueOnce({ translation: ['افتتاح المخزن في ٣١ أكتوبر ٢٠٢٦', 'اتصل على ٢١١.'] });
    translate.mockResolvedValueOnce({ translation: ['افتتاح المخزن في أكتوبر', 'اتصل على ٢١١.'] });
    const { translateNewsArticles } = await import('@/lib/newsTranslation');
    expect((await translateNewsArticles([dated], 'ar'))[0].language).toBe('ar');
    expect(await translateNewsArticles([dated], 'so')).toEqual([dated]);
  });

  it('does not accept malformed provider translations', async () => {
    enable();
    translate.mockResolvedValue({ translation: ['incomplete'] });
    const { translateNewsArticles } = await import('@/lib/newsTranslation');
    expect(await translateNewsArticles([source], 'zh')).toEqual([source]);
  });
});
