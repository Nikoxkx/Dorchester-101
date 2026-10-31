import type { WinterClothingPlace } from '@/data/winterClothing';
import { CLOTHING_SPANISH, type ClothingSpanishDetails } from '@/data/winterClothing.es';
import { CLOTHING_SUMMARIES } from '@/data/winterClothing.summaries';
import { CLOTHING_LOCATOR_DETAILS } from '@/data/winterClothing.locators';
import { CLOTHING_PLACE_DETAILS } from '@/data/winterClothing.places';
import { pick } from './runtime';
import type { LanguageCode } from './config';

/** Keep the single directory record authoritative; translated prose is an overlay. */
export function clothingContent(place: WinterClothingPlace, language: LanguageCode) {
  const details: Partial<ClothingSpanishDetails> | undefined = language === 'es'
    ? CLOTHING_SPANISH[place.id]
    : language !== 'en' ? CLOTHING_PLACE_DETAILS[language]?.[place.id] ?? CLOTHING_LOCATOR_DETAILS[language]?.[place.id] : undefined;
  const summary = pick(place.summary, language);
  const translatedSummary = language !== 'en' && language !== 'es' ? CLOTHING_SUMMARIES[language]?.[place.id] : undefined;
  function field(source: string | undefined, translated: string | undefined) {
    const used: LanguageCode = language !== 'en' && translated !== undefined ? language : 'en';
    return { value: used === 'en' ? source : translated, used, fellBack: language !== 'en' && Boolean(source) && used === 'en' };
  }
  const name = field(place.name, details?.name);
  const neighborhood = field(place.neighborhood, details?.neighborhood);
  const address = field(place.address, details?.address);
  const howToGet = field(place.howToGet, details?.howToGet);
  const eligibility = field(place.eligibility, details?.eligibility);
  const hoursNote = field(place.hoursNote, details?.hoursNote);
  const transit = field(place.transit, details?.transit);
  const summaryLanguage = details?.summary ? language : translatedSummary ? language : summary.used;
  return {
    name: name.value!, nameLanguage: name.used,
    neighborhood: neighborhood.value!, neighborhoodLanguage: neighborhood.used,
    address: address.value, addressLanguage: address.used,
    summary: details?.summary ?? translatedSummary ?? summary.value,
    summaryLanguage,
    howToGet: howToGet.value!, howToGetLanguage: howToGet.used,
    eligibility: eligibility.value, eligibilityLanguage: eligibility.used,
    hoursNote: hoursNote.value, hoursNoteLanguage: hoursNote.used,
    transit: transit.value, transitLanguage: transit.used,
    // Proper names and street addresses may remain unchanged. Instructions and
    // eligibility are never silently presented as translated when absent.
    fellBack: (language !== 'en' && summaryLanguage === 'en') || howToGet.fellBack || eligibility.fellBack || hoursNote.fellBack || transit.fellBack,
  };
}
