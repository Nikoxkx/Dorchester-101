import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { createHash } from 'node:crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WINTER_CLOTHING } from '@/data/winterClothing';
import { CLOTHING_SPANISH, CLOTHING_SPANISH_SOURCE_DIGEST } from '@/data/winterClothing.es';
import { CLOTHING_SUMMARIES, CLOTHING_SUMMARY_SOURCE_DIGEST } from '@/data/winterClothing.summaries';
import { CLOTHING_LOCATOR_DETAILS, CLOTHING_LOCATOR_SOURCE_DIGEST } from '@/data/winterClothing.locators';
import { CLOTHING_PLACE_DETAILS, CLOTHING_PLACE_IDS, CLOTHING_PLACE_SOURCE_DIGEST } from '@/data/winterClothing.places';
import { clothingContent } from '@/i18n/clothingContent';
import { search as globalSearch } from '@/lib/searchIndex';
import { dictionaries } from '@/i18n';
import { LANGUAGES } from '@/i18n/config';
import { makeTranslator } from '@/i18n/runtime';
import { useAppStore, type Language } from '@/stores/appStore';

vi.mock('@/hooks/useWinterClothing', () => ({ useWinterClothing: () => ({ places: WINTER_CLOTHING }) }));
vi.mock('@/hooks/useWeather', () => ({ useWeather: () => ({ data: null }) }));
vi.mock('@/components/layout/MainLayout', () => ({ MainLayout: ({ children }: { children: React.ReactNode }) => <main>{children}</main> }));
vi.mock('@/components/layout/ProjectNote', () => ({ ProjectNote: () => null }));

import { ClothingCard } from '@/components/clothing/ClothingCard';
import WinterClothingView from '@/app/winter-clothing/WinterClothingView';

beforeEach(() => useAppStore.getState().setLanguage('en'));

describe('winter clothing translations', () => {
  it('flags source changes for translation review', () => {
    const digest = createHash('sha256').update(JSON.stringify(WINTER_CLOTHING)).digest('hex');
    expect(digest, 'Review Spanish details and update CLOTHING_SPANISH_SOURCE_DIGEST').toBe(CLOTHING_SPANISH_SOURCE_DIGEST);
    expect(digest, 'Review every translated summary and update CLOTHING_SUMMARY_SOURCE_DIGEST').toBe(CLOTHING_SUMMARY_SOURCE_DIGEST);
  });

  it('uses the current state heating-season default in both full instruction drafts', () => {
    const cold = WINTER_CLOTHING.find((record) => record.id === 'boston-cold')!;
    expect(cold.howToGet).toContain('May 31 by default');
    expect(CLOTHING_SPANISH['boston-cold'].howToGet).toContain('31 de mayo');
    expect(cold.howToGet).not.toContain('June 15');
    expect(CLOTHING_SPANISH['boston-cold'].howToGet).not.toContain('15 de junio');
  });

  it('keeps Spanish summary, instructions, eligibility, hours and transit coverage in sync with every record', () => {
    expect(Object.keys(CLOTHING_SPANISH).sort()).toEqual(WINTER_CLOTHING.map((place) => place.id).sort());
    for (const place of WINTER_CLOTHING) {
      const translated = CLOTHING_SPANISH[place.id];
      expect(translated.summary.length, place.id).toBeGreaterThan(20);
      expect(translated.howToGet.length, place.id).toBeGreaterThan(20);
      for (const field of ['eligibility', 'hoursNote', 'transit'] as const) {
        if (place[field]) expect(translated[field], `${place.id}: ${field}`).toBeTruthy();
      }
    }
  });

  it('shows Spanish instructions and labels truly missing content honestly', () => {
    const place = WINTER_CLOTHING.find((record) => record.id === 'abcd-dorchester-nsc')!;
    useAppStore.getState().setLanguage('es');
    const { rerender } = render(<ClothingCard place={place} />);
    const t = makeTranslator(dictionaries.es, 'es');
    expect(screen.getByText(CLOTHING_SPANISH[place.id].summary).getAttribute('lang')).toBe('es');
    expect(screen.getByText(CLOTHING_SPANISH[place.id].howToGet).getAttribute('lang')).toBe('es');
    expect(screen.getByText(CLOTHING_SPANISH[place.id].eligibility!).getAttribute('lang')).toBe('es');
    expect(screen.queryByText(t('lang.untranslated', { language: 'Español' }))).toBeNull();

    // A newly added record without a translation must never pretend to be Arabic.
    const untranslated = { ...place, id: 'new-untranslated-place' };
    act(() => useAppStore.getState().setLanguage('ar'));
    rerender(<ClothingCard place={untranslated} />);
    const ar = makeTranslator(dictionaries.ar, 'ar');
    expect(screen.getByText(ar('lang.untranslated', { language: 'العربية' }))).toBeTruthy();
    expect(screen.getByText(place.howToGet).getAttribute('lang')).toBe('en');
  });

  it('covers every clothing summary and preserves key safety numbers', () => {
    const codes = LANGUAGES.map(({ code }) => code).filter((code) => code !== 'en' && code !== 'es').sort();
    expect(Object.keys(CLOTHING_SUMMARIES).sort()).toEqual(codes);
    const ids = WINTER_CLOTHING.map((place) => place.id).sort();
    for (const [language, summaries] of Object.entries(CLOTHING_SUMMARIES)) {
      expect(Object.keys(summaries).sort(), language).toEqual(ids);
      for (const id of ids) expect(summaries[id].length, `${language}: ${id}`).toBeGreaterThan(30);
      for (const token of ['-10°F', '0°F', '911']) expect(summaries['boston-cold'], `${language}: ${token}`).toContain(token);
      for (const token of ['100', '2026', '2027']) expect(summaries['antons-coats-for-kids'], `${language}: ${token}`).toContain(token);
      expect(summaries['cradles-to-crayons'], language).toContain('12');
      expect(summaries['mass-211'], language).toContain('24');
    }
  });

  it.each(LANGUAGES.filter(({ code }) => code !== 'en' && code !== 'es'))(
    'shows translated details without English fallback in $nativeName', ({ code }) => {
      const language = code as Exclude<Language, 'en' | 'es'>;
      const place = WINTER_CLOTHING.find((record) => record.id === 'abcd-dorchester-nsc')!;
      useAppStore.getState().setLanguage(language);
      render(<ClothingCard place={place} />);
      const t = makeTranslator(dictionaries[language], language);
      expect(screen.getByText(CLOTHING_SUMMARIES[language][place.id]).getAttribute('lang')).toBe(language);
      const how = screen.getByText(CLOTHING_PLACE_DETAILS[language][place.id].howToGet);
      expect(how.getAttribute('lang')).toBe(language);
      expect(how.getAttribute('dir')).toBe('auto');
      expect(screen.queryByText(t('lang.someEnglish'))).toBeNull();
    },
  );

  it('tracks the source of the nine place-detail drafts', () => {
    const source = CLOTHING_PLACE_IDS.map((id) => {
      const item = WINTER_CLOTHING.find((place) => place.id === id)!;
      return [id, item.name, item.neighborhood, item.address, item.howToGet, item.eligibility, item.hoursNote,
        item.transit, item.kind, item.directionsAllowed, item.season, item.website];
    });
    expect(createHash('sha256').update(JSON.stringify(source)).digest('hex')).toBe(CLOTHING_PLACE_SOURCE_DIGEST);
  });

  it('covers all nine places and preserves contacts, eligibility and dates in every draft', () => {
    expect(CLOTHING_PLACE_IDS.length).toBe(9);
    for (const { code } of LANGUAGES.filter(({ code }) => code !== 'en' && code !== 'es')) {
      const language = code as Exclude<Language, 'en' | 'es'>;
      const drafts = CLOTHING_PLACE_DETAILS[language];
      expect(Object.keys(drafts).sort()).toEqual([...CLOTHING_PLACE_IDS].sort());
      for (const id of CLOTHING_PLACE_IDS) {
        const place = WINTER_CLOTHING.find((item) => item.id === id)!;
        const content = clothingContent(place, code);
        expect(content.howToGetLanguage, `${code}: ${id}`).toBe(code);
        expect(content.summaryLanguage, `${code}: ${id}`).toBe(code);
        for (const field of ['eligibility', 'hoursNote', 'transit'] as const) {
          if (place[field]) expect(content[`${field}Language`], `${code}: ${id}: ${field}`).toBe(code);
        }
        expect(content.fellBack, `${code}: ${id}`).toBe(false);
      }
      const digits = (text: string) => text.replace(/\D/g, '');
      expect(digits(drafts['abcd-dorchester-nsc'].howToGet)).toContain('6172882700');
      for (const item of ['abcd-dorchester-nsc', 'cradles-to-crayons']) {
        expect(drafts[item].eligibility).toContain('200%');
        expect(drafts[item].eligibility).toContain('12');
      }
      for (const token of ['02121', '02125', '02127']) expect(drafts['kroc-center'].eligibility).toContain(token);
      for (const phone of ['6173186940', '6175425420']) expect(digits(drafts['kroc-center'].howToGet)).toContain(phone);
      for (const token of ['2023', '117', '6A']) expect(drafts['coats4vets'].howToGet).toContain(token);
      expect(digits(drafts['coats4vets'].howToGet)).toContain('6173783974');
      expect(digits(drafts['rosies-place'].howToGet)).toContain('6173180237');
      expect(drafts['rosies-place'].howToGet).toContain('2026');
      expect(drafts['yawkey-basic-needs'].transit).toContain('16');
    }
  });

  it('keeps partner referrals, uncertain services and source-check status honest', () => {
    useAppStore.getState().setLanguage('en');
    const cradles = WINTER_CLOTHING.find((item) => item.id === 'cradles-to-crayons')!;
    const { rerender } = render(<ClothingCard place={cradles} />);
    expect(screen.queryByRole('link', { name: dictionaries.en['clothing.directions'] })).toBeNull();
    expect(cradles.directionsAllowed).toBe(false);
    expect(cradles.eligibility).toContain('actively working');
    const rosie = WINTER_CLOTHING.find((item) => item.id === 'rosies-place')!;
    expect(rosie.offers).toContain('clothingReferral');
    expect(rosie.hours).toBeUndefined();
    expect(rosie.howToGet).toContain('617) 318-0237');
    const yawkey = WINTER_CLOTHING.find((item) => item.id === 'yawkey-basic-needs')!;
    expect(yawkey.hours).toBeUndefined();
    expect(yawkey.summary.en).toContain('not confirmed');
    expect(yawkey.transit).toContain('bus 16');
    expect(yawkey.lat).toBeCloseTo(42.306567, 6);
    const veteran = WINTER_CLOTHING.find((item) => item.id === 'coats4vets')!;
    expect(veteran.verification.status).toBe('needs-review');
    expect(veteran.howToGet).toContain('2023');
    expect(veteran.requiresId).toBeUndefined();
    const finder = WINTER_CLOTHING.find((item) => item.id === 'findhelp-clothing')!;
    rerender(<ClothingCard place={{ ...finder, sourceCheck: { reachable: true, status: 200, checkedAt: '2026-10-31T12:00:00Z' } }} />);
    expect(screen.getByText(dictionaries.en['clothing.freeOrReduced'])).toBeTruthy();
    expect(screen.getByText(/details and stock were not verified/i)).toBeTruthy();
  });

  it('searches translated place instructions and preserves English search', () => {
    const place = WINTER_CLOTHING.find((item) => item.id === 'kroc-center')!;
    const draft = CLOTHING_PLACE_DETAILS.pt[place.id];
    expect(globalSearch('inscricao previa', { language: 'pt', kinds: ['organization'], limit: 50 }).some((hit) => hit.id === 'clothing-kroc-center')).toBe(true);
    expect(globalSearch('holiday coat assistance', { language: 'pt', kinds: ['organization'], limit: 50 }).some((hit) => hit.id === 'clothing-kroc-center')).toBe(true);
    expect(globalSearch('6173180237', { language: 'pt', kinds: ['organization'], limit: 50 }).some((hit) => hit.id === 'clothing-rosies-place')).toBe(true);
    useAppStore.getState().setLanguage('pt');
    render(<ClothingCard place={place} />);
    expect(screen.getByText(draft.eligibility!).getAttribute('lang')).toBe('pt');
  });

  it('labels collection dates without claiming year-round or coat availability', () => {
    const antons = WINTER_CLOTHING.find((item) => item.id === 'antons-coats-for-kids')!;
    const { rerender } = render(<ClothingCard place={{ ...antons, computed: { openNow: null, inSeason: true, checkedAgeDays: 0, checkLevel: 'fresh' } }} />);
    expect(screen.getByText(dictionaries.en['clothing.collectionActive'])).toBeTruthy();
    expect(screen.getByText(`${dictionaries.en['clothing.collectionDates']}:`)).toBeTruthy();
    expect(screen.queryByText(dictionaries.en['clothing.inSeason'])).toBeNull();
    rerender(<ClothingCard place={{ ...antons, computed: { openNow: null, inSeason: null, checkedAgeDays: 0, checkLevel: 'fresh' } }} />);
    expect(screen.queryByText(dictionaries.en['clothing.yearRound'])).toBeNull();
  });

  it('tracks the source of the four translated locator instructions', () => {
    const ids = ['mass-211', 'one-warm-coat', 'findhelp-clothing', 'boston-cold'];
    const source = ids.map((id) => {
      const item = WINTER_CLOTHING.find((place) => place.id === id)!;
      return [id, item.name, item.neighborhood, item.howToGet, item.eligibility, item.hoursNote, item.transit, item.address];
    });
    expect(createHash('sha256').update(JSON.stringify(source)).digest('hex')).toBe(CLOTHING_LOCATOR_SOURCE_DIGEST);
  });

  it('preserves emergency details and language metadata in every locator draft', () => {
    const ids = ['mass-211', 'one-warm-coat', 'findhelp-clothing', 'boston-cold'];
    for (const { code } of LANGUAGES.filter(({ code }) => code !== 'en' && code !== 'es')) {
      const drafts = CLOTHING_LOCATOR_DETAILS[code as Exclude<Language, 'en' | 'es'>]!;
      expect(Object.keys(drafts).sort()).toEqual([...ids].sort());
      for (const id of ids) {
        const place = WINTER_CLOTHING.find((item) => item.id === id)!;
        const content = clothingContent(place, code);
        expect(content.howToGetLanguage, `${code}: ${id}`).toBe(code);
        expect(content.neighborhoodLanguage, `${code}: ${id}`).toBe(code);
        expect(content.fellBack, `${code}: ${id}`).toBe(false);
      }
      for (const token of ['2-1-1', '877-211-6277', '508-370-4890']) expect(drafts['mass-211'].howToGet).toContain(token);
      for (const token of ['68°F', '64°F', '15', '31', 'boston.gov/cold']) expect(drafts['boston-cold'].howToGet).toContain(token);
      for (const token of ['02121', '02122', '02124', '02125']) expect(drafts['one-warm-coat'].howToGet).toContain(token);
    }
  });

  it('renders the translated 211 instructions and retains bilingual search', () => {
    const place = WINTER_CLOTHING.find((item) => item.id === 'mass-211')!;
    useAppStore.getState().setLanguage('pt');
    render(<ClothingCard place={place} />);
    const draft = CLOTHING_LOCATOR_DETAILS.pt!['mass-211'];
    expect(screen.getByText(draft.howToGet).getAttribute('lang')).toBe('pt');
    expect(screen.queryByText(dictionaries.pt['lang.someEnglish'])).toBeNull();
    const hit = globalSearch('peça casacos ou roupas de inverno', { language: 'pt', kinds: ['organization'], limit: 50 }).find((entry) => entry.id === 'clothing-mass-211');
    expect(hit?.subtitle).toContain(draft.neighborhood);
    expect(hit?.subtitleLanguage).toBe('pt');
    expect(hit?.subtitleFellBack).toBe(false);
    expect(globalSearch('free winter coats or clothing near me', { language: 'pt', kinds: ['organization'], limit: 50 }).some((entry) => entry.id === 'clothing-mass-211')).toBe(true);
  });

  it('shows the recorded language list translated and formats the season dates', () => {
    useAppStore.getState().setLanguage('es');
    const mass = WINTER_CLOTHING.find((record) => record.id === 'mass-211')!;
    const { rerender } = render(<ClothingCard place={mass} />);
    expect(screen.getByText(/Inglés, español, portugués/i)).toBeTruthy();
    const seasonal = WINTER_CLOTHING.find((record) => record.id === 'antons-coats-for-kids')!;
    rerender(<ClothingCard place={seasonal} />);
    expect(screen.getByText('5 de octubre de 2026 – 9 de enero de 2027')).toBeTruthy();
  });

  it('searches both translated and English summaries', () => {
    useAppStore.getState().setLanguage('vi');
    render(<WinterClothingView />);
    const t = makeTranslator(dictionaries.vi, 'vi');
    const search = screen.getByPlaceholderText(t('clothing.searchPlaceholder'));
    fireEvent.change(search, { target: { value: 'nhu cầu cơ bản' } });
    expect(screen.getByRole('heading', { name: CLOTHING_PLACE_DETAILS.vi['yawkey-basic-needs'].name })).toBeTruthy();
    fireEvent.change(search, { target: { value: '6173180237' } });
    expect(screen.getByRole('heading', { name: "Rosie's Place" })).toBeTruthy();
    fireEvent.change(search, { target: { value: 'winter gear pack' } });
    expect(screen.getByRole('heading', { name: 'ABCD Dorchester Neighborhood Service Center' })).toBeTruthy();
  });

  it('finds a listing by a translated summary while retaining English-name search', () => {
    useAppStore.getState().setLanguage('es');
    render(<WinterClothingView />);
    const t = makeTranslator(dictionaries.es, 'es');
    const search = screen.getByPlaceholderText(t('clothing.searchPlaceholder'));
    fireEvent.change(search, { target: { value: 'necesidades básicas' } });
    expect(screen.getByRole('heading', { name: CLOTHING_SPANISH['yawkey-basic-needs'].name })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Cradles to Crayons' })).toBeNull();
    fireEvent.change(search, { target: { value: 'Cradles to Crayons' } });
    expect(screen.getByRole('heading', { name: 'Cradles to Crayons' })).toBeTruthy();
    const card = screen.getByRole('heading', { name: 'Cradles to Crayons' }).closest('article');
    expect(within(card!).getByText(CLOTHING_SPANISH['cradles-to-crayons'].eligibility!)).toBeTruthy();
  });
});
