import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SearchDialog } from '@/components/search/SearchDialog';
import { APP_EVENTS } from '@/hooks/useKeyboardShortcuts';
import { dictionaries } from '@/i18n';
import { search } from '@/lib/searchIndex';
import { useAppStore } from '@/stores/appStore';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));

afterEach(() => {
  vi.unstubAllGlobals();
  act(() => useAppStore.getState().setLanguage('en'));
});

describe('search result language metadata', () => {
  it('renders translated subtitles with their language and labels an English fallback', async () => {
    useAppStore.getState().setLanguage('pt');
    const translated = search('Mass 2-1-1', { language: 'pt', kinds: ['organization'], limit: 50 }).find((hit) => hit.id === 'clothing-mass-211')!;
    const fallback = {
      id: 'example-fallback', kind: 'organization', title: 'Example', subtitle: 'Untranslated description',
      href: '/resources', titleLanguage: 'en', subtitleLanguage: 'en', subtitleFellBack: true,
    };
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => ({ query: 'mass', total: 2, pages: [], organizations: [translated, fallback], stops: [], routes: [] }),
    })));
    render(<SearchDialog />);
    act(() => window.dispatchEvent(new Event(APP_EVENTS.SEARCH_EVENT)));
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'mass' } });
    const translatedOption = await screen.findByRole('option', { name: /Mass 2-1-1/ });
    expect(within(translatedOption).getByText(/Por telefone, em todo o estado/).getAttribute('lang')).toBe('pt');
    const fallbackOption = screen.getByRole('option', { name: /Example/ });
    expect(within(fallbackOption).getByText('Untranslated description').getAttribute('lang')).toBe('en');
    expect(within(fallbackOption).getByText(dictionaries.pt['lang.detailsEnglish'])).toBeTruthy();
  });
});
