import { createHash } from 'node:crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { LANGUAGES } from '@/i18n/config';
import { dictionaries, type TranslationKey } from '@/i18n';
import { makeTranslator } from '@/i18n/runtime';
import { useAppStore } from '@/stores/appStore';
import { HEALTHCARE_SOURCE_DIGEST, NEIGHBORHOOD_HEALTH_CENTERS } from '@/app/neighborhood/healthcareData';

vi.mock('@/components/layout/MainLayout', () => ({ MainLayout: ({ children }: { children: React.ReactNode }) => <main>{children}</main> }));
import NeighborhoodPage from '@/app/neighborhood/page';

beforeEach(() => { window.localStorage.clear(); useAppStore.getState().resetAll(); });

const sourceKeys: TranslationKey[] = [
  'neighborhood.healthcarePreview', 'neighborhood.healthHours', 'neighborhood.healthCodmanServices',
  'neighborhood.healthDotHouseServices', 'neighborhood.healthInsurance', 'neighborhood.healthLanguages', 'neighborhood.healthDraft',
];

describe('neighborhood healthcare translations', () => {
  it('flags source changes for translation synchronization', () => {
    const source = [NEIGHBORHOOD_HEALTH_CENTERS, sourceKeys.map((key) => dictionaries.en[key])];
    expect(createHash('sha256').update(JSON.stringify(source)).digest('hex')).toBe(HEALTHCARE_SOURCE_DIGEST);
  });

  it.each(LANGUAGES)('renders the translated, qualified clinic guidance in $nativeName', ({ code }) => {
    useAppStore.getState().setLanguage(code);
    const t = makeTranslator(dictionaries[code], code);
    render(<NeighborhoodPage />);
    const toggle = screen.getByRole('button', { name: (name) => name.includes(t('neighborhood.healthcare')) });
    expect(within(toggle).getByText(t('neighborhood.healthcarePreview'))).toBeTruthy();
    fireEvent.click(toggle);
    const section = within(toggle.parentElement!);
    expect(section.getByText(t('neighborhood.carneyClosed'))).toBeTruthy();
    expect(t('neighborhood.carneyClosed')).toContain('911');
    expect(section.getByText(t('neighborhood.healthCodmanServices'))).toBeTruthy();
    expect(section.getByText(t('neighborhood.healthDotHouseServices'))).toBeTruthy();
    expect(section.getAllByText(t('neighborhood.healthHours'))).toHaveLength(2);
    expect(section.getAllByText(t('neighborhood.healthInsurance'))).toHaveLength(2);
    expect(section.getAllByText(t('neighborhood.healthLanguages'))).toHaveLength(2);
    expect(section.queryByText('Mon-Fri 8am-5pm')).toBeNull();
    if (code !== 'en') {
      expect(section.getByText(t('neighborhood.healthDraft'))).toBeTruthy();
      expect(section.queryByText(t('lang.detailsEnglish'))).toBeNull();
    }
    for (const center of NEIGHBORHOOD_HEALTH_CENTERS) {
      expect(section.getByRole('link', { name: center.phone }).getAttribute('href')).toBe(`tel:${center.phone.replace(/\D/g, '')}`);
      expect(section.getByRole('link', { name: t('ui.sourceNamed', { name: center.name }) }).getAttribute('href')).toBe(center.website);
    }
  });
});
