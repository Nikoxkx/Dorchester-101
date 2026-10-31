import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import { useAppStore } from '@/stores/appStore';
import { dictionaries } from '@/i18n';
import { makeTranslator } from '@/i18n/runtime';
import { LANGUAGES } from '@/i18n/config';
import { formatNumber } from '@/i18n/formatters';

vi.mock('@/components/layout/MainLayout', () => ({ MainLayout: ({ children }: { children: React.ReactNode }) => <main>{children}</main> }));
import { NewsPageView } from '@/app/news/NewsPageView';

const original = {
  id: 'a1', title: 'A local food pantry opens', summary: 'Open Monday.', source: 'Dorchester Reporter',
  sourceId: 'dotnews', sourceUrl: 'https://www.dotnews.com', link: 'https://www.dotnews.com/story',
  publishedAt: '2026-10-01T12:00:00.000Z', ageHours: 2, category: 'food', language: 'en',
};
function payload(article: typeof original & { translation?: object }, snapshot = false) {
  return {
    articles: [article], feeds: [{ id: 'dotnews', status: 'ok' }], okFeeds: 1, requestedFeeds: 1,
    fetchedAt: '2026-10-01T12:00:00.000Z', lastUpdated: '2026-10-01T12:00:00.000Z',
    snapshot: snapshot ? { asOf: '2026-10-01', note: 'Untranslated server text' } : null,
  };
}
const response = (value: unknown) => new Response(JSON.stringify(value), { status: 200, headers: { 'content-type': 'application/json' } });

beforeEach(() => { window.localStorage.clear(); useAppStore.getState().resetAll(); useAppStore.getState().setAutoRefresh(false); });
afterEach(() => vi.unstubAllGlobals());

describe('live news language handling', () => {
  it('localizes all news time-window filters', () => {
    vi.stubGlobal('fetch', vi.fn(async () => response(payload(original))));
    render(<NewsPageView />);
    for (const language of LANGUAGES) {
      act(() => useAppStore.getState().setLanguage(language.code));
      const t = makeTranslator(dictionaries[language.code], language.code);
      for (const days of [3, 7, 14]) {
        expect(screen.getByRole('button', { name: t('news.lastDays', { count: formatNumber(days, language.code) }) })).toBeTruthy();
      }
    }
  });

  it('labels machine translations and keeps the original available with correct language metadata', async () => {
    useAppStore.getState().setLanguage('ar');
    const translated = {
      ...original, title: 'افتتاح مخزن طعام محلي', summary: 'يفتح يوم الاثنين.', language: 'ar',
      translation: { originalTitle: original.title, originalSummary: original.summary, originalLanguage: 'en' },
    };
    const fetcher = vi.fn(async () => response(payload(translated, true)));
    vi.stubGlobal('fetch', fetcher);
    render(<NewsPageView />);
    const t = makeTranslator(dictionaries.ar, 'ar');
    expect(await screen.findByText(translated.title)).toBeTruthy();
    expect(fetcher.mock.calls[0][0]).toContain('lang=ar');
    expect(screen.getByText(t('news.machineNotice'))).toBeTruthy();
    expect(screen.getByText(t('news.showOriginal'))).toBeTruthy();
    expect(screen.getByText(translated.title).closest('h3')?.getAttribute('lang')).toBe('ar');
    expect(screen.getByText(original.title).parentElement?.getAttribute('lang')).toBe('en');
    expect(screen.queryByText('Untranslated server text')).toBeNull();
    expect(screen.getByText(/2026/)).toBeTruthy();
  });

  it('labels untranslated publisher text instead of claiming it is in the selected language', async () => {
    useAppStore.getState().setLanguage('es');
    vi.stubGlobal('fetch', vi.fn(async () => response(payload(original))));
    render(<NewsPageView />);
    const title = await screen.findByText(original.title);
    expect(title.closest('h3')?.getAttribute('lang')).toBe('en');
    const t = makeTranslator(dictionaries.es, 'es');
    expect(screen.getByText(t('news.originalLanguage', { language: t('spoken.english') }))).toBeTruthy();
  });

  it('refetches the newest language after a slow request, even with auto-refresh disabled', async () => {
    let resolveFirst!: (value: Response) => void;
    const slow = new Promise<Response>((resolve) => { resolveFirst = resolve; });
    const fetcher = vi.fn((url: string) => url.includes('lang=en') ? slow : Promise.resolve(response(payload(original))));
    vi.stubGlobal('fetch', fetcher);
    render(<NewsPageView />);
    expect(fetcher).toHaveBeenCalledTimes(1);
    act(() => useAppStore.getState().setLanguage('es'));
    expect(fetcher).toHaveBeenCalledTimes(1);
    await act(async () => { resolveFirst(response(payload({ ...original, title: 'Stale headline' }))); });
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2));
    expect(fetcher.mock.calls[1][0]).toContain('lang=es');
    expect(await screen.findByText(original.title)).toBeTruthy();
    expect(screen.queryByText('Stale headline')).toBeNull();
  });
});
