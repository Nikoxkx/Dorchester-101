/**
 * Feed registry.
 *
 * The news API and the Settings screen read this one list, so a source can never
 * be switchable in one place and invisible in the other. Each entry states the
 * publisher's own address, and the app links out rather than republishing text.
 */

export interface NewsFeed {
  id: string;
  name: string;
  url: string;
  homepage: string;
  /** What the publisher is, in one phrase, for the settings list. */
  kind: string;
  /** Feed language. Dorchester's papers are mostly English; two are not. */
  language: 'en' | 'es' | 'zh' | 'vi' | 'ht';
  /** Lower number wins when two stories are the same age. */
  priority: number;
  enabledByDefault: boolean;
}

export const NEWS_FEEDS: NewsFeed[] = [
  {
    id: 'dotnews',
    name: 'Dorchester Reporter',
    url: 'https://www.dotnews.com/feed/',
    homepage: 'https://www.dotnews.com',
    kind: 'Neighborhood newspaper covering Dorchester and surrounding areas.',
    language: 'en',
    priority: 1,
    enabledByDefault: true,
  },
  {
    id: 'boston-gov',
    name: 'Boston.gov news',
    url: 'https://www.boston.gov/rss/news',
    homepage: 'https://www.boston.gov/news',
    kind: 'City of Boston announcements, including housing and shelter news.',
    language: 'en',
    priority: 2,
    enabledByDefault: true,
  },
  {
    id: 'wbur',
    name: 'WBUR News',
    url: 'https://rss.wbur.org/wbur/rss',
    homepage: 'https://www.wbur.org/news',
    kind: 'Boston public radio newsroom.',
    language: 'en',
    priority: 3,
    enabledByDefault: true,
  },
  {
    id: 'globe-metro',
    name: 'The Boston Globe',
    url: 'https://www.bostonglobe.com/arc/outboundfeeds/rss/?outputType=xml',
    homepage: 'https://www.bostonglobe.com/metro',
    kind: 'Regional daily. Most articles sit behind a paywall; headlines and summaries are free.',
    language: 'en',
    priority: 4,
    enabledByDefault: false,
  },
];

export const DEFAULT_NEWS_FEED_IDS = NEWS_FEEDS.filter((f) => f.enabledByDefault).map((f) => f.id);

export interface TransitFeed {
  id: string;
  name: string;
  description: string;
  /** Endpoint this app actually reads, so the settings screen can be trusted. */
  endpoint: string;
  /** How often the value changes, shown as text next to the switch. */
  cadenceSeconds: number;
  enabledByDefault: boolean;
}

export const TRANSIT_FEEDS: TransitFeed[] = [
  {
    id: 'mbta-predictions',
    name: 'Arrival predictions',
    description: 'Live arrival and departure estimates for the stations near you.',
    endpoint: '/predictions',
    cadenceSeconds: 30,
    enabledByDefault: true,
  },
  {
    id: 'mbta-alerts',
    name: 'Service alerts',
    description: 'Detours, suspensions and delays published by the MBTA.',
    endpoint: '/alerts',
    cadenceSeconds: 300,
    enabledByDefault: true,
  },
  {
    id: 'mbta-cr',
    name: 'Commuter Rail times',
    description: 'Fairmount Line schedules, which the subway map does not carry.',
    endpoint: '/schedules',
    cadenceSeconds: 900,
    enabledByDefault: false,
  },
];

export const DEFAULT_TRANSIT_FEED_IDS = TRANSIT_FEEDS.filter((f) => f.enabledByDefault).map((f) => f.id);

/**
 * Topic classification runs on the server from a fixed keyword table, and the UI
 * translates the slug. English words never reach the interface.
 */
export type NewsCategorySlug = 'housing' | 'transportation' | 'food' | 'health' | 'community' | 'other';

export const NEWS_CATEGORY_KEYWORDS: Record<Exclude<NewsCategorySlug, 'other'>, string[]> = {
  housing: ['housing', 'rent', 'tenant', 'eviction', 'bha', 'affordable', 'homeless', 'shelter', 'mortgage', 'zoning', 'section 8'],
  transportation: ['mbta', 'transit', 'subway', 'red line', 'bus route', 'trolley', 'commuter rail', 'bike lane', 'street closure', 'cta'],
  food: ['food', 'snap', 'pantry', 'meal', 'nutrition', 'wic', 'farm stand', 'hunger', 'ebt'],
  health: ['health', 'clinic', 'hospital', 'masshealth', 'vaccine', 'mental health', 'overdose', 'nurse'],
  community: ['community', 'event', 'meeting', 'festival', 'volunteer', 'neighborhood', 'library', 'school', 'youth'],
};

export function categorize(text: string): NewsCategorySlug {
  const haystack = text.toLowerCase();
  let best: { slug: NewsCategorySlug; hits: number } = { slug: 'other', hits: 0 };
  for (const [slug, words] of Object.entries(NEWS_CATEGORY_KEYWORDS) as Array<[Exclude<NewsCategorySlug, 'other'>, string[]]>) {
    const hits = words.reduce((total, word) => (haystack.includes(word) ? total + 1 : total), 0);
    if (hits > best.hits) best = { slug, hits };
  }
  return best.hits > 0 ? best.slug : 'other';
}
