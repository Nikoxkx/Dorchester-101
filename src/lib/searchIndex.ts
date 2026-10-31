/**
 * The app's own search index.
 *
 * A community site where the useful thing is a phone number has to be
 * searchable by phone number. This is a deliberately small in-process index
 * rather than a database: the corpus is a few hundred records, it is bundled
 * with the app, and it therefore works offline and in the desktop build where a
 * server may not exist at all.
 */

import { RESOURCES, isResourceMappable, type ResourceRecord } from '@/data/resources';
import { WINTER_CLOTHING, type WinterClothingPlace } from '@/data/winterClothing';
import { CLOTHING_SUMMARIES } from '@/data/winterClothing.summaries';
import { CLOTHING_SPANISH } from '@/data/winterClothing.es';
import { CLOTHING_LOCATOR_DETAILS } from '@/data/winterClothing.locators';
import { CLOTHING_PLACE_DETAILS } from '@/data/winterClothing.places';
import { clothingContent } from '@/i18n/clothingContent';
import { TRANSIT_LINES, DORCHESTER_BUS_ROUTES } from '@/data/transit';
import { PUBLIC_ROUTES } from './site';
import { dictionaries } from '@/i18n';
import type { LanguageCode } from '@/i18n/config';
import type { TranslationKey } from '@/i18n/en';
import { NAV_LABEL_KEY } from '@/i18n/pageTitles';
import { resourceDetails, resourceDetailSearchTerms } from '@/i18n/resourceDetails';
import { referenceBusName, referenceLineName } from '@/i18n/transitReference';
export { NAV_LABEL_KEY } from '@/i18n/pageTitles';

export type SearchKind = 'page' | 'organization' | 'stop' | 'route';

export interface SearchEntry {
  id: string;
  kind: SearchKind;
  title: string;
  subtitle: string;
  titleLanguage?: LanguageCode;
  subtitleLanguage?: LanguageCode;
  subtitleFellBack?: boolean;
  /** For localizing a stop's static line name without guessing from the stop id. */
  referenceLineId?: string;
  href: string;
  /** Lower-citched haystack, built once at module load. */
  haystack: string;
  category?: string;
  lat?: number;
  lng?: number;
  phone?: string;
}

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dorchester hub', subtitle: 'Start here: housing, food, transit, help' },
  '/affordable-housing': { title: 'Affordable housing', subtitle: 'Lotteries, waitlists, RAFT, subsidies' },
  '/faq': { title: 'Common questions', subtitle: 'Rights, evictions, applications' },
  '/food': { title: 'Food', subtitle: 'Pantry hours, hot meals, SNAP help' },
  '/weather': { title: 'Boston weather', subtitle: 'Live forecast, storm warnings, what to wear' },
  '/winter-clothing': { title: 'Free coats and winter clothing', subtitle: 'Free coat programs, kids coats, warming help' },
  '/map': { title: 'Map and transit', subtitle: 'Pins, MBTA arrivals, alerts' },
  '/market-trends': { title: 'Market trends', subtitle: 'Rent and income estimates for Boston' },
  '/neighborhood': { title: 'Neighborhoods', subtitle: 'The twelve areas of Dorchester' },
  '/news': { title: 'News', subtitle: 'Local coverage from each publisher' },
  '/projects': { title: 'Housing projects', subtitle: 'Planning Department dockets in Dorchester' },
  '/resources': { title: 'Directory', subtitle: 'Every organization we list' },
  '/tools': { title: 'Money tools', subtitle: 'AMI calculator, rent burden, deposits' },
  '/settings': { title: 'Settings', subtitle: 'Language, theme, accessibility, feeds' },
  '/privacy': { title: 'Privacy', subtitle: 'What is stored and what is not' },
  '/terms': { title: 'Terms of use', subtitle: 'How to read this data' },
};

export const PAGE_LABEL_KEYS: Record<string, string> = Object.keys(PAGE_TITLES).reduce(
  (acc, path) => {
    acc[path] = path;
    return acc;
  },
  {} as Record<string, string>
);

export const PAGES = Object.entries(PAGE_TITLES).map(([href, meta]) => ({ href, ...meta }));

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Phone numbers are searched digit-only so "617 825 9000" finds "(617) 825-9000".
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function phoneDigits(value: string): string {
  return value.replace(/\D/g, '');
}

function fromResource(record: ResourceRecord): SearchEntry {
  const services = record.services.join(' ');
  const haystack = normalize(
    [record.name, record.neighborhood, record.address, record.category, services, ...Object.values(record.summary), record.operator ?? '', record.phone ?? '', phoneDigits(record.phone ?? ''), resourceDetailSearchTerms(record.id)].join(' ')
  );
  return {
    id: `org-${record.id}`,
    kind: 'organization',
    title: record.name,
    subtitle: `${record.neighborhood} · ${record.address.split(',')[0]}`,
    href: record.detailHref ?? `/resources#${record.id}`,
    haystack,
    category: record.category,
    lat: isResourceMappable(record) ? record.lat : undefined,
    lng: isResourceMappable(record) ? record.lng : undefined,
    phone: record.phone,
  };
}

/** Free-coat programs search like directory orgs: by name, phone and need. */
function fromClothing(place: WinterClothingPlace): SearchEntry {
  const fields = [
    place.name,
    place.neighborhood,
    place.address ?? '',
    'coat coats winter clothing free',
    place.summary.en,
    place.howToGet,
    place.eligibility ?? '',
    CLOTHING_SPANISH[place.id]?.howToGet ?? '',
    CLOTHING_SPANISH[place.id]?.eligibility ?? '',
    CLOTHING_SPANISH[place.id]?.name ?? '',
    CLOTHING_SPANISH[place.id]?.neighborhood ?? '',
    CLOTHING_SPANISH[place.id]?.address ?? '',
    CLOTHING_SPANISH[place.id]?.hoursNote ?? '',
    CLOTHING_SPANISH[place.id]?.transit ?? '',
    ...Object.values(CLOTHING_LOCATOR_DETAILS).flatMap((items) => items[place.id] ? [items[place.id].name, items[place.id].neighborhood, items[place.id].howToGet] : []),
    ...Object.values(CLOTHING_PLACE_DETAILS).flatMap((items) => {
      const draft = items[place.id];
      return draft ? [draft.name, draft.neighborhood, draft.address, draft.howToGet, draft.eligibility, draft.hoursNote, draft.transit] : [];
    }),
    CLOTHING_SPANISH[place.id]?.summary ?? '',
    ...Object.values(CLOTHING_SUMMARIES).map((summaries) => summaries[place.id] ?? ''),
    place.offers.join(' '),
    place.audiences.join(' '),
    place.operator ?? '',
    place.phone ?? '',
    phoneDigits(place.phone ?? ''),
    ];
  // Secondary numbers embedded in instructions (e.g. an advocacy line)
  // should also match when a resident types only digits.
  const numbers = fields.join(' ').match(/\+?\(?\d{3}\)?[\s.-]*\d{3}[\s.-]*\d{4}/g) ?? [];
  const haystack = normalize([...fields, ...numbers.map(phoneDigits)].join(' '));
  return {
    id: `clothing-${place.id}`,
    kind: 'organization',
    title: place.name,
    subtitle: `${place.neighborhood} · ${place.address?.split(',')[0] ?? 'Free winter clothing'}`,
    href: '/winter-clothing',
    haystack,
    category: 'community',
    lat: place.lat,
    lng: place.lng,
    phone: place.phone,
  };
}

function build(): SearchEntry[] {
  const entries: SearchEntry[] = [];

  for (const page of PAGES) {
    entries.push({
      id: `page-${page.href}`,
      kind: 'page',
      title: page.title,
      subtitle: page.subtitle,
      href: page.href,
      haystack: normalize(`${page.title} ${page.subtitle} ${page.href} ${NAV_LABEL_KEY[page.href] ?? ''}`),
    });
  }

  entries.push(...RESOURCES.map(fromResource));
  entries.push(...WINTER_CLOTHING.map(fromClothing));

  for (const line of TRANSIT_LINES) {
    for (const stop of line.dorchesterStops) {
      entries.push({
        id: `stop-${stop.id}`,
        kind: 'stop',
        title: stop.name,
        subtitle: line.name,
        referenceLineId: line.id,
        href: `/map?stop=${stop.id}`,
        haystack: normalize(`${stop.name} ${line.name} ${line.label} station stop subway ${stop.id}`),
        lat: stop.lat,
        lng: stop.lng,
        category: line.mode,
      });
    }
  }

  for (const route of DORCHESTER_BUS_ROUTES) {
    entries.push({
      id: `route-${route.id}`,
      kind: 'route',
      title: `Route ${route.name}`,
      subtitle: route.longName,
      href: `/map?route=${route.id}`,
      haystack: normalize(`bus ${route.name} ${route.longName} route ${route.id}`),
      category: 'bus',
    });
  }

  return entries;
}

export const SEARCH_INDEX: SearchEntry[] = build();

export interface SearchHit extends SearchEntry {
  score: number;
  /** Why it matched, for the "matched on …" line. */
  matchedOn: 'title' | 'service' | 'address' | 'phone' | 'route';
}

export function scoreEntry(entry: SearchEntry, terms: string[]): { score: number; matchedOn: SearchHit['matchedOn'] } | null {
  let score = 0;
  let matchedOn: SearchHit['matchedOn'] = 'title';
  for (const term of terms) {
    if (!term) continue;
    const isPhone = /^[0-9]{3,}$/.test(term.replace(/\s/g, ''));
    if (isPhone) {
      const digits = term.replace(/\D/g, '');
      if (!entry.haystack.includes(digits)) return null;
      score += 6;
      matchedOn = 'phone';
      continue;
    }
    if (entry.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').startsWith(term)) {
      score += 5;
      matchedOn = 'title';
    } else if (entry.haystack.includes(term)) {
      score += 2;
      matchedOn = 'service';
    } else {
      return null;
    }
  }
  if (entry.kind === 'page') score += 1.5;
  if (entry.kind === 'organization') score += 0.5;
  return { score, matchedOn };
}

/** Dictionary keys for both the displayed label and the searchable summary. */
const PAGE_COPY: Record<string, { title: TranslationKey; subtitle: TranslationKey }> = {
  '/': { title: 'nav.dashboard', subtitle: 'dashboard.tagline' },
  '/affordable-housing': { title: 'housing.title', subtitle: 'housing.description' },
  '/faq': { title: 'faq.title', subtitle: 'faq.description' },
  '/food': { title: 'food.title', subtitle: 'food.description' },
  '/weather': { title: 'weather.title', subtitle: 'weather.subtitle' },
  '/winter-clothing': { title: 'clothing.title', subtitle: 'clothing.subtitle' },
  '/map': { title: 'map.title', subtitle: 'map.subtitle' },
  '/market-trends': { title: 'market.title', subtitle: 'market.description' },
  '/neighborhood': { title: 'neighborhood.title', subtitle: 'neighborhood.description' },
  '/news': { title: 'news.title', subtitle: 'news.description' },
  '/projects': { title: 'projects.title', subtitle: 'projects.description' },
  '/resources': { title: 'resources.title', subtitle: 'resources.description' },
  '/tools': { title: 'tools.title', subtitle: 'tools.description' },
  '/settings': { title: 'settings.title', subtitle: 'settings.description' },
  '/privacy': { title: 'legal.privacyTitle', subtitle: 'search.privacySummary' },
  '/terms': { title: 'legal.termsTitle', subtitle: 'search.termsSummary' },
};

function localizedEntry(entry: SearchEntry, lang: LanguageCode): SearchEntry {
  if (lang === 'en') return { ...entry, titleLanguage: 'en', subtitleLanguage: 'en' };
  const dict = dictionaries[lang];
  const copy = entry.kind === 'page' ? PAGE_COPY[entry.href] : undefined;
  const record = entry.id.startsWith('org-') ? RESOURCES.find((resource) => `org-${resource.id}` === entry.id) : undefined;
  const clothing = entry.id.startsWith('clothing-') ? WINTER_CLOTHING.find((place) => `clothing-${place.id}` === entry.id) : undefined;
  const clothingDraft = clothing ? clothingContent(clothing, lang) : undefined;
  const details = record ? resourceDetails(record, lang) : undefined;
  const line = entry.referenceLineId ? TRANSIT_LINES.find((item) => item.id === entry.referenceLineId) : undefined;
  const route = entry.kind === 'route' ? DORCHESTER_BUS_ROUTES.find((item) => `route-${item.id}` === entry.id) : undefined;
  const transit = line ? referenceLineName(line, lang) : route ? referenceBusName(route, lang) : undefined;
  const title = copy ? dict[copy.title] : clothingDraft ? clothingDraft.name : entry.kind === 'route' ? entry.title.replace(/^Route /, `${dict['map.route']} `) : entry.title;
  const subtitle = copy ? dict[copy.subtitle] : clothing && clothingDraft
    ? `${clothingDraft.neighborhood} · ${clothing.address?.split(',')[0] ?? dict['clothing.title']}`
    : record && details ? `${details.neighborhood.value} · ${details.address.value.split(',')[0]}` : transit?.value ?? entry.subtitle;
  // Names and addresses may stay in their original language; keep English
  // search terms and mark any untranslated neighborhood for screen readers.
  return {
    ...entry, title, subtitle,
    titleLanguage: copy || entry.kind === 'route' ? lang : clothingDraft?.nameLanguage ?? 'en',
    subtitleLanguage: copy ? lang : clothingDraft?.neighborhoodLanguage ?? details?.neighborhood.used ?? transit?.used ?? 'en',
    subtitleFellBack: Boolean(details?.neighborhood.fellBack || details?.address.fellBack || transit?.fellBack || (clothingDraft && clothingDraft.neighborhoodLanguage === 'en')),
    haystack: normalize(`${entry.haystack} ${title} ${subtitle}`),
  };
}

export function search(raw: string, opts: { kinds?: SearchKind[]; limit?: number; language?: LanguageCode } = {}): SearchHit[] {
  const query = normalize(raw);
  const limit = opts.limit ?? 12;
  if (query.length < 2) return [];
  const terms = query.split(' ').filter(Boolean);
  const hits: SearchHit[] = [];
  for (const original of SEARCH_INDEX) {
    const entry = localizedEntry(original, opts.language ?? 'en');
    if (opts.kinds && !opts.kinds.includes(entry.kind)) continue;
    const result = scoreEntry(entry, terms);
    if (!result) continue;
    hits.push({ ...entry, ...result });
  }
  return hits.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title)).slice(0, limit);
}

export const ROUTES_IN_INDEX = PUBLIC_ROUTES.length;
