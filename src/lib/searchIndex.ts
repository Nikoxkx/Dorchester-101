/**
 * The app's own search index.
 *
 * A community site where the useful thing is a phone number has to be
 * searchable by phone number. This is a deliberately small in-process index
 * rather than a database: the corpus is a few hundred records, it is bundled
 * with the app, and it therefore works offline and in the desktop build where a
 * server may not exist at all.
 */

import { RESOURCES, type ResourceRecord } from '@/data/resources';
import { TRANSIT_LINES, DORCHESTER_BUS_ROUTES } from '@/data/transit';
import { PUBLIC_ROUTES } from './site';

export type SearchKind = 'page' | 'organization' | 'stop' | 'route';

export interface SearchEntry {
  id: string;
  kind: SearchKind;
  title: string;
  subtitle: string;
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
  '/map': { title: 'Map and transit', subtitle: 'Pins, MBTA arrivals, alerts' },
  '/market-trends': { title: 'Market trends', subtitle: 'Rent and income estimates for Boston' },
  '/neighborhood': { title: 'Neighborhoods', subtitle: 'The twelve areas of Dorchester' },
  '/news': { title: 'News', subtitle: 'Local coverage from each publisher' },
  '/projects': { title: 'Housing projects', subtitle: 'BPDA dockets in Dorchester' },
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

/** Page titles are translated at render time; the index keeps the English key list. */
export const NAV_LABEL_KEY: Record<string, string> = {
  '/': 'nav.dashboard',
  '/projects': 'nav.projects',
  '/affordable-housing': 'nav.affordable',
  '/market-trends': 'nav.market',
  '/map': 'nav.map',
  '/food': 'nav.food',
  '/neighborhood': 'nav.neighborhood',
  '/tools': 'nav.tools',
  '/news': 'nav.news',
  '/resources': 'nav.resources',
  '/faq': 'nav.faq',
  '/settings': 'nav.settings',
  '/about': 'about.title',
};

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
    [record.name, record.neighborhood, record.address, record.category, services, record.operator ?? '', record.phone ?? '', phoneDigits(record.phone ?? '')].join(' ')
  );
  return {
    id: `org-${record.id}`,
    kind: 'organization',
    title: record.name,
    subtitle: `${record.neighborhood} · ${record.address.split(',')[0]}`,
    href: record.detailHref ?? `/resources#${record.id}`,
    haystack,
    category: record.category,
    lat: record.lat,
    lng: record.lng,
    phone: record.phone,
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

  for (const line of TRANSIT_LINES) {
    for (const stop of line.dorchesterStops) {
      entries.push({
        id: `stop-${stop.id}`,
        kind: 'stop',
        title: stop.name,
        subtitle: line.name,
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

export function search(raw: string, opts: { kinds?: SearchKind[]; limit?: number } = {}): SearchHit[] {
  const query = normalize(raw);
  const limit = opts.limit ?? 12;
  if (query.length < 2) return [];
  const terms = query.split(' ').filter(Boolean);
  const hits: SearchHit[] = [];
  for (const entry of SEARCH_INDEX) {
    if (opts.kinds && !opts.kinds.includes(entry.kind)) continue;
    const result = scoreEntry(entry, terms);
    if (!result) continue;
    hits.push({ ...entry, ...result });
  }
  return hits.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title)).slice(0, limit);
}

export const ROUTES_IN_INDEX = PUBLIC_ROUTES.length;
