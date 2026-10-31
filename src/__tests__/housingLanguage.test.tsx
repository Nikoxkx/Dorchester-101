import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Language } from '@/stores/appStore';
import { useAppStore } from '@/stores/appStore';
import { dictionaries } from '@/i18n';
import { LANGUAGES } from '@/i18n/config';
import { makeTranslator } from '@/i18n/runtime';

vi.mock('@/components/layout/MainLayout', () => ({
  MainLayout: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));

const limits = vi.hoisted(() => ({
  current: {
    data: {
      fiscalYear: 2026,
      area: 'Boston',
      effectiveDate: '2026-05-01',
      table: { '1': 100000, '2': 120000, '3': 140000, '4': 160000 },
    } as null | { fiscalYear: number; area: string; effectiveDate: string; table: Record<string, number> },
    loading: false,
    error: null as string | null,
  },
}));
vi.mock('@/hooks/useIncomeLimits', () => ({ useIncomeLimits: () => limits.current }));

import AffordableHousingPage from '@/app/affordable-housing/page';

beforeEach(() => {
  useAppStore.getState().setLanguage('en');
  limits.current = {
    data: { fiscalYear: 2026, area: 'Boston', effectiveDate: '2026-05-01', table: { '1': 100000, '2': 120000, '3': 140000, '4': 160000 } },
    loading: false,
    error: null,
  };
});

describe('housing page language coverage', () => {
  it('updates housing source descriptions, tooltips and calendar details as the language changes', () => {
    render(<AffordableHousingPage />);
    act(() => useAppStore.getState().setLanguage('es'));

    const heading = screen.getByRole('heading', { name: 'Dónde encontrar anuncios vigentes' });
    expect(heading).toBeTruthy();
    expect(screen.getByText(dictionaries.es['housing.cover.metrolist'])).toBeTruthy();
    expect(screen.queryByText(/Where the live listings are/i)).toBeNull();
    expect(screen.queryByText(/Every City of Boston income-restricted lottery/i)).toBeNull();
    expect(screen.getByText(dictionaries.es['housing.statusBody'])).toBeTruthy();

    const card = screen.getByText('Metrolist').closest('li');
    expect(card).toBeTruthy();
    const google = within(card!).getByRole('link', { name: /Google Calendar/ });
    const calendar = new URL(google.getAttribute('href')!);
    expect(calendar.searchParams.get('text')).toBe('Consultar nuevos anuncios de vivienda en Boston en Metrolist');
    expect(calendar.searchParams.get('details')).toContain('No incluye vivienda pública ni subsidiada');
    expect(calendar.searchParams.get('details')).not.toContain('Every City of Boston');
    const cityBadge = screen.getAllByTitle(/Ciudad de Boston|City of Boston/).find((node) => node.getAttribute('title')?.includes('Programas de la Oficina de Vivienda'));
    expect(cityBadge).toBeTruthy();
  });

  it('does not present the referral line as the direct number for listing websites or calendar reminders', () => {
    render(<AffordableHousingPage />);
    for (const name of ['Housing Navigator Massachusetts', 'MyMassHome']) {
      const card = screen.getByText(name).closest('li')!;
      expect(card.querySelector('a[href^="tel:"]')).toBeNull();
      const google = within(card).getByRole('link', { name: /Google Calendar/ });
      const calendar = new URL(google.getAttribute('href')!);
      expect(calendar.searchParams.get('details')).not.toContain('2-1-1');
      expect(calendar.searchParams.get('location')).toBeNull();
    }
  });

  it('labels translated housing guidance as a draft and identifies the nonprofit correctly', () => {
    useAppStore.getState().setLanguage('es');
    render(<AffordableHousingPage />);
    expect(screen.getByRole('note').textContent).toBe(dictionaries.es['clothing.translationDraft']);
    fireEvent.click(screen.getByRole('button', { name: dictionaries.es['housing.tabLearn'] }));
    const navigator = screen.getByText(dictionaries.es['primer.navigatorCard']).closest('a')!;
    expect(navigator.textContent).toContain('Housing Navigator Massachusetts');
    expect(navigator.textContent).not.toContain('Mass.gov');
    expect(screen.queryByText(dictionaries.es['housing.steps.5.body'])).toBeNull();
  });

  it('renders the core listing content in all eight non-English languages', () => {
    render(<AffordableHousingPage />);
    for (const language of LANGUAGES.filter(({ code }) => code !== 'en')) {
      act(() => useAppStore.getState().setLanguage(language.code as Language));
      const t = makeTranslator(dictionaries[language.code], language.code);
      expect(screen.getByRole('heading', { name: t('housing.sourcesHeading') })).toBeTruthy();
      expect(screen.getByRole('link', { name: t('primer.findBand') }).getAttribute('href')).toBe('/tools#ami');
      expect(screen.getByText(t('housing.cover.metrolist'))).toBeTruthy();
      expect(screen.getByText(t('housing.cover.bha'))).toBeTruthy();
      expect(screen.queryByText(dictionaries.en['housing.cover.metrolist'])).toBeNull();
    }
  });

  it('localizes the learn and calculator tabs, including plural people and calculated results', () => {
    useAppStore.getState().setLanguage('es');
    render(<AffordableHousingPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Cómo funciona' }));
    expect(screen.getByRole('heading', { name: '¿Qué es la vivienda con límite de ingresos?' })).toBeTruthy();
    expect(screen.getByText('3 personas')).toBeTruthy();
    expect(screen.getByText('Pregunte qué documentos necesita')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /calculadora de AMI/i }));
    const select = screen.getByLabelText(/personas en su hogar/i) as HTMLSelectElement;
    expect(within(select).getByRole('option', { name: '1 persona' })).toBeTruthy();
    expect(within(select).getByRole('option', { name: '2 personas' })).toBeTruthy();
    expect(screen.getByText(/Qué significa:/).textContent).toContain(makeTranslator(dictionaries.es, 'es')('badge.ami', { percent: 50 }));
  });

  it('suppresses the result for a missing household limit or invalid annual income', () => {
    limits.current.data!.table = { '1': 100000, '3': 140000 };
    render(<AffordableHousingPage />);
    fireEvent.click(screen.getByRole('button', { name: dictionaries.en['tools.tabAmi'] }));
    expect(screen.getByRole('status').textContent).toBe(dictionaries.en['tools.limitsUnavailable']);
    fireEvent.change(screen.getByLabelText(dictionaries.en['tools.householdSize']), { target: { value: '1' } });
    const income = screen.getByLabelText(dictionaries.en['tools.annualIncome']);
    fireEvent.change(income, { target: { value: '-10' } });
    expect(screen.getByRole('status').textContent).toBe(dictionaries.en['tools.enterValidAnnual']);
    expect(screen.queryByText(dictionaries.en['tools.qualifyFor'])).toBeNull();
    fireEvent.change(income, { target: { value: '' } });
    expect(screen.getByRole('status').textContent).toBe(dictionaries.en['tools.enterValidAnnual']);
    fireEvent.change(income, { target: { value: '0' } });
    expect(screen.getByText('0%')).toBeTruthy();
  });

  it('does not invent a 0% AMI result when the HUD data is unavailable', () => {
    limits.current = { data: null, loading: false, error: 'offline' };
    useAppStore.getState().setLanguage('es');
    render(<AffordableHousingPage />);
    fireEvent.click(screen.getByRole('button', { name: /calculadora de AMI/i }));
    expect(screen.getByRole('status').textContent).toBe(dictionaries.es['tools.limitsUnavailable']);
    expect(screen.queryByText('0%')).toBeNull();
  });
});
