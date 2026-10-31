import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { useAppStore, type Language } from '@/stores/appStore';
import { dictionaries } from '@/i18n';
import { LANGUAGES } from '@/i18n/config';
import { makeTranslator } from '@/i18n/runtime';
import { formatNumber } from '@/i18n/formatters';

vi.mock('@/components/layout/MainLayout', () => ({ MainLayout: ({ children }: { children: React.ReactNode }) => <main>{children}</main> }));
import NeighborhoodPage from '@/app/neighborhood/page';
import { neighborhoodCopy } from '@/app/neighborhood/neighborhoodTranslations';

beforeEach(() => { window.localStorage.clear(); useAppStore.getState().resetAll(); });

describe('neighborhood medical information', () => {
  it('does not send residents to a closed emergency department', () => {
    useAppStore.getState().setLanguage('es');
    render(<NeighborhoodPage />);
    fireEvent.click(screen.getByRole('button', { name: new RegExp(dictionaries.es['neighborhood.healthcare']) }));
    expect(screen.getByText(dictionaries.es['neighborhood.carneyClosed'])).toBeTruthy();
    expect(screen.queryByText('24/7 Emergency Room')).toBeNull();
    expect(screen.getByRole('link', { name: 'Mass.gov' }).getAttribute('href')).toContain('mass.gov/resources-for-patients');
  });
});


describe('neighborhood guide language', () => {
  it.each(LANGUAGES)('localizes the guide and labels in $nativeName', ({ code }) => {
    const language = code as Language;
    useAppStore.getState().setLanguage(language);
    render(<NeighborhoodPage />);
    const t = makeTranslator(dictionaries[language], language);
    expect(screen.getByRole('heading', { name: t('neighborhood.guide') })).toBeTruthy();
    const overview = t('neighborhood.overviewOne', { population: formatNumber(122191, language) });
    expect([...document.querySelectorAll('p')].some((node) => node.textContent === overview)).toBe(true);
    expect(screen.getByText(t('neighborhood.localFiguresNote'))).toBeTruthy();
    expect(screen.queryByText('~150,000')).toBeNull();
    expect(screen.getByRole('link', { name: /Boston Planning Department.*2020 Census/ }).getAttribute('href')).toContain('c55502f3');
    expect(screen.getByText(t('neighborhood.overviewTwo'))).toBeTruthy();
    expect(screen.getByRole('heading', { name: t('neighborhood.subTitle') })).toBeTruthy();
    expect(screen.getByRole('heading', { name: t('neighborhood.transportation') })).toBeTruthy();
    const card = screen.getByRole('button', { name: /Fields Corner/ });
    expect(within(card).queryByText(t('neighborhood.medianRentLabel'))).toBeNull();
    expect(within(card).queryByText('$2,650')).toBeNull();
    const copy = neighborhoodCopy('Fields Corner', language);
    const summary = copy?.summary ?? 'Major commercial hub with Red Line access. Strong Vietnamese community.';
    expect(within(card).getByText(summary).getAttribute('lang')).toBe(language);
    if (language !== 'en') expect(screen.getByText(t('neighborhood.translationDraft'))).toBeTruthy();
    fireEvent.click(card);
    expect(within(card.parentElement!).getByRole('link', { name: t('neighborhood.transportation') }).getAttribute('href')).toBe('#neighborhood-transit');
    expect(within(card.parentElement!).getByRole('link', { name: t('nav.projects') }).getAttribute('href')).toBe('/projects');
    expect(screen.queryByText('Boston Nature Center')).toBeNull();
    const caption = copy?.caption ?? 'Inbound Red Line train arriving at Fields Corner station, July 2021';
    expect(screen.getByAltText(caption).getAttribute('lang')).toBe(language);
    expect(screen.getByText(t('neighborhood.sourceCaution'))).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: (name) => name.includes(t('neighborhood.rightsTitle')) }));
    expect(screen.getByText(t('neighborhood.evictionBody'))).toBeTruthy();
    expect(screen.getByText(t('neighborhood.heatBody'))).toBeTruthy();
    expect(screen.getByText(t('neighborhood.noticeBody'))).toBeTruthy();
    expect(screen.getByRole('link', { name: '(617) 603-1807' }).getAttribute('href')).toBe('tel:6176031807');
    expect(screen.queryByText('(617) 603-1700')).toBeNull();
  });
});
