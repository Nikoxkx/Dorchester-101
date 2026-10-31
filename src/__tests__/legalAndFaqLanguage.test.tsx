import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAppStore, type Language } from '@/stores/appStore';
import { dictionaries } from '@/i18n';
import { LANGUAGES } from '@/i18n/config';
import { formatDate, formatNumber } from '@/i18n/formatters';
import { makeTranslator } from '@/i18n/runtime';

vi.mock('@/components/layout/MainLayout', () => ({
  MainLayout: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));
vi.mock('@/components/ui/ProjectNote', () => ({
  ProjectNote: ({ children }: { children: React.ReactNode }) => <aside>{children}</aside>,
}));

import PrivacyPage from '@/app/privacy/page';
import TermsPage from '@/app/terms/page';
import FAQPage from '@/app/faq/page';

beforeEach(() => useAppStore.getState().setLanguage('en'));

describe('legal pages and FAQ language changes', () => {
  it('updates the draft privacy notice and review warning in every language', () => {
    render(<PrivacyPage />);
    for (const language of LANGUAGES) {
      const code = language.code as Language;
      act(() => useAppStore.getState().setLanguage(code));
      const t = makeTranslator(dictionaries[code], code);
      expect(screen.getByRole('heading', { name: t('privacy.title') })).toBeTruthy();
      expect(screen.getByRole('heading', { name: t('privacy.reviewTitle') })).toBeTruthy();
      expect(screen.getByText(t('privacy.reviewBody'))).toBeTruthy();
      expect(screen.getByText(t('legal.lastUpdated', { date: formatDate(new Date(2026, 9, 31), code, 'long') }))).toBeTruthy();
      const heading = screen.getByRole('heading', { name: `${formatNumber(2, code)}. ${t('privacy.storage.title')}` });
      const section = heading.closest('section');
      expect(section).toBeTruthy();
      expect(within(section!).getByText(t('privacy.localDraft'))).toBeTruthy();
      expect(within(section!).getByText(t('privacy.clearDraft'))).toBeTruthy();
      expect(screen.getByText(t('privacy.draftScope'))).toBeTruthy();
      expect(screen.getByText(t('consent.body'))).toBeTruthy();
      expect(screen.getByText(t('privacy.externalDraft'))).toBeTruthy();
      expect(screen.getByText(t('privacy.weatherFallback'))).toBeTruthy();
      expect(t('privacy.weatherFallback')).toContain('Open-Meteo');
      expect(screen.getByText(t('privacy.newsTranslation'))).toBeTruthy();
    }
  });

  it('does not make the contradicted no-analytics or no-location claims', () => {
    render(<PrivacyPage />);
    expect(screen.queryByText(/I collect absolutely no personal data/)).toBeNull();
    expect(screen.queryByText(/I do NOT use analytics services/)).toBeNull();
    expect(screen.queryByText(/I do NOT collect location data/)).toBeNull();
    expect(screen.getByText(dictionaries.en['consent.body']).textContent).toContain('Vercel Analytics');
    expect(screen.getByText(dictionaries.en['privacy.reviewBody']).textContent).toContain('not a legally reviewed policy');
    expect(dictionaries.en['settings.privacyTitle']).toBe('Privacy and data');
    expect(dictionaries.en['permissions.location.desc']).toContain('external map provider');
  });

  it('updates terms headings, numbered sections, and the accuracy list in every language', () => {
    render(<TermsPage />);
    for (const language of LANGUAGES) {
      const code = language.code as Language;
      act(() => useAppStore.getState().setLanguage(code));
      const t = makeTranslator(dictionaries[code], code);
      expect(screen.getByRole('heading', { name: t('legal.termsTitle') })).toBeTruthy();
      expect(screen.getByRole('heading', { name: t('terms.reviewTitle') })).toBeTruthy();
      expect(screen.getByText(t('terms.reviewBody'))).toBeTruthy();
      expect(screen.getByText(t('terms.accept.body'))).toBeTruthy();
      const heading = screen.getByRole('heading', { name: `${formatNumber(4, code)}. ${t('terms.accuracy.title')}` });
      const section = heading.closest('section');
      expect(section).toBeTruthy();
      expect(within(section!).getAllByRole('listitem').map((item) => item.textContent))
        .toEqual(t('terms.accuracy.items').split('\n'));
    }
  });

  it('translates FAQ questions and available Spanish answers and searches them', () => {
    render(<FAQPage />);
    act(() => useAppStore.getState().setLanguage('es'));
    const t = makeTranslator(dictionaries.es, 'es');
    expect(screen.getByRole('heading', { name: t('faq.title') })).toBeTruthy();
    expect(screen.getByRole('heading', { name: t('faq.q.rights') })).toBeTruthy();
    expect(screen.queryByText(dictionaries.en['faq.q.rights'])).toBeNull();

    fireEvent.change(screen.getByLabelText(t('faq.search')), { target: { value: 'inquilino' } });
    const question = screen.getByRole('button', { name: new RegExp(t('faq.q.rights').replace(/[?¿]/g, '')) });
    fireEvent.click(question);
    expect(screen.queryByText(t('lang.untranslated', { language: 'Español' }))).toBeNull();
    const answer = screen.getByText(/Los derechos de los inquilinos de Massachusetts/);
    expect(answer.getAttribute('lang')).toBe('es');
    expect(answer.textContent).toContain('Depósitos de garantía');
  });

  it('provides all twelve Spanish FAQ answers with Spanish language metadata', () => {
    useAppStore.getState().setLanguage('es');
    render(<FAQPage />);
    const t = makeTranslator(dictionaries.es, 'es');
    const keys = [
      'applyHousing', 'section8', 'rights', 'eviction', 'ami', 'food',
      'snap', 'wic', 'masshealth', 'training', 'unemployment', 'utilities',
    ] as const;
    for (const key of keys) {
      const button = screen.getByRole('button', { name: t(`faq.q.${key}`) });
      fireEvent.click(button);
      expect(button.getAttribute('aria-expanded')).toBe('true');
      const card = button.parentElement;
      expect(card?.querySelector('[lang="es"]')?.textContent?.length).toBeGreaterThan(100);
      expect(within(card!).queryByText(t('lang.untranslated', { language: 'Español' }))).toBeNull();
      fireEvent.click(button);
    }
  });

  it.each(LANGUAGES.filter(({ code }) => code !== 'en'))(
    'provides the housing, eviction, rights and AMI FAQ answers in $nativeName', (language) => {
      const code = language.code as Language;
      useAppStore.getState().setLanguage(code);
      render(<FAQPage />);
      const t = makeTranslator(dictionaries[code], code);
      for (const key of ['applyHousing', 'section8', 'eviction', 'rights', 'ami'] as const) {
        const button = screen.getByRole('button', { name: t(`faq.q.${key}`) });
        fireEvent.click(button);
        const card = button.parentElement;
        const answer = card?.querySelector(`[lang="${code}"]`);
        expect(answer?.textContent?.length, `${code}: ${key}`).toBeGreaterThan(100);
        expect(answer?.getAttribute('dir')).toBe(code === 'ar' ? 'rtl' : 'ltr');
        if (key === 'eviction') {
          expect(answer?.textContent).toContain('(617) 603-1807');
          expect(answer?.textContent).toContain('$7,000');
        }
        expect(within(card!).queryByText(t('lang.untranslated', { language: language.nativeName }))).toBeNull();
        fireEvent.click(button);
      }
    },
  );

  it.each(LANGUAGES.filter(({ code }) => code !== 'en'))(
    'provides the food, SNAP, WIC and MassHealth FAQ answers in $nativeName', (language) => {
      const code = language.code as Language;
      useAppStore.getState().setLanguage(code);
      render(<FAQPage />);
      const t = makeTranslator(dictionaries[code], code);
      const button = screen.getByRole('button', { name: t('faq.q.food') });
      fireEvent.click(button);
      const card = button.parentElement!;
      const answer = card.querySelector(`[lang="${code}"]`);
      expect(answer?.getAttribute('dir')).toBe(code === 'ar' ? 'rtl' : 'ltr');
      expect(answer?.textContent).toContain('1-800-645-8333');
      expect(answer?.textContent).toContain('617) 318-6940');
      expect(within(card).queryByText(t('lang.untranslated', { language: language.nativeName }))).toBeNull();
      fireEvent.click(button);
      const snapButton = screen.getByRole('button', { name: t('faq.q.snap') });
      fireEvent.click(snapButton);
      const snapCard = snapButton.parentElement!;
      const snapAnswer = snapCard.querySelector(`[lang="${code}"]`);
      expect(snapAnswer?.getAttribute('dir')).toBe(code === 'ar' ? 'rtl' : 'ltr');
      expect(snapAnswer?.textContent).toContain('(877) 382-2363');
      expect(snapAnswer?.textContent).toContain('$1,023');
      expect(within(snapCard).queryByText(t('lang.untranslated', { language: language.nativeName }))).toBeNull();
      fireEvent.click(snapButton);
      const wicButton = screen.getByRole('button', { name: t('faq.q.wic') });
      fireEvent.click(wicButton);
      const wicCard = wicButton.parentElement!;
      const wicAnswer = wicCard.querySelector(`[lang="${code}"]`);
      expect(wicAnswer?.getAttribute('dir')).toBe(code === 'ar' ? 'rtl' : 'ltr');
      expect(wicAnswer?.textContent).toContain('(617) 825-3822');
      expect(wicAnswer?.textContent).toContain('$61,050');
      expect(within(wicCard).queryByText(t('lang.untranslated', { language: language.nativeName }))).toBeNull();
      fireEvent.click(wicButton);
      const healthButton = screen.getByRole('button', { name: t('faq.q.masshealth') });
      fireEvent.click(healthButton);
      const healthCard = healthButton.parentElement!;
      const healthAnswer = healthCard.querySelector(`[lang="${code}"]`);
      expect(healthAnswer?.getAttribute('dir')).toBe(code === 'ar' ? 'rtl' : 'ltr');
      expect(healthAnswer?.textContent).toContain('(800) 841-2900');
      expect(healthAnswer?.textContent).toContain('(800) 272-4232');
      expect(within(healthCard).queryByText(t('lang.untranslated', { language: language.nativeName }))).toBeNull();
    },
  );

  it.each(LANGUAGES.filter(({ code }) => code !== 'en'))(
    'provides the employment and utilities FAQ answers in $nativeName', (language) => {
      const code = language.code as Language;
      useAppStore.getState().setLanguage(code);
      render(<FAQPage />);
      const t = makeTranslator(dictionaries[code], code);
      for (const [key, contact] of [
        ['training', '(617) 442-2791'],
        ['unemployment', '(877) 626-6800'],
        ['utilities', '(617) 357-6012'],
      ] as const) {
        const button = screen.getByRole('button', { name: t(`faq.q.${key}`) });
        fireEvent.click(button);
        const card = button.parentElement!;
        const answer = card.querySelector(`[lang="${code}"]`);
        expect(answer?.getAttribute('dir')).toBe(code === 'ar' ? 'rtl' : 'ltr');
        expect(answer?.textContent).toContain(contact);
        expect(within(card).queryByText(t('lang.untranslated', { language: language.nativeName }))).toBeNull();
        fireEvent.click(button);
      }
    },
  );

  it('searches translated FAQ answers and retains English-term matching', () => {
    useAppStore.getState().setLanguage('pt');
    render(<FAQPage />);
    const t = makeTranslator(dictionaries.pt, 'pt');
    const search = screen.getByRole('textbox', { name: t('faq.search') });
    fireEvent.change(search, { target: { value: 'perdão de dívidas' } });
    const utility = screen.getByRole('button', { name: new RegExp(t('faq.q.utilities').replace(/[?¿]/g, '')) });
    fireEvent.click(utility);
    expect(utility.parentElement?.querySelector('[lang="pt"]')?.textContent).toContain('perdão de dívidas');
    fireEvent.change(search, { target: { value: 'shutoff protections' } });
    expect(screen.getByRole('button', { name: new RegExp(t('faq.q.utilities').replace(/[?¿]/g, '')) })).toBeTruthy();
  });
});
