/**
 * Registry of every outside source the site cites, so a citation is a
 * lookup rather than a string typed into a page. Each entry carries the
 * publisher's public name, its home page, a short description of what we take
 * from it, and a monogram badge drawn by this project.
 *
 * On logos: the publishers' actual logos are trademarks and are not included in
 * an MIT-licensed repository. `SourceMark` draws a monogram in the publisher's
 * public brand colour instead, which identifies the source at a glance without
 * republishing artwork we do not own. Where a publisher offers a press kit that
 * allows editorial use, an operator can drop the file at
 * `public/sources/<id>.svg` and the component will prefer it automatically.
 */
export interface SourceInfo {
  id: string;
  name: string;
  short: string;
  url: string;
  /** What DOR101 reads from this source, in one line. */
  provides: string;
  /** Public brand colour, used only as the badge background. */
  color: string;
  ink?: string;
  /** How often the source itself publishes. */
  cadence: string;
  licence?: string;
}

const SOURCE_TABLE = {
  census: {
    id: 'census',
    name: 'U.S. Census Bureau',
    short: 'ACS',
    url: 'https://data.census.gov',
    provides: 'American Community Survey 5-year estimates for Suffolk County: rent, income, home value, tenure, rent burden.',
    color: '#112E51',
    cadence: 'Annual (each December)',
    licence: 'Public domain (U.S. federal government work)',
  },
  hud: {
    id: 'hud',
    name: 'HUD User',
    short: 'HUD',
    url: 'https://www.huduser.gov/portal/datasets/fmr.html',
    provides: 'Fair Market Rents by bedroom count and the area median income limits used for affordable-housing eligibility.',
    color: '#005EA2',
    cadence: 'Annual (FMR each October, income limits each spring)',
    licence: 'Public domain',
  },
  mbta: {
    id: 'mbta',
    name: 'MBTA',
    short: 'T',
    url: 'https://www.mbta.com/developers/v3-api',
    provides: 'Live arrival predictions, service alerts, route shapes and station lists from the V3 API.',
    color: '#DA291C',
    cadence: 'Live; polled every 30 seconds while a page is open',
    licence: 'MBTA Developer License Agreement; route colours are the authority’s published values',
  },
  bha: {
    id: 'bha',
    name: 'Boston Housing Authority',
    short: 'BHA',
    url: 'https://www.bostonhousing.org',
    provides: 'Public housing and Section 8 waitlist status, application procedures and contact numbers.',
    color: '#14304F',
    cadence: 'Checked by hand; the date is on each listing',
  },
  bpda: {
    id: 'bpda',
    name: 'Boston Planning & Development Agency',
    short: 'BPDA',
    url: 'https://www.bostonplans.org',
    provides: 'Development project docket, income-restricted unit counts and public meeting schedules.',
    color: '#00A79D',
    cadence: 'Weekly docket updates',
  },
  bostongov: {
    id: 'bostongov',
    name: 'City of Boston',
    short: 'BOS',
    url: 'https://www.boston.gov',
    provides: 'Office of Housing programs, city news feed, language-access line and department contacts.',
    color: '#091F2F',
    cadence: 'Daily',
  },
  gbfb: {
    id: 'gbfb',
    name: 'Greater Boston Food Bank',
    short: 'GBFB',
    url: 'https://www.gbfb.org/need-food/',
    provides: 'Pantry partner list and the food-finder used to cross-check hours.',
    color: '#E36F1E',
    cadence: 'Monthly partner list',
  },
  dta: {
    id: 'dta',
    name: 'Mass. Dept. of Transitional Assistance',
    short: 'DTA',
    url: 'https://www.mass.gov/orgs/department-of-transitional-assistance',
    provides: 'SNAP eligibility rules, application steps and the DTA Connect help line.',
    color: '#14558F',
    cadence: 'Rules change annually each October',
  },
  masslegal: {
    id: 'masslegal',
    name: 'MassLegalHelp',
    short: 'MLH',
    url: 'https://www.masslegalhelp.org/housing',
    provides: 'Tenant rights, eviction process and court-form explanations in plain language.',
    color: '#6B2D5C',
    cadence: 'Updated with each statute change',
  },
  osm: {
    id: 'osm',
    name: 'OpenStreetMap contributors',
    short: 'OSM',
    url: 'https://www.openstreetmap.org/copyright',
    provides: 'Street basemap tiles and labels.',
    color: '#7EBC6F',
    ink: '#0B2A10',
    cadence: 'Continuous',
    licence: 'ODbL',
  },
  esri: {
    id: 'esri',
    name: 'Esri World Imagery',
    short: 'Esri',
    url: 'https://www.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9',
    provides: 'Satellite imagery basemap (Maxar, Earthstar Geographics).',
    color: '#2F6EB5',
    cadence: 'Periodic imagery refresh',
  },
  wikimedia: {
    id: 'wikimedia',
    name: 'Wikimedia Commons',
    short: 'W',
    url: 'https://commons.wikimedia.org',
    provides: 'Photographs of the neighbourhood, each with its own licence stated in the caption.',
    color: '#006699',
    cadence: '—',
    licence: 'Per file; CC BY-SA unless the caption says otherwise',
  },
  dotnews: {
    id: 'dotnews',
    name: 'Dorchester Reporter',
    short: 'DR',
    url: 'https://www.dotnews.com',
    provides: 'Neighbourhood news feed.',
    color: '#8B1E2D',
    cadence: 'Weekly print, daily online',
  },
  wbur: {
    id: 'wbur',
    name: 'WBUR',
    short: 'WBUR',
    url: 'https://www.wbur.org',
    provides: 'Boston news feed, filtered to Dorchester and citywide services.',
    color: '#C8102E',
    cadence: 'Daily',
  },
  gbh: {
    id: 'gbh',
    name: 'GBH News',
    short: 'GBH',
    url: 'https://www.wgbh.org/news',
    provides: 'Boston news feed, filtered to Dorchester and citywide services.',
    color: '#5B2D8E',
    cadence: 'Daily',
  },
  globe: {
    id: 'globe',
    name: 'Boston Globe',
    short: 'Globe',
    url: 'https://www.bostonglobe.com/metro',
    provides: 'Metro news feed, filtered to Dorchester and citywide services.',
    color: '#000000',
    cadence: 'Daily',
  },
  massgov: {
    id: 'massgov',
    name: 'Commonwealth of Massachusetts',
    short: 'MA',
    url: 'https://www.mass.gov',
    provides: 'Minimum wage, MassHealth, RAFT and state benefit rules.',
    color: '#14558F',
    cadence: 'Statutory',
  },
  dor101: {
    id: 'dor101',
    name: 'DOR101 directory',
    short: '101',
    url: '/about',
    provides: 'Listings verified by volunteers against the organisation named on each entry.',
    color: '#14304F',
    cadence: 'Rolling; each listing shows its own check date',
    licence: 'MIT (code) · CC BY 4.0 (listing data)',
  },
} as const satisfies Record<string, SourceInfo>;

export type SourceId = keyof typeof SOURCE_TABLE;
export const SOURCES: Record<SourceId, SourceInfo> = SOURCE_TABLE;

/** Map a news feed id from `feeds.ts` to a source badge. */
export const FEED_SOURCE: Record<string, SourceId> = {
  dotnews: 'dotnews',
  'boston-gov': 'bostongov',
  wbur: 'wbur',
  gbh: 'gbh',
  'globe-metro': 'globe',
  'mbta-alerts-blog': 'mbta',
};
