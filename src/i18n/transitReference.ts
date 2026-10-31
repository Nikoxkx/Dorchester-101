import type { TransitLine, BusRouteRef } from '@/data/transit';
import type { LanguageCode } from './config';
import type { TranslationKey } from './en';
import { dictionaries } from './index';
import { makeTranslator } from './runtime';

/** Source-checked reference text only. Never apply these transformations to
 * live alerts, headsigns, or unrecognized provider text. Those need an honest
 * English fallback because directions and service changes are safety-sensitive. */
export interface ReferenceText { value: string; used: LanguageCode; fellBack: boolean }

function original(value: string, lang: LanguageCode): ReferenceText {
  return { value, used: 'en', fellBack: lang !== 'en' };
}
function translated(value: string, lang: LanguageCode): ReferenceText {
  return { value, used: lang, fellBack: false };
}

const LINES: Record<string, { source: string; key: TranslationKey }> = {
  'red-ashmont': { source: 'Red Line, Ashmont branch', key: 'map.ref.redAshmont' },
  'red-braintree': { source: 'Red Line, Braintree branch', key: 'map.ref.redBraintree' },
  mattapan: { source: 'Mattapan Line', key: 'neighborhoodTransit.mattTitle' },
  fairmount: { source: 'Fairmount Line', key: 'neighborhoodTransit.fairTitle' },
};

/** Preserve the English source if it changes before its draft can be reviewed. */
export function referenceLineName(line: Pick<TransitLine, 'id' | 'name'>, lang: LanguageCode): ReferenceText {
  const entry = LINES[line.id];
  if (!entry || entry.source !== line.name) return original(line.name, lang);
  return translated(lang === 'en' ? line.name : dictionaries[lang][entry.key], lang);
}

/** Translate only the known connections in the static station dataset. */
export function referenceConnection(value: string, lang: LanguageCode): ReferenceText {
  if (lang === 'en') return original(value, lang);
  const d = dictionaries[lang];
  const bus = value.match(/^Bus (\d+(?:, \d+)*)$/);
  if (bus) return translated(`${d['map.line.bus']} ${bus[1]}`, lang);
  if (value === 'Commuter Rail') return translated(d['map.line.rail'], lang);
  if (value === 'Commuter Rail: Greenbush, Kingston, Fall River/New Bedford') {
    return translated(`${d['map.line.rail']}: Greenbush, Kingston, Fall River/New Bedford`, lang);
  }
  if (value === 'Red Line') return translated(d['neighborhoodTransit.redTitle'], lang);
  if (value === 'Ashmont branch') return translated(d['map.ref.redAshmont'], lang);
  if (value === 'Mattapan Line') return translated(d['neighborhoodTransit.mattTitle'], lang);
  if (value === 'Franklin/Foxboro Line') return translated(d['map.ref.franklin'], lang);
  return original(value, lang);
}

// Each English reference has been reviewed with the structured formatter below.
// An edited/new provider name falls back, rather than parsing a changed route as
// though it were a known instruction. Stops/street names remain proper names.
const BUS_SOURCES: Record<string, string> = {
  "7": "City Point - Otis Street & Summer Street",
  "9": "City Point - Copley Square",
  "10": "City Point - Arlington Station",
  "11": "City Point - Chauncy Street & Summer Street",
  "14": "Roslindale Square - Heath Street",
  "16": "Forest Hills Station - Andrew Station or Harbor Point",
  "17": "Fields Corner Station - Andrew Station",
  "18": "Ashmont Station - Andrew Station",
  "23": "Ashmont Station - Ruggles Station via Washington Street",
  "24": "Wakefield Avenue & Truman Parkway - Ashmont Station",
  "26": "Ashmont Station - Norfolk Street Loop",
  "28": "Mattapan Station - Ruggles Station",
  "29": "Mattapan Station - Jackson Square Station",
  "41": "Centre Street & Eliot Street - JFK/UMass Station",
  "45": "Franklin Park - Ruggles Station",
  "47": "Central Square, Cambridge - Broadway Station",
  "51": "Reservoir Station - Forest Hills Station",
  "57": "Watertown Yard - Kenmore Station",
  "65": "Brighton Center - Ruggles Station",
  "66": "Harvard Square - Nubian Station",
  "68": "Harvard Square - Kendall/MIT Station",
  "215": "Quincy Center Station - Ashmont Station via West Quincy",
  "217": "Quincy Center Station - Ashmont Station",
  "240": "Avon Square - Ashmont Station"
};

/** Localize station, alternative, via, and loop wording in approved bus names. */
export function referenceBusName(route: Pick<BusRouteRef, 'id' | 'longName'>, lang: LanguageCode): ReferenceText {
  if (lang === 'en') return original(route.longName, lang);
  if (BUS_SOURCES[route.id] !== route.longName) return original(route.longName, lang);
  const t = makeTranslator(dictionaries[lang], lang);
  const viaParts = route.longName.split(' via ');
  const endpoints = viaParts[0].split(' - ');
  if (viaParts.length > 2 || endpoints.length !== 2) return original(route.longName, lang);
  const name = (text: string) => text.endsWith(' Station')
    ? t('map.stationName', { name: text.slice(0, -' Station'.length) })
    : text;
  const from = name(endpoints[0]);
  const choices = endpoints[1].split(' or ');
  if (choices.length > 2 || (choices.length > 1 && viaParts.length > 1)) return original(route.longName, lang);
  if (choices.length === 2) {
    return translated(t('neighborhoodTransit.routeAlternative', { from, to: name(choices[0]), alternate: name(choices[1]) }), lang);
  }
  if (viaParts.length === 2) {
    return translated(t('neighborhoodTransit.routeVia', { from, to: name(choices[0]), via: viaParts[1] }), lang);
  }
  if (choices[0].endsWith(' Loop')) {
    return translated(t('neighborhoodTransit.routeLoop', { from, to: name(choices[0].slice(0, -' Loop'.length)) }), lang);
  }
  return translated(`${from} – ${name(choices[0])}`, lang);
}

const CAPTIONS: Record<string, TranslationKey> = {
  'place-fldcr': 'map.photo.fields',
  'place-asmnl': 'map.photo.ashmont',
  'place-DB-2249': 'map.photo.fourCorners',
  'place-shmnl': 'map.photo.savinHill',
  'place-smmnl': 'map.photo.shawmut',
};

/** Captions are linked to their exact English source, not the photo filename. */
export function stationCaption(stopId: string, source: string, lang: LanguageCode): ReferenceText {
  const key = CAPTIONS[stopId];
  if (!key || dictionaries.en[key] !== source) return original(source, lang);
  return translated(dictionaries[lang][key], lang);
}

const DIRECTION_KEYS: Record<string, TranslationKey> = {
  inbound: 'map.heading.inbound',
  outbound: 'map.heading.outbound',
  northbound: 'map.heading.northbound',
  southbound: 'map.heading.southbound',
  eastbound: 'map.heading.eastbound',
  westbound: 'map.heading.westbound',
};

/** Exact direction words are safe to translate. Arbitrary MBTA headsigns can
 * contain route changes or instructions: keep them intact and disclose English. */
export function arrivalHeading(
  arrival: { headsign?: string | null; direction?: string | null },
  lang: LanguageCode,
): ReferenceText {
  const value = arrival.headsign?.trim() || arrival.direction?.trim() || '';
  if (!value) return translated(dictionaries[lang]['map.heading.missing'], lang);
  const key = DIRECTION_KEYS[value.toLowerCase()];
  return key ? translated(dictionaries[lang][key], lang) : original(value, lang);
}
