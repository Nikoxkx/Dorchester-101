/**
 * Verified offline snapshot of the publisher news feeds.
 *
 * What this is: a point-in-time copy of the same feeds `/api/news` reads live,
 * captured from the publishers' own RSS/Atom output on 2026-09-06 and kept as
 * the last-resort fallback when every requested feed is unreachable (e.g. the
 * live preview sandbox has no outbound network, or a publisher is down).
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

export const NEWS_SNAPSHOT_AS_OF = '2026-09-06T21:54:00.000Z';

export const NEWS_SNAPSHOT_SOURCES = [
  { id: 'dotnews', name: 'Dorchester Reporter', url: 'https://www.dotnews.com/feed/', homepage: 'https://www.dotnews.com' },
  { id: 'boston-gov', name: 'Boston.gov news', url: 'https://www.boston.gov/rss/news', homepage: 'https://www.boston.gov/news' },
  { id: 'wbur', name: 'WBUR News', url: 'https://rss.wbur.org/wbur/rss', homepage: 'https://www.wbur.org/news' },
  { id: 'globe-metro', name: 'The Boston Globe', url: 'https://www.bostonglobe.com/arc/outboundfeeds/rss/?outputType=xml', homepage: 'https://www.bostonglobe.com/metro' },
] as const;

export const NEWS_SNAPSHOT: SnapshotArticle[] = [
  {
    id: 'snap-dot-79415',
    title: 'Blue Hill Ave. overhaul gets fresh design pitch ahead of community meetings',
    summary: 'New plan keeps center-running buses, shifts bike lanes to west side of road, creates new parking and mainly keeps two lanes of traffic each direction.',
    source: 'Dorchester Reporter',
    sourceId: 'dotnews',
    sourceUrl: 'https://www.dotnews.com',
    link: 'https://www.dotnews.com/2026/09/04/blue-hill-ave-overhaul-gets-fresh-design-pitch-ahead-of-community-meetings/',
    publishedAt: '2026-09-04T10:00:00.000Z',
    category: 'transportation',
    language: 'en',
  },
  {
    id: 'snap-dot-79402',
    title: 'Defeated at polls, Latoya Gayle says goal to make Collins \u2018work\u2019 was achieved',
    summary: '\u201cMassachusetts is famous for having uncontested races, and because of that, people really settle in because they think no one is watching,\u201d Gayle told The Reporter.',
    source: 'Dorchester Reporter',
    sourceId: 'dotnews',
    sourceUrl: 'https://www.dotnews.com',
    link: 'https://www.dotnews.com/2026/09/03/defeated-at-polls-latoya-gayle-says-goal-to-make-collins-work-was-achieved/',
    publishedAt: '2026-09-03T22:40:01.000Z',
    category: 'other',
    language: 'en',
  },
  {
    id: 'snap-dot-79397',
    title: 'Collins says voters wanted an independent senator willing to \u2018finish the marathon\u2019',
    summary: 'Reflecting on his 10-point primary win over first-time candidate Latoya Gayle on Tuesday, state Sen. Nick Collins says his success with voters in the First Suffolk District was powered by his long-standing work.',
    source: 'Dorchester Reporter',
    sourceId: 'dotnews',
    sourceUrl: 'https://www.dotnews.com',
    link: 'https://www.dotnews.com/2026/09/03/collins-says-voters-wanted-an-independent-senator-willing-to-finish-the-marathon/',
    publishedAt: '2026-09-03T18:26:29.000Z',
    category: 'other',
    language: 'en',
  },
  {
    id: 'snap-dot-79394',
    title: 'Neighbors review proposal for a 20-unit condo complex on Dot Ave. near Ashmont',
    summary: 'A developer plans to build a 4-and-a-half-story, 20-unit condo complex at 2062 Dorchester Ave. The building would replace a currently unoccupied two-family home.',
    source: 'Dorchester Reporter',
    sourceId: 'dotnews',
    sourceUrl: 'https://www.dotnews.com',
    link: 'https://www.dotnews.com/2026/09/03/neighbors-review-proposal-for-a-20-unit-condo-complex-on-dot-ave-near-ashmont/',
    publishedAt: '2026-09-03T17:12:24.000Z',
    category: 'other',
    language: 'en',
  },
  {
    id: 'snap-dot-79388',
    title: 'Vincent Crotty and his community team key their work on two local art projects',
    summary: 'The highly regarded portrait and landscape artist Vincent Crotty has shared his talents with the Dorchester community since settling down in the neighborhood in the 1990s.',
    source: 'Dorchester Reporter',
    sourceId: 'dotnews',
    sourceUrl: 'https://www.dotnews.com',
    link: 'https://www.dotnews.com/2026/09/03/vincent-crotty-and-his-community-team-key-their-work-on-two-local-art-projects/',
    publishedAt: '2026-09-03T17:08:06.000Z',
    category: 'community',
    language: 'en',
  },
  {
    id: 'snap-dot-79383',
    title: 'State\u2019s Caribbean population put at 11 percent in new study',
    summary: 'A new study published last week shows that the number of Massachusetts residents with Caribbean heritage is close to 800,000, or 11 percent of the state\u2019s population.',
    source: 'Dorchester Reporter',
    sourceId: 'dotnews',
    sourceUrl: 'https://www.dotnews.com',
    link: 'https://www.dotnews.com/2026/09/03/states-caribbean-population-put-at-11-percent-in-new-study/',
    publishedAt: '2026-09-03T17:00:03.000Z',
    category: 'other',
    language: 'en',
  },
  {
    id: 'snap-dot-79374',
    title: 'Worrell wants Boston to examine tech solution to noise complaints',
    summary: 'City councillor says \u201cnoise cameras\u201d that can locate offending properties or vehicles and lead to fines as a way to crack down on trouble spots.',
    source: 'Dorchester Reporter',
    sourceId: 'dotnews',
    sourceUrl: 'https://www.dotnews.com',
    link: 'https://www.dotnews.com/2026/09/03/worrell-wants-boston-to-examine-tech-solution-to-noise-complaints/',
    publishedAt: '2026-09-03T16:32:41.000Z',
    category: 'community',
    language: 'en',
  },
  {
    id: 'snap-dot-79371',
    title: 'Lounge owner faces opposition in bid to move licenses to former Kay\u2019s Oasis',
    summary: 'Wandaly Ortiz Guerrero hopes to open for business in the former Kay\u2019s Oasis building, using licenses for liquor and entertainment secured for a different location in Dorchester two years ago.',
    source: 'Dorchester Reporter',
    sourceId: 'dotnews',
    sourceUrl: 'https://www.dotnews.com',
    link: 'https://www.dotnews.com/2026/09/03/lounge-owner-faces-opposition-in-bid-to-move-licenses-to-former-kays-oasis/',
    publishedAt: '2026-09-03T15:50:15.000Z',
    category: 'other',
    language: 'en',
  },
  {
    id: 'snap-dot-79363',
    title: 'Sheriff Tompkins found not guilty in federal corruption case',
    summary: 'Suffolk County Sheriff Steven Tompkins was acquitted by a federal jury Wednesday of corruption charges related to a cannabis investment, according to reports from inside the courtroom.',
    source: 'Dorchester Reporter',
    sourceId: 'dotnews',
    sourceUrl: 'https://www.dotnews.com',
    link: 'https://www.dotnews.com/2026/09/03/sheriff-tompkins-found-not-guilty-in-federal-corruption-case/',
    publishedAt: '2026-09-03T12:19:48.000Z',
    category: 'other',
    language: 'en',
  },
  {
    id: 'snap-wbur-602811f8',
    title: 'Benches clear between O\u2019s and Red Sox after double play',
    summary: 'The Baltimore Orioles and Boston Red Sox benches cleared after a tense moment involving Blaze Alexander.',
    source: 'WBUR News',
    sourceId: 'wbur',
    sourceUrl: 'https://www.wbur.org/news',
    link: 'https://www.wbur.org/news/2026/09/05/benches-clear-between-os-and-red-sox-after-double-play',
    publishedAt: '2026-09-05T11:19:02.000Z',
    category: 'other',
    language: 'en',
  },
  {
    id: 'snap-wbur-5ddf4b5c',
    title: 'More Mass families will get help paying for childcare, but tens of thousands remain on waitlist',
    summary: 'The state is kicking in $31.2 million more to expand child-care assistance, while 31,000 children remain on a waitlist for financial help.',
    source: 'WBUR News',
    sourceId: 'wbur',
    sourceUrl: 'https://www.wbur.org/news',
    link: 'https://www.wbur.org/news/2026/09/04/massachusetts-childcare-families-income-financial-help-waitlist',
    publishedAt: '2026-09-04T23:39:20.000Z',
    category: 'other',
    language: 'en',
  },
  {
    id: 'snap-wbur-c201c543',
    title: 'WBUR launches special series of \u2018Beyond All Repair\u2019 podcast following mistrial in Lindsay Clancy case',
    summary: '\u201cBeyond All Repair: The Clancy Trial\u201d is a special limited podcast series that explains what happened during the trial and what happens next.',
    source: 'WBUR News',
    sourceId: 'wbur',
    sourceUrl: 'https://www.wbur.org/news',
    link: 'https://www.wbur.org/inside/2026/09/04/special-series-of-beyond-all-repair-podcast-following-mistrial-in-lindsay-clancy-case',
    publishedAt: '2026-09-04T21:39:09.000Z',
    category: 'other',
    language: 'en',
  },
  {
    id: 'snap-wbur-7c2c3c53',
    title: 'New Mass. group provides support to people whose loved ones died in murder-suicides',
    summary: 'Jenna Howe and suicide prevention program Call2Talk recently started a support group for survivors of this specific type of loss.',
    source: 'WBUR News',
    sourceId: 'wbur',
    sourceUrl: 'https://www.wbur.org/news',
    link: 'https://www.wbur.org/upnext/2026/09/04/murder-suicide-loss-support-group-massachusetts',
    publishedAt: '2026-09-04T21:17:13.000Z',
    category: 'health',
    language: 'en',
  },
  {
    id: 'snap-globe-mailin',
    title: 'Trump\u2019s war on mail-in ballots has voters baffled. That may be the point.',
    summary: 'President Trump\u2019s legal and rhetorical assault on voting by mail \u2014 and the flurry of contradictory court decisions around it \u2014 has left voters confused and local officials scrambling.',
    source: 'The Boston Globe',
    sourceId: 'globe-metro',
    sourceUrl: 'https://www.bostonglobe.com/metro',
    link: 'https://www.bostonglobe.com/2026/09/06/nation/trumps-war-mail-in-ballots-has-voters-baffled-that-may-be-point/',
    publishedAt: '2026-09-06T21:49:18.000Z',
    category: 'other',
    language: 'en',
  },
  {
    id: 'snap-globe-basketball',
    title: 'Jackie Young leads gritty US escape in tight women\u2019s basketball World Cup win over Italy',
    summary: 'Jackie Young scored 10 points and the United States survived its toughest test in the women\u2019s basketball World Cup in two decades with a 55-52 victory over Italy.',
    source: 'The Boston Globe',
    sourceId: 'globe-metro',
    sourceUrl: 'https://www.bostonglobe.com/metro',
    link: 'https://www.bostonglobe.com/2026/09/06/sports/fiba-womens-basketball-usa-italy-game-score/',
    publishedAt: '2026-09-06T21:21:55.000Z',
    category: 'other',
    language: 'en',
  },
];
