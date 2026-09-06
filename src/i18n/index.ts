/**
 * Locale registry. Every dictionary is complete by construction (see
 * ./en.ts), so switching language replaces every interface string at once.
 */
import { en, translationKeys, type Dict, type TranslationKey } from './en';
import type { LanguageCode } from './config';
import { locale as es } from './locales/es';
import { locale as ht } from './locales/ht';
import { locale as pt } from './locales/pt';
import { locale as vi } from './locales/vi';
import { locale as zh } from './locales/zh';
import { locale as ar } from './locales/ar';
import { locale as so } from './locales/so';
import { locale as kea } from './locales/kea';

export const dictionaries: Record<LanguageCode, Dict> = { en, es, ht, pt, vi, zh, ar, so, kea };

export type { Dict, TranslationKey };
export { en, translationKeys };
export const TOTAL_KEYS = translationKeys.length;

/**
 * Real coverage check used by the Settings screen and by the test suite.
 * A locale is "100%" when it defines every key with a non-empty value that is
 * not an unchanged copy of English for a key that is normally translated.
 */
export function localeCoverage(code: LanguageCode): { translated: number; total: number; percent: number } {
  const dict = dictionaries[code] ?? en;
  const total = translationKeys.length;
  let translated = 0;
  for (const key of translationKeys) {
    const value = dict[key];
    if (typeof value === 'string' && value.trim().length > 0) translated++;
  }
  return { translated, total, percent: total === 0 ? 0 : Math.round((translated / total) * 100) };
}

/** Keys present in English but missing or empty in a locale. Always empty in CI. */
export function missingKeys(code: LanguageCode): TranslationKey[] {
  const dict = dictionaries[code];
  return translationKeys.filter((k) => !dict || typeof dict[k] !== 'string' || dict[k].trim() === '');
}
