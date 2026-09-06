import { describe, it, expect } from 'vitest';
import { translations, useTranslation, availableLanguages } from '@/lib/i18n';

describe('i18n', () => {
  describe('translations object', () => {
    it('should have translations for all supported languages', () => {
      availableLanguages.forEach(lang => {
        expect(translations[lang.code]).toBeDefined();
      });
    });

    it('should have all required navigation keys', () => {
      const requiredNavKeys = [
        'nav.dashboard', 'nav.projects', 'nav.affordable', 'nav.market',
        'nav.map', 'nav.food', 'nav.neighborhood', 'nav.tools',
        'nav.news', 'nav.resources', 'nav.faq', 'nav.settings'
      ];

      Object.entries(translations).forEach(([langCode, dict]) => {
        requiredNavKeys.forEach(key => {
          expect(dict[key as keyof typeof dict]).toBeDefined();
        });
      });
    });

    it('should have projects translations', () => {
      const requiredProjectsKeys = [
        'projects.title', 'projects.description', 'projects.totalProjects',
        'projects.totalUnits', 'projects.affordableUnits', 'projects.underConstruction'
      ];

      Object.entries(translations).forEach(([langCode, dict]) => {
        requiredProjectsKeys.forEach(key => {
          expect(dict[key as keyof typeof dict]).toBeDefined();
        });
      });
    });
  });

  describe('useTranslation hook', () => {
    it('should return translation function', () => {
      const { t } = useTranslation('en');
      expect(typeof t).toBe('function');
    });

    it('should return translation for valid key', () => {
      const { t } = useTranslation('en');
      expect(t('nav.dashboard')).toBe('Dashboard');
    });

    it('should return fallback for missing key', () => {
      const { t } = useTranslation('en');
      expect(t('nonexistent.key', 'fallback text')).toBe('fallback text');
    });

    it('should fall back to English for unknown language', () => {
      const { t } = useTranslation('unknown-language');
      expect(t('nav.dashboard')).toBe('Dashboard');
    });

    it('should return Spanish translation for es locale', () => {
      const { t } = useTranslation('es');
      expect(t('nav.dashboard')).toBe('Inicio');
    });
  });

  describe('availableLanguages', () => {
    it('should have 9 languages', () => {
      expect(availableLanguages).toHaveLength(9);
    });

    it('should include English', () => {
      const english = availableLanguages.find(l => l.code === 'en');
      expect(english).toBeDefined();
      expect(english?.name).toBe('English');
    });

    it('should include Spanish', () => {
      const spanish = availableLanguages.find(l => l.code === 'es');
      expect(spanish).toBeDefined();
      expect(spanish?.name).toBe('Spanish');
    });

    it('should have nativeName for all languages', () => {
      availableLanguages.forEach(lang => {
        expect(lang.nativeName).toBeDefined();
        expect(lang.nativeName.length).toBeGreaterThan(0);
      });
    });

    it('should have flag for all languages', () => {
      availableLanguages.forEach(lang => {
        expect(lang.flag).toBeDefined();
        expect(lang.flag.length).toBeGreaterThan(0);
      });
    });
  });
});

describe('Translation Coverage', () => {
  const requiredKeys = [
    'nav.dashboard', 'nav.projects', 'nav.affordable', 'nav.market',
    'nav.map', 'nav.food', 'nav.neighborhood', 'nav.tools',
    'nav.news', 'nav.resources', 'nav.faq', 'nav.settings',
    'intro.title', 'intro.body', 'intro.cta',
    'dashboard.welcome', 'dashboard.tagline', 'dashboard.glance',
    'stats.medianRent', 'stats.incomeRestricted', 'stats.activeProjects',
    'projects.title', 'projects.description', 'projects.totalProjects',
    'projects.totalUnits', 'projects.affordableUnits', 'projects.underConstruction',
    'resources.title', 'resources.description', 'resources.notSure',
    'faq.title', 'faq.description', 'faq.searchPlaceholder',
    'settings.title', 'settings.language', 'settings.theme',
  ];

  availableLanguages.forEach(lang => {
    describe(`${lang.name} (${lang.code})`, () => {
      requiredKeys.forEach(key => {
        it(`should have translation for ${key}`, () => {
          const dict = translations[lang.code];
          expect(dict[key as keyof typeof dict]).toBeDefined();
        });
      });
    });
  });
});