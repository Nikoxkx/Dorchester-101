import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { dictionaries } from '@/i18n';
import { LANGUAGES } from '@/i18n/config';
import { makeTranslator } from '@/i18n/runtime';
import { useAppStore } from '@/stores/appStore';
import { usePrivacyStore } from '@/stores/privacyStore';

vi.mock('@/components/providers/LiveRegion', () => ({ useAnnounce: () => vi.fn() }));
import { ReportProblem } from '@/components/a11y/ReportProblem';
import { ConsentNotice } from '@/components/a11y/ConsentNotice';

beforeEach(() => {
  useAppStore.getState().setLanguage('en');
  useAppStore.getState().markHydrated();
  useAppStore.getState().setConsentSeen(false);
  usePrivacyStore.getState().choose('unset');
  usePrivacyStore.getState().markHydrated();
  localStorage.removeItem('dor101:report-draft');
});

describe('translated notices and feedback', () => {
  it('updates every visible field of a correction preview after switching language', () => {
    render(<ReportProblem />);
    fireEvent.click(screen.getByRole('button', { name: dictionaries.en['error.reportProblem'] }));
    act(() => useAppStore.getState().setLanguage('es'));
    const t = makeTranslator(dictionaries.es, 'es');
    fireEvent.change(screen.getByLabelText(t('feedback.fieldPlace')), { target: { value: 'Codman Square' } });
    fireEvent.change(screen.getByLabelText(t('feedback.fieldDetail')), { target: { value: 'Horario incorrecto' } });
    const preview = document.querySelector('[data-report-preview]');
    expect(preview?.textContent).toContain(t('feedback.previewPage', { page: window.location.pathname }));
    expect(preview?.textContent).toContain(t('feedback.previewPlace', { place: 'Codman Square' }));
    expect(preview?.textContent).toContain('Preparado desde DOR101');
    expect(preview?.textContent).toContain('Horario incorrecto');
    expect(preview?.textContent).not.toContain('Sent from');
    expect(screen.getByPlaceholderText(t('feedback.placePlaceholder'))).toBeTruthy();
  });

  it('presents the updated privacy notice in every language', () => {
    render(<ConsentNotice />);
    for (const language of LANGUAGES) {
      act(() => useAppStore.getState().setLanguage(language.code));
      const t = makeTranslator(dictionaries[language.code], language.code);
      expect(screen.getByText(t('consent.body'))).toBeTruthy();
      expect(screen.getByText(t('consent.body')).textContent).toContain('Vercel Analytics');
    }
  });
});
