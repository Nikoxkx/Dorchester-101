import type { LanguageCode } from './config';
import type { TranslationKey } from './en';

type Translate = (key: TranslationKey, tokens?: Record<string, string | number>) => string;
export interface WindText { text: string; language: LanguageCode }

const DIRECTIONS: Record<string, TranslationKey> = {
  N: 'weather.direction.N', NNE: 'weather.direction.NNE', NE: 'weather.direction.NE', ENE: 'weather.direction.ENE',
  E: 'weather.direction.E', ESE: 'weather.direction.ESE', SE: 'weather.direction.SE', SSE: 'weather.direction.SSE',
  S: 'weather.direction.S', SSW: 'weather.direction.SSW', SW: 'weather.direction.SW', WSW: 'weather.direction.WSW',
  W: 'weather.direction.W', WNW: 'weather.direction.WNW', NW: 'weather.direction.NW', NNW: 'weather.direction.NNW',
};

/** Translate a recognized meteorological *from* direction, never guessing unknown source wording. */
export function localizeWindDirection(raw: string | null, language: LanguageCode, t: Translate): WindText | null {
  if (!raw?.trim()) return null;
  const key = DIRECTIONS[raw.trim().toUpperCase()];
  return key
    ? { text: t('weather.windFrom', { direction: t(key) }), language }
    : { text: raw, language: 'en' };
}

/**
 * NWS uses values such as "5 mph" and "5 to 10 mph". Only convert exact,
 * unambiguous whole-number forms; preserve gusts, qualifiers, decimals, other
 * units and future publisher formats unchanged rather than changing meaning.
 */
export function localizeWindSpeed(
  raw: string,
  language: LanguageCode,
  t: Translate,
  number: (value: number) => string,
): WindText | null {
  const text = raw.trim();
  if (!text) return null;
  if (/^calm$/i.test(text)) return { text: t('weather.windCalm'), language };
  const match = /^(\d+)\s*(?:(?:to|-|–)\s*(\d+)\s*)?mph$/i.exec(text);
  if (!match) return { text: raw, language: 'en' };
  const low = Number(match[1]);
  const high = match[2] === undefined ? undefined : Number(match[2]);
  if (!Number.isSafeInteger(low) || (high !== undefined && !Number.isSafeInteger(high))) return { text: raw, language: 'en' };
  const speed = high === undefined ? number(low) : `${number(low)}–${number(high)}`;
  return { text: t('weather.windMph', { speed }), language };
}
