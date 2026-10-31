import { languageMeta, type LanguageCode } from './config';
import type { TranslationKey } from './en';
import { formatWeekdayIndex } from '@/lib/hours';

const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const FIXED = new Map<string, TranslationKey>([
  ['today', 'weather.today'], ['tonight', 'weather.tonight'],
  ['this morning', 'weather.thisMorning'], ['this afternoon', 'weather.thisAfternoon'],
  ['overnight', 'weather.overnight'],
]);

/**
 * NWS period names are short, conventional labels, not free-form forecasts.
 * Translate recognized names without inferring a date or changing weather
 * details. Unrecognized publisher labels remain English and are marked so.
 */
export function translateWeatherPeriod(
  name: string,
  language: LanguageCode,
  t: (key: TranslationKey, tokens?: Record<string, string | number>) => string,
): { text: string; language: string } {
  const normalized = name.trim().replace(/\s+/g, ' ').toLowerCase();
  const fixed = FIXED.get(normalized);
  if (fixed) return { text: t(fixed), language };
  const match = /^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)( night)?$/.exec(normalized);
  if (match) {
    const index = WEEKDAYS.indexOf(match[1]);
    const day = formatWeekdayIndex(index, languageMeta(language).intlLocale);
    return { text: match[2] ? t('weather.periodNight', { day }) : day, language };
  }
  return { text: name, language: 'en' };
}
