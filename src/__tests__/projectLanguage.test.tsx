import { createHash } from 'node:crypto';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAppStore } from '@/stores/appStore';
import { dictionaries } from '@/i18n';
import { makeTranslator } from '@/i18n/runtime';
import { PROJECT_SOURCE_DIGEST, PROJECT_TRANSLATIONS, SPANISH_PROJECTS } from '@/app/projects/projectTranslations';
import { PROJECTS } from '@/app/projects/projectsData';
import { LANGUAGES } from '@/i18n/config';

vi.mock('@/components/layout/MainLayout', () => ({
  MainLayout: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));
vi.mock('@/components/layout/ProjectNote', () => ({
  ProjectNote: ({ children }: { children: React.ReactNode }) => <aside>{children}</aside>,
}));

import ProjectsPage from '@/app/projects/page';

beforeEach(() => useAppStore.getState().setLanguage('en'));

describe('housing projects language coverage', () => {
  it('switches all four project descriptions, details and calendar reminders to Spanish', () => {
    render(<ProjectsPage />);
    act(() => useAppStore.getState().setLanguage('es'));
    const t = makeTranslator(dictionaries.es, 'es');
    for (const project of Object.values(SPANISH_PROJECTS)) {
      expect(screen.getByText(project.description).getAttribute('lang')).toBe('es');
      expect(screen.getByText(project.parcelNote)).toBeTruthy();
      expect(screen.getByText(project.unitMix)).toBeTruthy();
      expect(screen.getByText(project.communityBenefits)).toBeTruthy();
      expect(screen.getByText(project.howToApply)).toBeTruthy();
    }
    expect(screen.queryByText(t('lang.untranslated', { language: 'Español' }))).toBeNull();
    const heading = screen.getByRole('heading', { name: 'Dot Block' });
    const card = heading.closest('[class*="rounded-xl"]');
    expect(card).toBeTruthy();
    const google = within(card!).getByRole('link', { name: t('calendar.google') });
    const url = new URL(google.getAttribute('href')!);
    expect(url.searchParams.get('text')).toBe(t('projects.calendarTitle', { project: 'Dot Block' }));
    expect(url.searchParams.get('details')).toContain(SPANISH_PROJECTS[1].howToApply);
    expect(url.searchParams.get('details')).toContain('Dirección:');
    expect(within(card!).getAllByText(t('projects.units', { count: 17 }))).toHaveLength(2);
    expect(within(card!).getByText(t('imagery.noVerifiedPhoto'))).toBeTruthy();
    expect(within(card!).getByRole('link', { name: t('imagery.projectSource') }).getAttribute('href')).toBe(PROJECTS[0].applicationSourceUrl);
  });

  it.each(LANGUAGES.filter(({ code }) => code !== 'en'))(
    'renders all project records and calendar details in $nativeName', (language) => {
      const code = language.code as keyof typeof PROJECT_TRANSLATIONS;
      useAppStore.getState().setLanguage(code);
      render(<ProjectsPage />);
      const t = makeTranslator(dictionaries[code], code);
      expect(screen.getByRole('heading', { name: t('projects.title') })).toBeTruthy();
      expect(screen.getByText(t('clothing.translationDraft'))).toBeTruthy();
      expect(screen.queryByText(t('lang.untranslated', { language: language.nativeName }))).toBeNull();
      for (const source of PROJECTS) {
        const project = PROJECT_TRANSLATIONS[code][source.id];
        const description = screen.getByText(project.description);
        expect(description.getAttribute('lang')).toBe(code);
        expect(description.getAttribute('dir')).toBe(code === 'ar' ? 'rtl' : 'ltr');
        expect(screen.getByText(project.parcelNote)).toBeTruthy();
        expect(screen.getByText(project.unitMix)).toBeTruthy();
        expect(screen.getByText(project.communityBenefits)).toBeTruthy();
        expect(screen.getByText(project.howToApply)).toBeTruthy();
        const card = screen.getByRole('heading', { name: source.name }).closest('[class*="rounded-xl"]');
        const google = within(card!).getByRole('link', { name: t('calendar.google') });
        expect(new URL(google.getAttribute('href')!).searchParams.get('details')).toContain(project.howToApply);
        const sourceLink = within(card!).getByRole('link', { name: t('ui.sourceNamed', { name: source.applicationSourceName }) });
        expect(sourceLink.getAttribute('href')).toBe(source.applicationSourceUrl);
      }
    },
  );

  it('qualifies application status and links to the relevant sources', () => {
    expect(PROJECTS[0].howToApply).toContain('first-come, first-served, not a lottery');
    expect(PROJECTS[0].howToApply).toContain('waitlist');
    expect(PROJECTS[0].howToApply).toContain('31 October 2026');
    expect(PROJECTS[0].applicationSourceUrl).toContain('affordablelistings.com');
    expect(PROJECTS[1].howToApply).toContain('not confirmed');
    expect(PROJECTS[2].howToApply).toContain('open waitlist on 31 October 2026');
    expect(PROJECTS[2].howToApply).toContain('(617) 287-9580');
    expect(PROJECTS[2].applicationSourceUrl).toContain('HN-MA-018816');
    expect(PROJECTS[3].howToApply).toContain('status can change');
    expect(PROJECTS[0].parcelNote).not.toContain('one block');
    expect(PROJECTS[0].description).not.toContain('beside Savin Hill');
    for (const records of Object.values(PROJECT_TRANSLATIONS)) {
      expect(records[1].howToApply).toContain('ACRES');
      expect(records[1].howToApply).toContain('2026');
      expect(records[3].howToApply).toContain('2026');
      expect(records[3].howToApply).toContain('(617) 287-9580');
      expect(records[4].howToApply).toContain('2028');
    }
  });

  it('requires a translation review whenever the source project records change', () => {
    const digest = createHash('sha256').update(JSON.stringify(PROJECTS)).digest('hex');
    expect(digest, 'Review every translation and update PROJECT_SOURCE_DIGEST after source changes').toBe(PROJECT_SOURCE_DIGEST);
  });

  it('covers the same fields, amenities, project IDs and key figures in every locale', () => {
    for (const [code, records] of Object.entries(PROJECT_TRANSLATIONS)) {
      expect(Object.keys(records).sort()).toEqual(PROJECTS.map(({ id }) => String(id)).sort());
      for (const project of PROJECTS) {
        const record = records[project.id];
        for (const field of ['description', 'parcelNote', 'unitMix', 'communityBenefits', 'howToApply', 'renderingNote'] as const) {
          expect(record[field]?.trim().length, `${code}: project ${project.id} ${field}`).toBeGreaterThan(15);
        }
        expect(record.amenities.length, `${code}: project ${project.id} amenities`).toBe(project.amenities.length);
        expect(record.amenities.every((value) => value.trim().length > 5)).toBe(true);
        expect(record.unitMix).toContain(String(project.id === 1 ? 245 : project.totalUnits));
        if (project.id === 1) for (const figure of ['33', '84', '17', '30%', '50%', '60%', '70%']) expect(record.unitMix).toContain(figure);
        if (project.id === 3) for (const figure of ['19', '23']) expect(record.unitMix).toContain(figure);
        if (project.id === 4) for (const figure of ['30%', '50%', '60%', '80%', '120%']) expect(record.unitMix).toContain(figure);
      }
    }
  });

  it('searches project details in both the selected language and English', () => {
    useAppStore.getState().setLanguage('es');
    render(<ProjectsPage />);
    const input = screen.getByLabelText(dictionaries.es['projects.search']);
    fireEvent.change(input, { target: { value: 'estacionamiento en el sotano' } });
    expect(screen.getByRole('heading', { name: PROJECTS[3].name })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: PROJECTS[0].name })).toBeNull();
    fireEvent.change(input, { target: { value: 'basement parking' } });
    expect(screen.getByRole('heading', { name: PROJECTS[3].name })).toBeTruthy();
  });
});
