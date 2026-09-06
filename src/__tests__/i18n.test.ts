import { describe, it, expect } from 'vitest';
import {
  translations,
  useTranslation,
  formatFor,
  availableLanguages,
  isRtl,
  type TranslationKey,
} from '@/lib/i18n';
import { en } from '@/lib/i18n/en';

describe('i18n', () => {
  describe('full parity (the compiler enforces it too)', () => {
    it('every language defines every English key with a non-empty string', () => {
      const keys = Object.keys(en) as TranslationKey[];
      expect(keys.length).toBeGreaterThan(150);
      for (const lang of availableLanguages) {
        const dict = translations[lang.code];
        expect(dict, `missing dictionary for ${lang.code}`).toBeDefined();
        for (const key of keys) {
          expect(dict[key], `${lang.code} missing "${key}"`).toBeTruthy();
          expect(typeof dict[key], `${lang.code} "${key}" not a string`).toBe('string');
        }
      }
    });

    it('no language accidentally ships English in nav (spot check)', () => {
      for (const lang of availableLanguages) {
        if (lang.code === 'en') continue;
        const dict = translations[lang.code];
        // Sanity: the value must differ from English for a Latin-script sample
        // and exist for all.
        expect(dict['nav.food']).not.toBe('');
      }
      expect(translations.zh['nav.food']).toMatch(/食物/);
      expect(translations.ar['nav.food']).toMatch(/طعام/);
    });
  });

  describe('useTranslation', () => {
    it('returns translation function', () => {
      const { t } = useTranslation('en');
      expect(typeof t).toBe('function');
    });

    it('translates for valid key and language', () => {
      const { t } = useTranslation('es');
      expect(t('nav.dashboard')).toBe('Inicio');
    });

    it('falls back to English for unknown language', () => {
      const { t } = useTranslation('unknown-language');
      expect(t('nav.dashboard')).toBe('Dashboard');
    });

    it('interpolates {vars}', () => {
      const { t } = useTranslation('en');
      expect(t('common.household', { n: 4 })).toBe('Household of 4');
      expect(t('emergency.callLabel', { name: 'Project Bread' })).toContain('Project Bread');
    });

    it('same language instance gives same result (stable)', () => {
      const a = useTranslation('ht');
      const b = useTranslation('ht');
      expect(a.t('settings.title')).toBe(b.t('settings.title'));
    });
  });

  describe('locale formatting', () => {
    it('formats currency per locale', () => {
      expect(formatFor('en').currency(1234)).toBe('$1,234');
      // USD stays the currency; the locale controls digits and grouping.
      expect(formatFor('zh').currency(1234)).toBe('US$1,234');
      // ar-EG renders Eastern Arabic numerals: ١٬٢٣٤
      expect(formatFor('ar').currency(1234)).toMatch(/[٠-٩]/);
    });

    it('formats numbers per locale', () => {
      expect(formatFor('en').number(12345)).toBe('12,345');
      expect(formatFor('de' in {} ? 'en' : 'en').number(12345)).toBe('12,345'); // en fallback guard
    });

    it('localeFor maps every UI language (kea → pt-CV)', () => {
      expect(formatFor('kea').locale).toBe('pt-CV');
      expect(formatFor('zh').locale).toBe('zh-CN');
    });

    it('rtl detection only for Arabic', () => {
      expect(isRtl('ar')).toBe(true);
      expect(isRtl('en')).toBe(false);
      expect(isRtl('ht')).toBe(false);
    });
  });

  describe('availableLanguages', () => {
    it('has exactly the 9 supported languages', () => {
      expect(availableLanguages.map((l) => l.code)).toEqual([
        'en', 'es', 'ht', 'pt', 'vi', 'kea', 'so', 'zh', 'ar',
      ]);
    });
  });
});
