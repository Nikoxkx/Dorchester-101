'use client';

import { en, type TranslationKey } from './en';
import { es } from './es';
import { ht } from './ht';
import { pt } from './pt';
import { vi } from './vi';
import { kea } from './kea';
import { so } from './so';
import { zh } from './zh';
import { ar } from './ar';

/**
 * Translation system.
 *
 * · `en` is canonical; every other dictionary is `Record<TranslationKey, string>`
 *   → the compiler refuses to build if any language is missing a key.
 * · `t(key, vars)` interpolates `{name}`-style placeholders.
 * · `formatFor(language)` returns Intl helpers with locale-correct numbers,
 *   dates, and currency — no hardcoded en-US anywhere.
 */

export type { TranslationKey };

export const translations: Record<string, Record<TranslationKey, string>> = {
  en,
  es,
  ht,
  pt,
  vi,
  kea,
  so,
  zh,
  ar,
};

export const availableLanguages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'ht', name: 'Haitian Creole', nativeName: 'Kreyòl Ayisyen' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'kea', name: 'Cape Verdean Creole', nativeName: 'Kriolu' },
  { code: 'so', name: 'Somali', nativeName: 'Soomaali' },
  { code: 'zh', name: 'Mandarin Chinese', nativeName: '普通话' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', rtl: true },
] as const;

export type TranslationVars = Record<string, string | number>;

export function useTranslation(language: string) {
  const dict = translations[language] ?? en;

  const t = (key: TranslationKey, vars?: TranslationVars): string => {
    let out: string = dict[key] ?? en[key] ?? key;
    if (vars) {
      for (const [name, value] of Object.entries(vars)) {
        out = out.replaceAll(`{${name}}`, String(value));
      }
    }
    return out;
  };

  return { t, language, formatFor: formatFor(language) };
}

export function isRtl(language: string): boolean {
  return language === 'ar';
}

/** BCP-47 locale for Intl formatting per UI language. */
export function localeFor(language: string): string {
  switch (language) {
    case 'es': return 'es-419'; // Latin American Spanish — the Dorchester variety
    case 'ht': return 'ht-HT';
    case 'pt': return 'pt-BR';
    case 'vi': return 'vi-VN';
    case 'kea': return 'pt-CV'; // closest Intl locale for Kriolu
    case 'so': return 'so-SO';
    case 'zh': return 'zh-CN';
    case 'ar': return 'ar-EG';
    default: return 'en-US';
  }
}

/** Locale-correct formatters. Currency stays USD — this is Boston. */
export function formatFor(language: string) {
  const locale = localeFor(language);
  return {
    locale,
    currency: (n: number) =>
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(n),
    number: (n: number) => new Intl.NumberFormat(locale).format(n),
    percent: (n: number) => new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 1 }).format(n),
    date: (d: Date | string, opts?: Intl.DateTimeFormatOptions) =>
      new Intl.DateTimeFormat(locale, opts ?? { year: 'numeric', month: 'long', day: 'numeric' }).format(
        typeof d === 'string' ? new Date(d) : d,
      ),
    relative: (d: Date | string) => {
      const date = typeof d === 'string' ? new Date(d) : d;
      const diff = date.getTime() - Date.now();
      const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
      const abs = Math.abs(diff);
      if (abs < 60_000) return rtf.format(Math.round(diff / 1000), 'second');
      if (abs < 3_600_000) return rtf.format(Math.round(diff / 60_000), 'minute');
      if (abs < 86_400_000) return rtf.format(Math.round(diff / 3_600_000), 'hour');
      if (abs < 604_800_000) return rtf.format(Math.round(diff / 86_400_000), 'day');
      return new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }).format(date);
    },
  };
}
