/**
 * Language registry.
 *
 * Flags are deliberately absent. Two reasons, both practical rather than
 * stylistic:
 *   1. A language is not a country. Kreyòl is Haitian *and* Dominican,
 *      Portuguese is Brazilian, Cape Verdean and Portuguese, Arabic is
 *      Somali, Yemeni, Lebanese. A flag answers a question nobody asked and
 *      often answers it wrong.
 *   2. Flag emoji are regional-indicator pairs. Windows (our desktop target)
 *      does not render them as flags, it renders the bare letters "HT" and
 *      "PT", so the picker degrades into noise for exactly the residents
 *      installing the .exe.
 * Instead each language shows its own name in its own script plus an ISO
 * code chip, which is what Boston.gov and the MA state portals do.
 */

export type LanguageCode = 'en' | 'es' | 'ht' | 'pt' | 'vi' | 'zh' | 'ar' | 'so' | 'kea';

export interface LanguageMeta {
  code: LanguageCode;
  /** English name, used in language lists shown to English readers. */
  name: string;
  /** Name in the language itself. This is what the UI labels the locale with. */
  nativeName: string;
  /** Short code chip (ISO 639 where it reads well). */
  code2: string;
  /** BCP-47 tag handed to Intl and to <html lang>. */
  intlLocale: string;
  dir: 'ltr' | 'rtl';
  /** Google Fonts subset we must load for this script to render properly. */
  fontSet: 'latin' | 'cjk' | 'arabic' | 'latin-ext';
}

export const LANGUAGES: LanguageMeta[] = [
  { code: 'en',  name: 'English',            nativeName: 'English',         code2: 'EN', intlLocale: 'en-US',     dir: 'ltr', fontSet: 'latin' },
  { code: 'es',  name: 'Spanish',            nativeName: 'Español',         code2: 'ES', intlLocale: 'es-MX',     dir: 'ltr', fontSet: 'latin' },
  { code: 'ht',  name: 'Haitian Creole',     nativeName: 'Kreyòl Ayisyen',  code2: 'HT', intlLocale: 'fr-HT',     dir: 'ltr', fontSet: 'latin-ext' },
  { code: 'pt',  name: 'Portuguese',         nativeName: 'Português',       code2: 'PT', intlLocale: 'pt-BR',     dir: 'ltr', fontSet: 'latin-ext' },
  { code: 'vi',  name: 'Vietnamese',         nativeName: 'Tiếng Việt',      code2: 'VI', intlLocale: 'vi-VN',     dir: 'ltr', fontSet: 'latin-ext' },
  { code: 'kea', name: 'Cape Verdean Creole', nativeName: 'Kriolu',          code2: 'KV', intlLocale: 'pt-CV',    dir: 'ltr', fontSet: 'latin-ext' },
  { code: 'so',  name: 'Somali',             nativeName: 'Afgan Soomaali',  code2: 'SO', intlLocale: 'so-SO',     dir: 'ltr', fontSet: 'latin' },
  { code: 'zh',  name: 'Mandarin Chinese',   nativeName: '中文',             code2: '中',  intlLocale: 'zh-Hans-CN', dir: 'ltr', fontSet: 'cjk' },
  { code: 'ar',  name: 'Arabic',             nativeName: 'العربية',          code2: 'ع',  intlLocale: 'ar',       dir: 'rtl', fontSet: 'arabic' },
];

export const LANGUAGE_MAP = new Map(LANGUAGES.map((l) => [l.code, l]));

export function languageMeta(code: string): LanguageMeta {
  return LANGUAGE_MAP.get(code as LanguageCode) ?? LANGUAGE_MAP.get('en')!;
}

export function isRtl(code: string): boolean {
  return languageMeta(code).dir === 'rtl';
}

/**
 * Detects a usable language from the browser, mapped onto what we actually
 * ship. Falls back to English. Dorchester's own distribution is reflected in
 * the tie-break order (Spanish, then Kreyòl, then Portuguese).
 */
export function detectLanguage(preferred: readonly string[] = []): LanguageCode {
  const wanted = [...preferred];
  if (typeof navigator !== 'undefined') {
    wanted.push(
      ...(Array.isArray(navigator.languages) ? navigator.languages : []),
      navigator.language
    );
  }
  for (const raw of wanted) {
    if (!raw) continue;
    const tag = raw.toLowerCase();
    // Exact or prefix matches on our codes first.
    for (const l of LANGUAGES) {
      if (tag === l.code) return l.code;
      if (tag.startsWith(`${l.code}-`) || tag.startsWith(`${l.code}_`)) return l.code;
    }
    if (tag.startsWith('fil') || tag.startsWith('tl')) continue;
    if (tag.startsWith('zh-hant') || tag.startsWith('zh-tw')) return 'zh';
    if (tag.startsWith('fr-ht') || tag.includes('haiti')) return 'ht';
    if (tag.startsWith('pt')) return 'pt';
    if (tag.startsWith('es')) return 'es';
  }
  return 'en';
}
