import type { TranslationKey } from './en';

/** Translate descriptive language names in directory records, not proper names. */
export const SPOKEN_LANGUAGE_KEYS: Readonly<Record<string, TranslationKey>> = {
  English: 'spoken.english',
  Spanish: 'spoken.spanish',
  'Haitian Creole': 'spoken.haitian',
  Portuguese: 'spoken.portuguese',
  Vietnamese: 'spoken.vietnamese',
  Mandarin: 'spoken.mandarin',
  'Mandarin Chinese': 'spoken.mandarin',
  Cantonese: 'spoken.cantonese',
  Chinese: 'spoken.chinese',
  'Cape Verdean Creole': 'spoken.capeVerdean',
  Somali: 'spoken.somali',
  Arabic: 'spoken.arabic',
  French: 'spoken.french',
  Swahili: 'spoken.swahili',
  Amharic: 'spoken.amharic',
  'interpretation in many languages': 'spoken.many',
};

export function spokenLanguage(name: string, t: (key: TranslationKey) => string): string {
  const key = SPOKEN_LANGUAGE_KEYS[name];
  return key ? t(key) : name;
}
