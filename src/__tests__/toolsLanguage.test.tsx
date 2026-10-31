import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { dictionaries } from '@/i18n';
import { LANGUAGES } from '@/i18n/config';
import { formatPercent, formatYear } from '@/i18n/formatters';
import { makeTranslator } from '@/i18n/runtime';
import { useAppStore } from '@/stores/appStore';

vi.mock('@/components/layout/MainLayout', () => ({
  MainLayout: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));
const limits = vi.hoisted(() => ({
  current: {
    data: null as null | { table: Record<string, number>; fiscalYear: number; effectiveDate: string; snapshot?: boolean },
    loading: false,
    error: null as string | null,
  },
}));
vi.mock('@/hooks/useIncomeLimits', () => ({ useIncomeLimits: () => limits.current }));
import ToolsPage from '@/app/tools/page';

beforeEach(() => {
  useAppStore.getState().setLanguage('en');
  window.history.replaceState({}, '', '/tools');
  limits.current = { data: { table: { '1': 100000, '2': 120000, '3': 140000 }, fiscalYear: 2026, effectiveDate: '2026-05-01', snapshot: true }, loading: false, error: null };
});
afterEach(() => {
  act(() => useAppStore.getState().setLanguage('en'));
  window.history.replaceState({}, '', '/');
});

describe('financial tool language and income-limit safety', () => {
  it('localizes the rent status, accessible inputs and the percentage in every language', () => {
    render(<ToolsPage />);
    for (const { code } of LANGUAGES) {
      act(() => useAppStore.getState().setLanguage(code));
      const t = makeTranslator(dictionaries[code], code);
      expect(screen.getByLabelText(t('tools.monthlyGross'))).toBeTruthy();
      expect(screen.getByLabelText(t('tool.moveIn.rent'))).toBeTruthy();
      expect(screen.getByText(t('tools.status.burdened'))).toBeTruthy();
      expect(Array.from(document.querySelectorAll('div')).some((node) => node.textContent === formatPercent(0.44, code))).toBe(true);
    }
  });

  it('provides ordinary housing links from both calculators', () => {
    render(<ToolsPage />);
    expect(screen.getByRole('link', { name: dictionaries.en['tools.explore'] }).getAttribute('href')).toBe('/affordable-housing');
    fireEvent.click(screen.getByRole('button', { name: dictionaries.en['tools.tabAmi'] }));
    expect(screen.getByRole('link', { name: dictionaries.en['tools.findHousing'] }).getAttribute('href')).toBe('/affordable-housing');
  });

  it('does not show an infinite rent burden when income is zero', () => {
    render(<ToolsPage />);
    fireEvent.change(screen.getByLabelText(dictionaries.en['tools.monthlyGross']), { target: { value: '0' } });
    expect(screen.getByRole('status').textContent).toBe(dictionaries.en['tools.enterValidRent']);
    expect(screen.queryByText(/Infinity/)).toBeNull();
  });

  it('labels the estimate, capture and household selector in every language', () => {
    render(<ToolsPage />);
    fireEvent.click(screen.getByRole('button', { name: dictionaries.en['tools.tabAmi'] }));
    for (const { code } of LANGUAGES) {
      act(() => useAppStore.getState().setLanguage(code));
      const t = makeTranslator(dictionaries[code], code);
      const select = screen.getByLabelText(t('tools.householdSize'));
      expect(within(select).getByRole('option', { name: t('housing.people', { count: 2 }) })).toBeTruthy();
      expect(screen.getByLabelText(t('tools.annualIncome'))).toBeTruthy();
      expect(screen.getByText(t('market.amiExplanation'))).toBeTruthy();
      expect(screen.getByText(t('tools.cachedNote', { fy: formatYear(2026, code) }))).toBeTruthy();
      expect(screen.getByText(t('tools.qualifyFor'))).toBeTruthy();
      expect(screen.getByText(t('tools.canApply'))).toBeTruthy();
    }
  });

  it('does not invent a 0% band when HUD limits are unavailable or missing for the selected size', () => {
    limits.current = { data: null, loading: false, error: 'offline' };
    render(<ToolsPage />);
    fireEvent.click(screen.getByRole('button', { name: dictionaries.en['tools.tabAmi'] }));
    expect(screen.getByRole('status').textContent).toBe(dictionaries.en['tools.limitsUnavailable']);
    expect(screen.queryByText('0%')).toBeNull();
    expect(screen.queryByText(dictionaries.en['tools.qualifyFor'])).toBeNull();
  });

  it('does not calculate when the selected size is absent from an otherwise available HUD table', () => {
    limits.current.data!.table = { '1': 100000, '3': 140000 };
    render(<ToolsPage />);
    fireEvent.click(screen.getByRole('button', { name: dictionaries.en['tools.tabAmi'] }));
    expect(screen.getByRole('status').textContent).toBe(dictionaries.en['tools.limitsUnavailable']);
    expect(screen.queryByText(dictionaries.en['tools.qualifyFor'])).toBeNull();
    fireEvent.change(screen.getByLabelText(dictionaries.en['tools.householdSize']), { target: { value: '1' } });
    expect(screen.getByText(dictionaries.en['tools.qualifyFor'])).toBeTruthy();
    fireEvent.change(screen.getByLabelText(dictionaries.en['tools.householdSize']), { target: { value: '4' } });
    expect(screen.getByRole('status').textContent).toBe(dictionaries.en['tools.limitsUnavailable']);
  });

  it('rejects missing and negative income, but permits a real zero income', () => {
    render(<ToolsPage />);
    fireEvent.click(screen.getByRole('button', { name: dictionaries.en['tools.tabAmi'] }));
    const income = screen.getByLabelText(dictionaries.en['tools.annualIncome']);
    for (const value of ['', '-1']) {
      fireEvent.change(income, { target: { value } });
      expect(screen.getByRole('status').textContent).toBe(dictionaries.en['tools.enterValidAnnual']);
      expect(income.getAttribute('aria-invalid')).toBe('true');
      expect(screen.queryByText(dictionaries.en['tools.qualifyFor'])).toBeNull();
    }
    fireEvent.change(income, { target: { value: '0' } });
    expect(screen.getByText('0%')).toBeTruthy();
    expect(income.getAttribute('aria-invalid')).toBe('false');
  });

  it('does not turn an empty rent field into zero', () => {
    render(<ToolsPage />);
    const rent = screen.getByLabelText(dictionaries.en['tool.moveIn.rent']);
    fireEvent.change(rent, { target: { value: '' } });
    expect(screen.getByRole('status').textContent).toBe(dictionaries.en['tools.enterValidRent']);
    expect(rent.getAttribute('aria-invalid')).toBe('true');
    fireEvent.change(rent, { target: { value: '0' } });
    expect(screen.getByText('0%')).toBeTruthy();
  });

  it('uses a neutral above-100% label rather than deciding the housing is market rate', () => {
    render(<ToolsPage />);
    fireEvent.click(screen.getByRole('button', { name: dictionaries.en['tools.tabAmi'] }));
    fireEvent.change(screen.getByLabelText(dictionaries.en['tools.annualIncome']), { target: { value: '180000' } });
    expect(screen.getByText(dictionaries.en['housing.marketRate'])).toBeTruthy();
    expect(screen.queryByText('Market Rate')).toBeNull();
  });

  it('opens the AMI calculator from its shareable link', async () => {
    window.history.replaceState({}, '', '/tools#ami');
    render(<ToolsPage />);
    await waitFor(() => expect(screen.getByLabelText(dictionaries.en['tools.householdSize'])).toBeTruthy());
  });

  it('validates move-in estimates and presents corrected deposit and broker notes in every language', () => {
    render(<ToolsPage />);
    fireEvent.click(screen.getByRole('button', { name: dictionaries.en['tools.tabMoveIn'] }));
    const rent = screen.getByLabelText(dictionaries.en['tool.moveIn.rent']);
    const broker = screen.getByLabelText(dictionaries.en['tool.moveIn.broker']);
    fireEvent.change(broker, { target: { value: '100' } });
    for (const value of ['', '-1']) {
      fireEvent.change(rent, { target: { value } });
      expect(screen.getByRole('status').textContent).toBe(dictionaries.en['tool.moveIn.invalidInput']);
      expect(rent.getAttribute('aria-invalid')).toBe('true');
      expect(screen.queryByText(dictionaries.en['tool.moveIn.total'])).toBeNull();
    }
    fireEvent.change(rent, { target: { value: '0' } });
    expect(rent.getAttribute('aria-invalid')).toBe('false');
    for (const { code } of LANGUAGES) {
      act(() => useAppStore.getState().setLanguage(code));
      expect(screen.getByText(dictionaries[code]['tool.moveIn.rowDepositNote'])).toBeTruthy();
      expect(screen.getByText(dictionaries[code]['tool.moveIn.rowBrokerNote'])).toBeTruthy();
    }
  });

  it('uses the published two-person 2026 FPL and HUD and FY2027 HEAP figures', () => {
    render(<ToolsPage />);
    fireEvent.click(screen.getByRole('button', { name: dictionaries.en['tools.tabBenefits'] }));
    fireEvent.change(screen.getByLabelText(dictionaries.en['tool.benefits.size']), { target: { value: '2' } });
    expect(screen.getByText(/21,640/)).toBeTruthy();
    expect(screen.getByText(/70,073/)).toBeTruthy();
    expect(screen.getByText(/109,700/)).toBeTruthy();
  });

  it('keeps the benefits comparison cautious and rejects missing or invalid inputs', () => {
    render(<ToolsPage />);
    fireEvent.click(screen.getByRole('button', { name: dictionaries.en['tools.tabBenefits'] }));
    const income = screen.getByLabelText(dictionaries.en['tool.benefits.income']);
    const size = screen.getByLabelText(dictionaries.en['tool.benefits.size']);
    expect(screen.getByText(dictionaries.en['tool.benefits.intro'])).toBeTruthy();
    expect(screen.getByText(dictionaries.en['tool.benefits.note'])).toBeTruthy();
    expect(screen.queryByText(/never reported to landlords/i)).toBeNull();
    for (const value of ['', '-1']) {
      fireEvent.change(income, { target: { value } });
      expect(screen.getByRole('status').textContent).toBe(dictionaries.en['tool.benefits.invalidInput']);
      expect(income.getAttribute('aria-invalid')).toBe('true');
      expect(screen.queryByText(dictionaries.en['tool.benefits.mayQualify'])).toBeNull();
    }
    fireEvent.change(income, { target: { value: '0' } });
    expect(screen.getAllByText(dictionaries.en['tool.benefits.mayQualify']).length).toBeGreaterThan(0);
    fireEvent.change(size, { target: { value: '9' } });
    expect(screen.getByRole('status').textContent).toBe(dictionaries.en['tool.benefits.invalidInput']);
    fireEvent.change(size, { target: { value: '3' } });
    for (const { code } of LANGUAGES) {
      act(() => useAppStore.getState().setLanguage(code));
      expect(screen.getByText(dictionaries[code]['tool.benefits.note'])).toBeTruthy();
      expect(screen.getByText(dictionaries[code]['tool.benefits.intro'])).toBeTruthy();
    }
  });

  it('presents cautious eviction stages and verified legal-aid contact in each language', () => {
    render(<ToolsPage />);
    fireEvent.click(screen.getByRole('button', { name: dictionaries.en['tools.tabEviction'] }));
    for (const { code } of LANGUAGES) {
      act(() => useAppStore.getState().setLanguage(code));
      const t = makeTranslator(dictionaries[code], code);
      expect(screen.getByText(t('tool.eviction.intro'))).toBeTruthy();
      expect(screen.getByRole('link', { name: '(617) 603-1807' }).getAttribute('href')).toBe('tel:+16176031807');
      const steps = [
        ['tool.eviction.step2.title', 'tool.eviction.papers'],
        ['tool.eviction.step3.title', 'tool.eviction.answerGeneral'],
        ['tool.eviction.eventTitle', 'tool.eviction.eventGeneral'],
        ['tool.eviction.step5.title', 'tool.eviction.trialGeneral'],
        ['tool.eviction.step6.title', 'tool.eviction.judgmentGeneral'],
      ] as const;
      for (const [title, detail] of steps) {
        const button = screen.getByRole('button', { name: t(title) });
        fireEvent.click(button);
        expect(button.getAttribute('aria-expanded')).toBe('true');
        expect(screen.getByText(t(detail))).toBeTruthy();
      }
    }
    expect(screen.queryByText(/Monday after the entry date/i)).toBeNull();
    expect(screen.queryByText(/Do not move/i)).toBeNull();
  }, 15_000);

  it('gives document checkboxes accessible translated labels', () => {
    useAppStore.getState().setLanguage('es');
    render(<ToolsPage />);
    fireEvent.click(screen.getByRole('button', { name: dictionaries.es['tools.tabDocs'] }));
    expect(screen.getByRole('checkbox', { name: dictionaries.es['tools.doc.id1'] })).toBeTruthy();
    expect(screen.getByText(dictionaries.es['tools.docsIntro'])).toBeTruthy();
  });
});
