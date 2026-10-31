import { act, render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LANGUAGES } from '@/i18n/config';
import { dictionaries } from '@/i18n';
import { NAV_LABEL_KEY } from '@/i18n/pageTitles';
import { makeTranslator } from '@/i18n/runtime';
import { useAppStore } from '@/stores/appStore';

const route = vi.hoisted(() => ({ path: '/' }));
vi.mock('next/navigation', () => ({ usePathname: () => route.path }));
import { DocumentTitle } from '@/components/providers/DocumentTitle';

beforeEach(() => {
  route.path = '/';
  useAppStore.getState().setLanguage('en');
});

describe('browser tab title', () => {
  it('updates for every page and language without translating the site name', () => {
    const { rerender } = render(<DocumentTitle />);
    for (const language of LANGUAGES) {
      act(() => useAppStore.getState().setLanguage(language.code));
      const t = makeTranslator(dictionaries[language.code], language.code);
      for (const [path, key] of Object.entries(NAV_LABEL_KEY)) {
        route.path = path;
        rerender(<DocumentTitle />);
        expect(document.title).toBe(`${t(key)} · Dorchester 101`);
      }
    }
  });

  it('restores the chosen language when server metadata arrives after hydration', async () => {
    useAppStore.getState().setLanguage('es');
    route.path = '/about';
    const { unmount } = render(<DocumentTitle />);

    document.title = 'About DOR101 · Dorchester 101';
    await waitFor(() => expect(document.title).toBe(`${dictionaries.es['about.title']} · Dorchester 101`));

    unmount();
    document.title = 'Another page';
    await Promise.resolve();
    expect(document.title).toBe('Another page');
  });

  it('localizes an unknown route and tolerates a trailing slash', () => {
    useAppStore.getState().setLanguage('es');
    route.path = '/missing';
    const { rerender } = render(<DocumentTitle />);
    expect(document.title).toBe(`${dictionaries.es['error.notFoundTitle']} · Dorchester 101`);
    route.path = '/privacy/';
    rerender(<DocumentTitle />);
    expect(document.title).toBe(`${dictionaries.es['privacy.title']} · Dorchester 101`);
  });
});
