/**
 * Verified offline snapshot of the publisher news feeds.
 *
 * What this is: a point-in-time copy of the same feeds `/api/news` reads live,
 * captured from the publishers' own RSS/Atom output and kept as the last-resort
 * fallback when every requested feed is unreachable (e.g. the live preview
 * sandbox has no outbound network, or a publisher is down). The current capture
 * holds the Dorchester Reporter's items, because they are the only publisher
 * with relevant stories inside the freshness window the UI asks for; the other
 * three feeds' items had aged out, and the API filters every snapshot item by
 * the same age window as the live feeds.
 *
 * What this is NOT: invented or "placeholder" stories. Every entry below is a
 * real item with its real published date, real URL and a summary taken from
 * the publisher's own feed. The `asOf` timestamp is the capture time, and the
 * API returns it so the UI can say "snapshot" instead of pretending it is
 * live. Live data always takes priority; the snapshot is only used when zero
 * live articles arrive.
 *
 * Refresh rule: when this file is next updated, re-verify each URL, keep only
 * items inside the freshness window the UI asks for, and bump `asOf`.
 */

export interface SnapshotArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  sourceId: string;
  sourceUrl: string;
  link: string;
  publishedAt: string; // ISO 8601 UTC, taken from the publisher's feed
  category: 'housing' | 'transportation' | 'food' | 'health' | 'community' | 'other';
  language: 'en' | 'es' | 'zh' | 'vi' | 'ht';
}

export const NEWS_SNAPSHOT_AS_OF = '2026-10-04T18:30:00.000Z';

export const NEWS_SNAPSHOT_SOURCES = [
  { id: 'dotnews', name: 'Dorchester Reporter', url: 'https://www.dotnews.com/feed/', homepage: 'https://www.dotnews.com' },
  { id: 'boston-gov', name: 'Boston.gov news', url: 'https://www.boston.gov/rss/news', homepage: 'https://www.boston.gov/news' },
  { id: 'wbur', name: 'WBUR News', url: 'https://rss.wbur.org/wbur/rss', homepage: 'https://www.wbur.org/news' },
  { id: 'globe-metro', name: 'The Boston Globe', url: 'https://www.bostonglobe.com/arc/outboundfeeds/rss/?outputType=xml', homepage: 'https://www.bostonglobe.com/metro' },
] as const;

export const NEWS_SNAPSHOT: SnapshotArticle[] = [
  {
    id: 'snap-dot-80096',
    title: 'MBTA removes ads critical of Boston Public School performance',
    summary: 'The ads targeted for rider eyes on the MBTA were part of a larger campaign that will include signs on billboards in Boston.',
    source: 'Dorchester Reporter',
    sourceId: 'dotnews',
    sourceUrl: 'https://www.dotnews.com',
    link: 'https://www.dotnews.com/2026/10/03/mbta-removes-ads-critical-of-boston-public-school-performance/',
    publishedAt: '2026-10-03T14:06:31.000Z',
    category: 'transportation',
    language: 'en',
  },
  {
    id: 'snap-dot-80093',
    title: 'Healey, Wu show unity on clean energy, keep distance on key policies',
    summary: 'Fresh off Boston Mayor Michelle Wu\u2019s endorsement of Gov. Maura Healey for reelection, the pair appeared as a unit on Thursday in East Boston.',
    source: 'Dorchester Reporter',
    sourceId: 'dotnews',
    sourceUrl: 'https://www.dotnews.com',
    link: 'https://www.dotnews.com/2026/10/02/healey-wu-show-unity-on-clean-energy-keep-distance-on-key-policies/',
    publishedAt: '2026-10-02T13:01:16.000Z',
    category: 'other',
    language: 'en',
  },
  {
    id: 'snap-dot-80085',
    title: 'New accessible ramp dedicated at Milton trolley station',
    summary: 'The project, part of a larger plan to make upgrades along the Mattapan Line, also includes new lighting, security cameras, handrails, signage, seating, and landscaping.',
    source: 'Dorchester Reporter',
    sourceId: 'dotnews',
    sourceUrl: 'https://www.dotnews.com',
    link: 'https://www.dotnews.com/2026/10/01/new-accessible-ramp-dedicated-at-milton-trolley-station/',
    publishedAt: '2026-10-01T19:29:29.000Z',
    category: 'transportation',
    language: 'en',
  },
  {
    id: 'snap-dot-80067',
    title: 'City, MBTA conclude series of Blue Hill Avenue meetings',
    summary: 'The City of Boston and the MBTA concluded the last of four meetings in the Holland Tech High School auditorium.',
    source: 'Dorchester Reporter',
    sourceId: 'dotnews',
    sourceUrl: 'https://www.dotnews.com',
    link: 'https://www.dotnews.com/2026/10/01/city-mbta-conclude-series-of-blue-hill-avenue-meetings/',
    publishedAt: '2026-10-01T05:47:00.000Z',
    category: 'transportation',
    language: 'en',
  },
  {
    id: 'snap-dot-80050',
    title: 'USPS says Fields Corner branch will \u2018temporarily\u2019 close Oct. 26',
    summary: 'The Fields Corner Post Office will close effective Mon., Oct. 26, according to a notice issued by USPS on Wednesday.',
    source: 'Dorchester Reporter',
    sourceId: 'dotnews',
    sourceUrl: 'https://www.dotnews.com',
    link: 'https://www.dotnews.com/2026/09/30/usps-says-fields-corner-branch-will-temporarily-close-oct-26/',
    publishedAt: '2026-09-30T22:22:55.000Z',
    category: 'community',
    language: 'en',
  },
  {
    id: 'snap-dot-80052',
    title: 'Man shot to death on Whitfield Street; 20-year-old Dorchester man arrested',
    summary: 'Officers responded to a report of a person shot inside an apartment at 7 Whitfield St. around 5:30 p.m.',
    source: 'Dorchester Reporter',
    sourceId: 'dotnews',
    sourceUrl: 'https://www.dotnews.com',
    link: 'https://www.dotnews.com/2026/09/30/man-critically-wounded-in-dorchester-shooting/',
    publishedAt: '2026-09-30T22:28:16.000Z',
    category: 'other',
    language: 'en',
  },
  {
    id: 'snap-dot-80042',
    title: 'Councillors join forces to push for tougher rule on police use of surveillance tech',
    summary: 'Councillor Ben Weber\u2019s amended ordinance was filed last Wednesday with all but one councillor signing on in support.',
    source: 'Dorchester Reporter',
    sourceId: 'dotnews',
    sourceUrl: 'https://www.dotnews.com',
    link: 'https://www.dotnews.com/2026/09/30/councillors-to-push-for-tougher-rule-on-police-use-of-surveillance-tech/',
    publishedAt: '2026-09-30T17:16:40.000Z',
    category: 'other',
    language: 'en',
  },
  {
    id: 'snap-dot-80031',
    title: 'Final Blue Hill Ave. project town hall meeting set for tonight in Dorchester',
    summary: 'Opponents plan a protest, advocates urge that project move forward.',
    source: 'Dorchester Reporter',
    sourceId: 'dotnews',
    sourceUrl: 'https://www.dotnews.com',
    link: 'https://www.dotnews.com/2026/09/30/final-blue-hill-ave-project-town-hall-meeting-set-for-tonight-in-dorchester/',
    publishedAt: '2026-09-30T15:53:13.000Z',
    category: 'transportation',
    language: 'en',
  },
  {
    id: 'snap-dot-80022',
    title: 'Letter to the Editor: Little House as Boutique hotel? What was the BPDA thinking?',
    summary: 'John McColgan\u2019s opinion piece (Sept. 24 edition) about the Little House site being turned into a boutique hotel is spot on, the letter writer says.',
    source: 'Dorchester Reporter',
    sourceId: 'dotnews',
    sourceUrl: 'https://www.dotnews.com',
    link: 'https://www.dotnews.com/2026/09/30/letter-to-the-editor-little-house-as-boutique-hotel-what-was-the-bpda-thinking/',
    publishedAt: '2026-09-30T15:20:54.000Z',
    category: 'other',
    language: 'en',
  },
];
