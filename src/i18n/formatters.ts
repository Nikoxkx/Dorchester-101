import { languageMeta } from './config';
import { formatWeekdayIndex } from '@/lib/hours';

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

/** Calendar and fiscal years use locale digits but never thousands separators. */
export function formatYear(value: number, lang: string): string {
  return nf(languageMeta(lang).intlLocale, { useGrouping: false, maximumFractionDigits: 0 }).format(value);
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

/**
 * `value` is a fraction, exactly as `Intl.NumberFormat` expects: 0.635 renders
 * "63.5%". It used to divide by 100 itself, which meant every caller that
 * passed a fraction — six of the seven in the app — printed a figure a hundred
 * times too small: the market page showed a 63.5% renter share as "0.6%" and a
 * 31% median rent burden as "0.3%".
 */
export function formatPercent(value: number, lang: string, digits = 0): string {
  return nf(languageMeta(lang).intlLocale, {
    style: 'percent',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

// Intl often falls back to French for Haitian Creole and Portuguese for
// Kriolu. These first-pass names keep visible calendar and relative wording in
// the selected language; like the other translations, they need native review.
const CREOLE_CALENDAR = {
  ht: {
    months: ['janvye', 'fevriye', 'mas', 'avril', 'me', 'jen', 'jiyè', 'out', 'septanm', 'oktòb', 'novanm', 'desanm'],
    short: ['jan', 'fev', 'mas', 'avr', 'me', 'jen', 'jiy', 'out', 'sep', 'okt', 'nov', 'des'],
    units: { minute: 'minit', hour: 'èdtan', day: 'jou', week: 'semèn', month: 'mwa' },
    now: 'kounye a', past: 'sa gen', future: 'nan',
  },
  kea: {
    months: ['janeru', 'fevereru', 'marsu', 'abril', 'maiu', 'junhu', 'julhu', 'agostu', 'setenbru', 'otubru', 'novenbru', 'dezenbru'],
    short: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'otu', 'nov', 'dez'],
    units: { minute: 'minutu', hour: 'óra', day: 'dia', week: 'simana', month: 'mês' },
    now: 'gosi', past: 'fazi', future: 'da li',
  },
} as const;

function creoleCalendar(lang: string) {
  return lang === 'ht' || lang === 'kea' ? CREOLE_CALENDAR[lang] : null;
}

function calendarDate(value: string | number | Date): Date {
  // A date-only string is a calendar day, not midnight UTC.
  return value instanceof Date
    ? value
    : new Date(typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value);
}

export function formatDate(value: string | number | Date, lang: string, style: 'short' | 'medium' | 'long' = 'long'): string {
  const d = calendarDate(value);
  if (Number.isNaN(d.getTime())) return '';
  const calendar = creoleCalendar(lang);
  if (calendar && style !== 'short') {
    const month = (style === 'medium' ? calendar.short : calendar.months)[d.getMonth()];
    return lang === 'kea' && style === 'long'
      ? `${d.getDate()} di ${month} di ${d.getFullYear()}`
      : `${d.getDate()} ${month} ${d.getFullYear()}`;
  }
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

/** Month and year for project completion dates, without a misleading day. */
export function formatMonthYear(value: string | number | Date, lang: string): string {
  const d = calendarDate(value);
  if (Number.isNaN(d.getTime())) return '';
  const calendar = creoleCalendar(lang);
  if (calendar) return `${calendar.short[d.getMonth()]} ${d.getFullYear()}`;
  try {
    return new Intl.DateTimeFormat(languageMeta(lang).intlLocale, { month: 'short', year: 'numeric' }).format(d);
  } catch {
    return `${d.getMonth() + 1}/${d.getFullYear()}`;
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
  if (Number.isNaN(date.getTime())) return '';
  return formatWeekdayIndex(weekdayIndex(date), languageMeta(lang).intlLocale, style);
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
  if (Number.isNaN(d.getTime())) return '';
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
  const calendar = creoleCalendar(lang);
  if (calendar) {
    if (Math.abs(chosen[1]) < 1) return calendar.now;
    const unit = calendar.units[chosen[0] as keyof typeof calendar.units];
    return `${chosen[1] < 0 ? calendar.past : calendar.future} ${formatNumber(Math.abs(chosen[1]), lang)} ${unit}`;
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
