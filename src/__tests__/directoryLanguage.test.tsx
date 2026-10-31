import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAppStore } from '@/stores/appStore';
import { RESOURCES } from '@/data/resources';
import { WINTER_CLOTHING } from '@/data/winterClothing';
import { SPOKEN_LANGUAGE_KEYS, spokenLanguage } from '@/i18n/spokenLanguages';
import { dictionaries } from '@/i18n';
import { makeTranslator } from '@/i18n/runtime';
import { resourceDetails } from '@/i18n/resourceDetails';
import { formatClockMinutesForLocale, formatWindowForLocale } from '@/lib/hours';

vi.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams() }));
vi.mock('@/components/layout/MainLayout', () => ({
  MainLayout: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));
vi.mock('@/components/layout/ProjectNote', () => ({ ProjectNote: () => null }));
vi.mock('@/components/a11y/ReportProblem', () => ({ ReportProblem: () => null }));
vi.mock('@/components/a11y/ListenButton', () => ({ ListenButton: () => null }));
vi.mock('@/components/resources/QRPoster', () => ({ QRPoster: () => null }));
vi.mock('@/components/pwa/FieldNotes', () => ({ FieldNotes: () => null }));

import { ResourcesView } from '@/app/resources/ResourcesView';
import FoodPageView from '@/app/food/FoodPageView';

beforeEach(() => useAppStore.getState().setLanguage('en'));

describe('directory localization', () => {
  it('maps every language named in current resource and clothing records', () => {
    const names = [...RESOURCES, ...WINTER_CLOTHING].flatMap((record) => record.languages ?? []);
    expect(names.length).toBeGreaterThan(0);
    for (const name of names) expect(SPOKEN_LANGUAGE_KEYS[name], `missing language: ${name}`).toBeTruthy();
    const t = makeTranslator(dictionaries.es, 'es');
    expect(spokenLanguage('English', t)).toBe('Inglés');
    expect(spokenLanguage('Haitian Creole', t)).toBe('Criollo haitiano');
    expect(spokenLanguage('Mandarin', t)).toBe('Mandarín');
  });

  it('searches localized and original summaries and switches to Arabic', () => {
    useAppStore.getState().setLanguage('es');
    render(<ResourcesView />);
    const spanish = makeTranslator(dictionaries.es, 'es');
    const input = screen.getByPlaceholderText(spanish('resources.search'));
    fireEvent.change(input, { target: { value: 'vivienda pública' } });
    expect(screen.getByRole('heading', { name: 'Boston Housing Authority' })).toBeTruthy();
    expect(screen.getByText(RESOURCES[0].summary.es!).getAttribute('lang')).toBe('es');
    const bhaCard = screen.getByRole('heading', { name: RESOURCES[0].name }).closest('article');
    expect(within(bhaCard!).queryByText(spanish('lang.detailsEnglish'))).toBeNull();
    expect(within(bhaCard!).getByText(resourceDetails(RESOURCES[0], 'es').eligibility.value!).getAttribute('lang')).toBe('es');
    fireEvent.change(input, { target: { value: 'public housing' } });
    expect(screen.getByRole('heading', { name: 'Boston Housing Authority' })).toBeTruthy();

    fireEvent.change(input, { target: { value: '' } });
    act(() => useAppStore.getState().setLanguage('ar'));
    const arabic = makeTranslator(dictionaries.ar, 'ar');
    expect(screen.queryByText(arabic('lang.untranslated', { language: 'العربية' }))).toBeNull();
    expect(screen.getByText(RESOURCES[0].summary.ar!).getAttribute('lang')).toBe('ar');
  });

  it('labels an English fallback if a future record has no translation', () => {
    const summary = RESOURCES[0].summary;
    const original = summary.ar;
    try {
      delete summary.ar;
      useAppStore.getState().setLanguage('ar');
      render(<ResourcesView />);
      const card = screen.getByRole('heading', { name: RESOURCES[0].name }).closest('article')!;
      const arabic = makeTranslator(dictionaries.ar, 'ar');
      expect(within(card).getByText(arabic('lang.untranslated', { language: 'العربية' }))).toBeTruthy();
      expect(within(card).getByText(summary.en).getAttribute('lang')).toBe('en');
    } finally {
      summary.ar = original;
    }
  });

  it.each([['resource directory', ResourcesView], ['food page', FoodPageView]])(
    'does not claim ID is unnecessary when it is unknown in the %s', (_name, View) => {
      render(<View />);
      const noClaim = RESOURCES.find((record) => record.id === 'gbfb-dorchester')!;
      const uncertain = RESOURCES.find((record) => record.id === 'codman-square-community-market')!;
      expect(noClaim.requiresId).toBeUndefined();
      expect(uncertain.requiresId).toBeUndefined();
      const unknownCard = screen.getByRole('heading', { name: noClaim.name }).closest('article');
      const uncertainCard = screen.getByRole('heading', { name: uncertain.name }).closest('article');
      expect(within(unknownCard!).queryByText(dictionaries.en['clothing.noId'])).toBeNull();
      expect(within(unknownCard!).queryByText(dictionaries.en['food.idRequired'])).toBeNull();
      expect(within(uncertainCard!).queryByText(dictionaries.en['clothing.noId'])).toBeNull();
      expect(within(uncertainCard!).queryByText(dictionaries.en['food.idRequired'])).toBeNull();
    },
  );

  it('formats posted wall-clock hours in the selected locale without changing the hours', () => {
    const at930 = new Date(2000, 0, 1, 9, 30);
    const at1700 = new Date(2000, 0, 1, 17, 0);
    for (const locale of ['en-US', 'es-MX', 'pt-BR', 'ar', 'zh-Hans-CN']) {
      const formatter = new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' });
      expect(formatClockMinutesForLocale(570, locale)).toBe(formatter.format(at930));
      expect(formatWindowForLocale({ startsAt: 570, endsAt: 1020 }, locale)).toBe(`${formatter.format(at930)}–${formatter.format(at1700)}`);
    }
  });
});
