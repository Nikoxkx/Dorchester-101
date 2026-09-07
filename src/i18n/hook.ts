'use client';

import { useCallback, useMemo } from 'react';
import { dictionaries } from './index';
import { makeTranslator, pick, type Localized, type PickResult } from './runtime';
import { languageMeta, isRtl, type LanguageMeta } from './config';
import type { TranslationKey } from './en';
import * as fmt from './formatters';
import { useAppStore, type Language } from '@/stores/appStore';

export interface I18n {
  lang: Language;
  meta: LanguageMeta;
  dir: 'ltr' | 'rtl';
  /** t(key, tokens?) — typed against the English key set. */
  t: <K extends TranslationKey>(key: K, tokens?: Record<string, string | number>) => string;
  /** t or translate raw content: never silently pretends a fallback happened. */
  pickContent: <T>(record: Localized<T>) => PickResult<T>;
  format: {
    number: (v: number) => string;
    decimal: (v: number, digits?: number) => string;
    currency: (v: number, opts?: { cents?: boolean }) => string;
    /** `v` is a fraction: `percent(0.635, 1)` → "63.5%". */
    percent: (v: number, digits?: number) => string;
    date: (v: string | number | Date, style?: 'short' | 'medium' | 'long') => string;
    time: (v: string | number | Date) => string;
    clock: (d: Date) => string;
    weekday: (d: Date, style?: 'long' | 'short') => string;
    relative: (v: string | number | Date) => string;
    minutesAway: (departureIso: string) => number;
  };
}

/**
 * Primary entry point. Reads the language from the store, so a single
 * `setLanguage` call re-renders every component that consumes it, and the
 * memoised formatter closes over the same locale. No component has to thread
 * a language prop or keep its own `en-US` string.
 */
export function useI18n(): I18n {
  const lang = useAppStore((s) => s.language);
  const meta = languageMeta(lang);
  const t = useMemo(() => makeTranslator(dictionaries[lang] ?? dictionaries.en, lang), [lang]);
  const pickContent = useCallback(<T,>(record: Localized<T>) => pick(record, lang), [lang]);

  const format = useMemo<I18n['format']>(
    () => ({
      number: (v) => fmt.formatNumber(v, lang),
      decimal: (v, digits) => fmt.formatDecimal(v, lang, digits),
      currency: (v, opts) => fmt.formatCurrency(v, lang, opts),
      percent: (v, digits) => fmt.formatPercent(v, lang, digits),
      date: (v, style) => fmt.formatDate(v, lang, style),
      time: (v) => fmt.formatTime(v, lang),
      clock: (d) => fmt.formatClock(d, lang),
      weekday: (d, style) => fmt.formatWeekday(d, lang, style),
      relative: (v) => fmt.formatRelativeTime(v, lang),
      minutesAway: (iso) => fmt.arrivalMinutes(iso),
    }),
    [lang]
  );

  return { lang, meta, dir: isRtl(lang) ? 'rtl' : 'ltr', t, pickContent, format };
}

/**
 * Back-compatible form used by pages written before the provider existed.
 * Pass nothing to follow the app language, or a code to translate against a
 * specific locale (used by tests).
 */
export function useTranslation(code?: Language): { t: I18n['t']; lang: Language } {
  const storeLang = useAppStore((s) => s.language);
  const lang = code ?? storeLang;
  const t = useMemo(() => makeTranslator(dictionaries[lang] ?? dictionaries.en, lang), [lang]);
  return { t, lang };
}

export type { TranslationKey };
