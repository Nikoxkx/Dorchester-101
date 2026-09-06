import { languageMeta } from './config';

/**
 * Locale-aware formatting. Every number, currency, date and clock reading in
 * the app comes through here, so Arabic numerals, Vietnamese date order and
 * Brazilian currency grouping are all correct without any component having to
 * remember to pass a locale.
 */

const cache = new Map<string, Intl.NumberFormat>();

function nf(locale: string, options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = locale + JSON.stringify(options);
  let f = cache.get(key);
  if (!f) {
    f = new Intl.NumberFormat(locale, options);
    cache.set(key, f);
  }
  return f;
}

export function formatNumber(value: number, lang: string): string {
  return nf(languageMeta(lang).intlLocale, { maximumFractionDigits: 0 }).format(value);
}

export function formatDecimal(value: number, lang: string, digits = 1): string {
  return nf(languageMeta(lang).intlLocale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatCurrency(value: number, lang: string, opts: { cents?: boolean } = {}): string {
  return nf(languageMeta(lang).intlLocale, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: opts.cents ? 2 : 0,
    maximumFractionDigits: opts.cents ? 2 : 0,
  }).format(value);
}

export function formatPercent(value: number, lang: string, digits = 0): string {
  return nf(languageMeta(lang).intlLocale, {
    style: 'percent',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value / 100);
}

export function formatDate(value: string | number | Date, lang: string, style: 'short' | 'medium' | 'long' = 'long'): string {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const options: Intl.DateTimeFormatOptions =
    style === 'short'
      ? { month: 'numeric', day: 'numeric' }
      : style === 'medium'
        ? { year: 'numeric', month: 'short', day: 'numeric' }
        : { year: 'numeric', month: 'long', day: 'numeric' };
  try {
    return new Intl.DateTimeFormat(languageMeta(lang).intlLocale, options).format(d);
  } catch {
    return d.toDateString();
  }
}

export function formatTime(value: string | number | Date, lang: string): string {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  try {
    return new Intl.DateTimeFormat(languageMeta(lang).intlLocale, {
      hour: 'numeric',
      minute: '2-digit',
    }).format(d);
  } catch {
    return d.toLocaleTimeString();
  }
}

export function formatClock(date: Date, lang: string): string {
  try {
    return new Intl.DateTimeFormat(languageMeta(lang).intlLocale, {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  } catch {
    return date.toLocaleTimeString();
  }
}

export function formatWeekday(date: Date, lang: string, style: 'long' | 'short' = 'long'): string {
  try {
    return new Intl.DateTimeFormat(languageMeta(lang).intlLocale, { weekday: style }).format(date);
  } catch {
    return date.toDateString();
  }
}

/** ISO weekday index where Monday is 0. Leaflet and the hours parser agree on it. */
export function weekdayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

/**
 * Relative time for feeds and refresh stamps. Uses Intl.RelativeTimeFormat
 * rather than string concatenation so the preposition and the numeral agree
 * with the language.
 */
export function formatRelativeTime(value: string | number | Date, lang: string): string {
  const d = value instanceof Date ? value : new Date(value);
  const diffMs = d.getTime() - Date.now();
  const abs = Math.abs(diffMs);
  const rtfLocale = languageMeta(lang).intlLocale;
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['minute', 60_000],
    ['hour', 3_600_000],
    ['day', 86_400_000],
    ['week', 604_800_000],
    ['month', 2_592_000_000],
  ];
  let chosen: [Intl.RelativeTimeFormatUnit, number] = ['minute', Math.round(diffMs / 60_000)];
  for (const [unit, ms] of units) {
    if (abs >= ms) chosen = [unit, Math.round(diffMs / ms)];
  }
  if (Math.abs(chosen[1]) < 1) return new Intl.RelativeTimeFormat(rtfLocale, { style: 'narrow' }).format(0, 'minute');
  try {
    return new Intl.RelativeTimeFormat(rtfLocale, { style: 'narrow' }).format(chosen[1], chosen[0]);
  } catch {
    return chosen[1] < 0 ? `${-chosen[1]} ${chosen[0]} ago` : `in ${chosen[1]} ${chosen[0]}`;
  }
}

/** Minutes until an arrival, rounded the way transit riders read it. */
export function arrivalMinutes(departureIso: string, now = new Date()): number {
  const t = new Date(departureIso).getTime();
  if (Number.isNaN(t)) return Infinity;
  return Math.max(0, Math.round((t - now.getTime()) / 60_000));
}
