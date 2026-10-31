import type { TranslationKey } from './en';

const LANGUAGE_KEYS: Record<string, TranslationKey> = {
  en: 'spoken.english', es: 'spoken.spanish', ht: 'spoken.haitian', pt: 'spoken.portuguese',
  vi: 'spoken.vietnamese', zh: 'spoken.chinese', ar: 'spoken.arabic', so: 'spoken.somali',
  kea: 'spoken.capeVerdean',
};

/** A code from a feed may be unknown; never misidentify it as English. */
export function newsLanguageName(code: string, t: (key: TranslationKey) => string): string | null {
  const key = LANGUAGE_KEYS[code.toLowerCase().split('-')[0]];
  return key ? t(key) : null;
}
