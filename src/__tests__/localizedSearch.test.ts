import { describe, expect, it } from 'vitest';
import { search } from '@/lib/searchIndex';
import { GET } from '@/app/api/search/route';
import { LANGUAGES } from '@/i18n/config';
import { dictionaries } from '@/i18n';
import { BADGES } from '@/lib/badges';
import { SOURCES, type SourceId } from '@/data/sources';
import type { TranslationKey } from '@/i18n/en';

describe('localized search and data-backed labels', () => {
  it('searches and returns translated page labels and descriptions', () => {
    const hits = search('vivienda', { language: 'es', kinds: ['page'], limit: 40 });
    const housing = hits.find((hit) => hit.href === '/affordable-housing');
    expect(housing?.title).toBe('Vivienda asequible');
    expect(housing?.subtitle).toBe(dictionaries.es['housing.description']);
    // English terms remain searchable even after changing the UI language.
    expect(search('affordable', { language: 'es', kinds: ['page'] }).some((hit) => hit.href === '/affordable-housing')).toBe(true);
  });

  it('finds translated resources and clothing in global search', () => {
    expect(search('متأخرات الإيجار', { language: 'ar', kinds: ['organization'], limit: 50 }).some((hit) => hit.id === 'org-raft-mass')).toBe(true);
    expect(search('nhu cầu cơ bản', { language: 'vi', kinds: ['organization'], limit: 50 }).some((hit) => hit.id === 'clothing-yawkey-basic-needs')).toBe(true);
    expect(search('winter gear pack', { language: 'vi', kinds: ['organization'], limit: 50 }).some((hit) => hit.id === 'clothing-abcd-dorchester-nsc')).toBe(true);
  });

  it('passes the selected language through the public search API', async () => {
    const result = await GET(new Request('http://localhost/api/search?q=vivienda&lang=es&limit=40'));
    const json = await result.json();
    expect(json.pages.some((page: { href: string; title: string }) => page.href === '/affordable-housing' && page.title === 'Vivienda asequible')).toBe(true);
    const fallback = await GET(new Request('http://localhost/api/search?q=affordable&lang=unknown'));
    const english = await fallback.json();
    expect(english.pages.some((page: { title: string }) => page.title === 'Affordable housing')).toBe(true);
  });

  it('has real localized text for every source tooltip and achievement badge', () => {
    for (const { code } of LANGUAGES) {
      for (const id of Object.keys(SOURCES) as SourceId[]) {
        const key: TranslationKey = `sources.info.${id}`;
        expect(dictionaries[code][key], `${code} ${key}`).toBeTruthy();
        if (code !== 'en') expect(dictionaries[code][key]).not.toBe(dictionaries.en[key]);
      }
      for (const badge of BADGES) {
        expect(dictionaries[code][badge.titleKey]).toBeTruthy();
        expect(dictionaries[code][badge.descriptionKey]).toBeTruthy();
        if (code !== 'en') expect(dictionaries[code][badge.descriptionKey]).not.toBe(dictionaries.en[badge.descriptionKey]);
      }
    }
  });
});
