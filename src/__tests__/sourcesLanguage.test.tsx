import { act, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAppStore, type Language } from '@/stores/appStore';
import { dictionaries } from '@/i18n';
import { LANGUAGES } from '@/i18n/config';
import { formatDate } from '@/i18n/formatters';
import { makeTranslator } from '@/i18n/runtime';

vi.mock('@/components/layout/MainLayout', () => ({
  MainLayout: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));
vi.mock('@/components/pwa/DownloadAppCard', () => ({ DownloadAppCard: () => null }));
vi.mock('@/components/a11y/ReportProblem', () => ({ ReportProblem: () => null }));

import { AboutView } from '@/app/about/AboutView';
import { Cite } from '@/components/sources/SourceMark';
import { SourcePreview } from '@/components/sources/SourcePreview';

beforeEach(() => {
  useAppStore.getState().setLanguage('en');
  vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})));
});

afterEach(() => vi.unstubAllGlobals());

describe('source and about language coverage', () => {
  it('switches the mission and source cadence in all languages', () => {
    render(<AboutView credits={[]} />);
    for (const language of LANGUAGES) {
      const code = language.code as Language;
      act(() => useAppStore.getState().setLanguage(code));
      const t = makeTranslator(dictionaries[code], code);
      expect(screen.getByRole('heading', { name: t('about.mission.title') })).toBeTruthy();
      expect(screen.getByText(t('about.mission.runBody'))).toBeTruthy();
      const heading = screen.getByRole('heading', { name: t('about.publisherTitle') });
      const section = heading.closest('section');
      expect(section).toBeTruthy();
      expect(within(section!).getByText(new RegExp(t('sources.cadence.nws').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))).toBeTruthy();
      expect(within(section!).getByText(new RegExp(t('sources.licence.mbta').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))).toBeTruthy();
    }
  });

  it('localizes licence text and date-only source dates without shifting the day', () => {
    useAppStore.getState().setLanguage('es');
    render(<><Cite id="nws" /><SourcePreview title="Metrolist" url="https://boston.gov" sourceId="bostongov" lastChecked="2026-10-04" /></>);
    const t = makeTranslator(dictionaries.es, 'es');
    expect(screen.getByText(new RegExp(t('sources.licence.federal').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))).toBeTruthy();
    expect(screen.getByText(new RegExp(t('source.lastRead', { date: formatDate('2026-10-04T12:00:00', 'es', 'medium') })))).toBeTruthy();
  });
});
