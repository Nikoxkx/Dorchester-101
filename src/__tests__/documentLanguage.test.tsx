import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAppStore } from '@/stores/appStore';

vi.mock('@/components/providers/DocumentTitle', () => ({ DocumentTitle: () => null }));
vi.mock('@/components/a11y', () => ({ SkipLink: () => null, ShortcutHelp: () => null }));
vi.mock('@/hooks/useKeyboardShortcuts', () => ({ useKeyboardShortcuts: () => {} }));
import { DorchesterProviders } from '@/components/providers/DorchesterProviders';

beforeEach(() => { useAppStore.getState().resetAll(); useAppStore.getState().markHydrated(); });
afterEach(() => { document.documentElement.lang = 'en'; document.documentElement.dir = 'ltr'; });

describe('document content language', () => {
  it('updates HTML language and direction independently of formatting fallbacks', () => {
    render(<DorchesterProviders><main>test</main></DorchesterProviders>);
    act(() => useAppStore.getState().setLanguage('ht'));
    expect(document.documentElement.lang).toBe('ht');
    expect(document.documentElement.dir).toBe('ltr');
    act(() => useAppStore.getState().setLanguage('kea'));
    expect(document.documentElement.lang).toBe('kea');
    act(() => useAppStore.getState().setLanguage('ar'));
    expect(document.documentElement.lang).toBe('ar');
    expect(document.documentElement.dir).toBe('rtl');
  });
});
