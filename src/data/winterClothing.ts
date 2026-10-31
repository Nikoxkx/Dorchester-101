/**
 * Free or reduced-cost winter-clothing help in and around Boston.
 *
 * Listings describe direct services, referrals and finders. Some details
 * still need review; every record carries a source-review date and residents
 * should contact providers before travelling. Website reachability is checked
 * separately and cannot establish whether a service or stock is available.
 * Published schedules can describe a site or phone line rather than clothing
 * distribution; undated programs are not assumed to operate year-round.
 * Collection dates describe donations, not a recipient's eligibility or the
 * availability of coats. Partner-only programs are not shown as walk-ins.
 */

import { buildWeek, BOSTON_TZ, zonedParts, type WeeklyHours } from '@/lib/hours';
import type { Localized } from '@/i18n/runtime';

/** Matches the `clothing.kind.*` translation keys. */
export type ClothingKind = 'walkIn' | 'phoneFirst' | 'referral' | 'seasonal' | 'locator' | 'appointment';
/** Matches the `clothing.offer.*` translation keys. */
export type ClothingOffer = 'adultCoats' | 'kidsCoats' | 'hatsGloves' | 'boots' | 'layers' | 'baby' | 'warmSpace' | 'clothingReferral';
export type ClothingAudience = 'kids' | 'adults' | 'women' | 'families' | 'veterans';

export interface WinterClothingPlace {
  id: string;
  name: string;
  operator?: string;
  kind: ClothingKind;
  audiences: ClothingAudience[];
  offers: ClothingOffer[];
  /** Some search tools can include reduced-cost as well as free programs. */
  cost?: 'free' | 'mixed';
  summary: Localized<string>;
  /** The concrete next step: who to call, what to ask for, what to bring. */
  howToGet: string;
  eligibility?: string;
  address?: string;
  /** Set false for a warehouse or administrative address that is not a visitor site. */
  directionsAllowed?: boolean;
  neighborhood: string;
  lat?: number;
  lng?: number;
  phone?: string;
  email?: string;
  website: string;
  hours?: WeeklyHours;
  hoursNote?: string;
  /** Dated programs; `from`/`to` are ISO dates when the org publishes them. */
  season?: { label: string; from?: string; to?: string; purpose?: 'collection' };
  requiresId?: boolean;
  transit?: string;
  languages?: string[];
  verification: { checkedOn: string; source: string; status: 'verified' | 'needs-review' };
}

export const CLOTHING_STALE_DAYS = 180;
export const CLOTHING_CRITICAL_DAYS = 365;

export function clothingCheckedAge(place: WinterClothingPlace, now = new Date()): number {
  const then = new Date(place.verification.checkedOn).getTime();
  if (Number.isNaN(then)) return Infinity;
  return Math.floor((now.getTime() - then) / 86_400_000);
}

export function clothingCheckLevel(place: WinterClothingPlace, now = new Date()): 'fresh' | 'stale' | 'critical' {
  const days = clothingCheckedAge(place, now);
  if (days > CLOTHING_CRITICAL_DAYS) return 'critical';
  if (days < 0 || place.verification.status === 'needs-review' || days > CLOTHING_STALE_DAYS) return 'stale';
  return 'fresh';
}

/** A published date window is evaluated on Boston's calendar. Null means no
 * dated window is recorded; it does not imply year-round availability. */
export function inSeason(place: WinterClothingPlace, now = new Date()): boolean | null {
  if (!place.season?.from && !place.season?.to) return null;
  const today = zonedParts(now, BOSTON_TZ).iso;
  if (place.season.from && today < place.season.from) return false;
  if (place.season.to && today > place.season.to) return false;
  return true;
}

export const WINTER_CLOTHING: WinterClothingPlace[] = [
  {
    id: 'abcd-dorchester-nsc',
    name: 'ABCD Dorchester Neighborhood Service Center',
    operator: 'Action for Boston Community Development',
    kind: 'phoneFirst',
    audiences: ['families', 'kids', 'adults'],
    offers: ['adultCoats', 'kidsCoats', 'hatsGloves', 'layers'],
    summary: {
      en: 'The strongest Dorchester-local starting point: a clothing and essentials program at ABCD\'s Dorchester center, and a Cradles to Crayons partner that can order a free winter gear pack for children 12 and under.',
    },
    howToGet:
      'Call (617) 288-2700 and ask about clothing and essentials, enrollment, availability and when to visit. For a child 12 or younger, ask whether staff can order items through Cradles to Crayons.',
    eligibility: 'Cradles to Crayons lists this partner for Boston, Malden, Medford and Everett residents at or below 200% of the federal poverty level. Its children’s items generally serve ages 0–12. Ask ABCD about enrollment and documents; rules for other programs may differ.',
    address: '110 Claybourne Street, Dorchester, MA 02124',
    neighborhood: 'Franklin, Dorchester',
    lat: 42.2959451,
    lng: -71.0708917,
    phone: '(617) 288-2700',
    website: 'https://bostonabcd.org/location/dorchester-neighborhood-service-center/',
    hours: buildWeek({ 0: ['11:00-17:00'], 1: ['09:00-17:00'], 2: ['09:00-17:00'], 3: ['09:00-17:00'], 4: ['09:00-17:00'], 5: [], 6: [] }),
    hoursNote: 'Center hours; ask which days the clothing program runs when you call.',
    transit: 'Red Line to Fields Corner, then walk; check MBTA for current bus connections and walking directions.',
    verification: { checkedOn: '2026-10-31', source: 'bostonabcd.org Dorchester NSC and Cradles to Crayons partner listing', status: 'needs-review' },
  },
  {
    id: 'cradles-to-crayons',
    name: 'Cradles to Crayons',
    operator: 'Cradles to Crayons Boston',
    kind: 'referral',
    audiences: ['kids', 'families'],
    offers: ['kidsCoats', 'hatsGloves', 'boots', 'layers', 'baby'],
    summary: {
      en: 'Free winter coats and full clothing packs for children from birth to age 12. Families cannot order directly — a local partner places the order, and many Dorchester organisations are partners.',
    },
    howToGet:
      'If you already receive services from a Cradles to Crayons partner, ask your caseworker if they can order for your child. Otherwise use the partner finder or call ABCD Dorchester at 617-288-2700 to ask whether you qualify for its services. Families cannot order directly or pick up at the Giving Factory.',
    eligibility: 'Children from birth to age 12 in families at or below 200% of the federal poverty level; families must be actively working with a Service Partner. Individual partners may have additional rules.',
    address: '281 Newtonville Ave, Newton, MA 02460 (the Giving Factory — not a family walk-in site)',
    directionsAllowed: false,
    neighborhood: 'Via Dorchester partners',
    lat: 42.3527484,
    lng: -71.1983573,
    phone: '(617) 779-4700',
    website: 'https://www.cradlestocrayons.org/boston/family-assistance/',
    hoursNote: 'No direct family orders or assistance pickup at the Giving Factory; partner offices keep their own hours.',
    verification: { checkedOn: '2026-10-31', source: 'cradlestocrayons.org family assistance and service partner resources', status: 'needs-review' },
  },
  {
    id: 'antons-coats-for-kids',
    name: 'Coats for Kids & Families',
    operator: 'Caring Partners / Anton\'s Cleaners',
    kind: 'seasonal',
    audiences: ['kids', 'adults', 'families'],
    offers: ['kidsCoats', 'adultCoats'],
    summary: {
      en: 'The Massachusetts winter coat drive: donated coats are cleaned free by Anton\'s and distributed free through more than 100 schools, nonprofits and shelters. This season\'s collection runs October 5, 2026 to January 9, 2027.',
    },
    howToGet:
      'Coats are handed out by the partner schools and nonprofits, not at the cleaners. Ask your child\'s school, shelter or community organisation whether they are distributing this season (Boston Uncornered at 222 Bowdoin St was a Dorchester collection point — confirm for this season). To donate a coat, drop it at any Anton\'s Cleaners during the drive.',
    neighborhood: 'Through local partners',
    website: 'https://antons.com/cfk/',
    season: { label: 'October 5, 2026 – January 9, 2027', from: '2026-10-05', to: '2027-01-09', purpose: 'collection' },
    verification: { checkedOn: '2026-10-18', source: 'antons.com Coats for Kids & Families page', status: 'verified' },
  },
  {
    id: 'st-francis-house',
    name: 'St. Francis House — Fresh Threads',
    operator: 'St. Francis House',
    kind: 'walkIn',
    audiences: ['adults'],
    offers: ['adultCoats', 'hatsGloves', 'boots', 'layers', 'warmSpace'],
    summary: {
      en: 'A downtown day shelter with the Fresh Threads clothing program, meals and other services. Call to confirm clothing availability and how to access it.',
    },
    howToGet:
      'Call (617) 542-4211 or visit 39 Boylston Street and ask how to access Fresh Threads. The day shelter is open daily; clothing program hours and availability may differ.',
    address: '39 Boylston Street, Boston, MA 02116',
    neighborhood: 'Downtown (Chinatown)',
    lat: 42.3524207,
    lng: -71.0635269,
    phone: '(617) 542-4211',
    website: 'https://stfrancishouse.org/day-shelter/',
    hours: buildWeek({ 0: ['06:30-15:00'], 1: ['06:30-15:00'], 2: ['06:30-14:00'], 3: ['06:30-15:00'], 4: ['06:30-15:00'], 5: ['06:30-15:00'], 6: ['06:30-15:00'] }),
    hoursNote: 'Day shelter hours shown; call for clothing program hours and availability.',
    transit: 'Green Line to Boylston or Orange/Red to Downtown Crossing.',
    verification: { checkedOn: '2026-10-31', source: 'stfrancishouse.org day shelter and find help pages', status: 'needs-review' },
  },
  {
    id: 'womens-lunch-place',
    name: 'Women\'s Lunch Place',
    kind: 'walkIn',
    audiences: ['women'],
    offers: ['adultCoats', 'hatsGloves', 'layers', 'warmSpace'],
    summary: {
      en: 'A women-only daytime shelter and advocacy center in Back Bay with free clothing — including winter coats when stocked — plus meals, showers and laundry. No questions at the door.',
    },
    howToGet: 'Walk in Monday to Saturday, 7 AM to 2 PM, and ask any staff member about clothing. Coats depend on donations, so ask early in the day.',
    eligibility: 'Women, including people who identify as women. Ask staff about any documentation or referral requirements.',
    address: '67 Newbury Street, Boston, MA 02116',
    neighborhood: 'Back Bay',
    lat: 42.3521713,
    lng: -71.0739726,
    phone: '(617) 267-1722',
    website: 'https://womenslunchplace.org/help',
    hours: buildWeek({ 0: ['07:00-14:00'], 1: ['07:00-14:00'], 2: ['07:00-14:00'], 3: ['07:00-14:00'], 4: ['07:00-14:00'], 5: ['07:00-14:00'], 6: [] }),
    transit: 'Green Line to Arlington or Copley.',
    verification: { checkedOn: '2026-10-31', source: 'womenslunchplace.org help page', status: 'needs-review' },
  },
  {
    id: 'rosies-place',
    name: 'Rosie\'s Place',
    kind: 'phoneFirst',
    audiences: ['women'],
    offers: ['clothingReferral', 'warmSpace'],
    summary: {
      en: 'A sanctuary for women in the South End. Advocates offer clothing referrals alongside meals, showers, laundry and legal help; clothing on site is not confirmed.',
    },
    howToGet:
      'Ask an advocate for a clothing referral, or call (617) 318-0237. The fall 2026 guide lists advocacy walk-in and phone hours Monday–Friday, 8:30 AM–6 PM. Confirm current hours and availability before going.',
    eligibility: 'Rosie’s Place serves women. Ask staff about service eligibility and whether children can accompany you for a clothing referral.',
    address: '889 Harrison Ave, Boston, MA 02118',
    neighborhood: 'South End',
    lat: 42.3340958,
    lng: -71.0769040,
    phone: '(617) 442-9322',
    website: 'https://www.rosiesplace.org/find-help',
    hoursNote: 'Advocacy hours may differ from the day shelter; call to confirm the current referral hours.',
    transit: 'Silver Line to Melnea Cass Blvd; bus 1 along Massachusetts Ave.',
    verification: { checkedOn: '2026-10-31', source: 'rosiesplace.org fall 2026 programs and services directory', status: 'needs-review' },
  },
  {
    id: 'yawkey-basic-needs',
    name: 'Yawkey Center — Basic Needs',
    operator: 'Catholic Charities Boston',
    kind: 'phoneFirst',
    audiences: ['families', 'adults', 'kids'],
    offers: ['adultCoats', 'kidsCoats', 'layers'],
    summary: {
      en: 'Catholic Charities’ Dorchester center has a Basic Needs team and food pantry. Call to ask about clothing help or referrals; current coat availability is not confirmed.',
    },
    howToGet:
      'Call (617) 506-6600 and ask the Basic Needs team if clothing help or a referral is available before you travel. The food pantry operates at the same address; call to confirm its hours.',
    address: '185 Columbia Road, Dorchester, MA 02121',
    neighborhood: 'Uphams Corner / Four Corners',
    lat: 42.306567,
    lng: -71.077044,
    phone: '(617) 506-6600',
    website: 'https://www.ccab.org/about-us/locations/',
    hoursNote: 'Call for Basic Needs hours and clothing help; this is not a confirmed coat distribution site.',
    transit: 'MBTA bus 16 stops at 185 Columbia Road; check current directions before travel.',
    verification: { checkedOn: '2026-10-31', source: 'ccab.org Yawkey Center and food pantry pages', status: 'needs-review' },
  },
  {
    id: 'kroc-center',
    name: 'Kroc Center — Social Services',
    operator: 'Salvation Army',
    kind: 'phoneFirst',
    audiences: ['families', 'adults', 'kids'],
    offers: ['adultCoats', 'kidsCoats', 'layers'],
    summary: {
      en: 'The Kroc Center\'s Social Services office in Uphams Corner provides emergency assistance for its Dorchester ZIP codes and runs seasonal distributions — ask what winter clothing and coat events are current.',
    },
    howToGet:
      'Call Social Services at (617) 318-6940 to ask about current holiday coat assistance, registration and availability. Emergency assistance covers ZIP codes 02121, 02125 and 02127; outside those, call (617) 542-5420.',
    eligibility: 'Emergency assistance is zoned to 02121, 02125 and 02127. The center says holiday assistance requires eligibility and pre-registration; ask about current deadlines and coat availability.',
    address: '650 Dudley Street, Boston, MA 02125',
    neighborhood: 'Uphams Corner',
    lat: 42.3193152,
    lng: -71.0695763,
    phone: '(617) 318-6940',
    website: 'https://easternusa.salvationarmy.org/boston-kroc/help/',
    hoursNote: 'Social Services hours are not published for clothing — call first.',
    transit: 'Fairmount Line to Uphams Corner; buses 15, 17 and 41 stop close by.',
    verification: { checkedOn: '2026-10-31', source: 'easternusa.salvationarmy.org Boston Kroc help page', status: 'needs-review' },
  },
  {
    id: 'coats4vets',
    name: 'Coats4Vets',
    operator: 'Massachusetts Military Support Foundation',
    kind: 'phoneFirst',
    audiences: ['veterans'],
    offers: ['adultCoats'],
    summary: {
      en: 'Coats4Vets describes free coats for veterans. Call to check current availability and Boston-area options; the foundation’s Sandwich center is on Cape Cod.',
    },
    howToGet:
      'Call (617) 378-3974 and ask about current coat availability and Boston-area events before traveling. The Coats4Vets page describes a 2023 program; confirm current registration and locations. The foundation’s Sandwich Empowerment Center is at 117 Route 6A.',
    eligibility: 'Ask about eligibility for current coat events. For Empowerment Center visits, the foundation says appointments and proof of service are required; rules for other events may differ.',
    neighborhood: 'Events vary; Sandwich center on Cape Cod',
    phone: '(617) 378-3974',
    website: 'https://mmsfi.org/coats4vets/',
    verification: { checkedOn: '2026-10-31', source: 'mmsfi.org Coats4Vets and Empowerment Centers pages', status: 'needs-review' },
  },
  {
    id: 'mass-211',
    name: 'Mass 2-1-1',
    operator: 'Mass 211 / United Way',
    kind: 'locator',
    audiences: ['kids', 'adults', 'women', 'families', 'veterans'],
    offers: ['adultCoats', 'kidsCoats', 'hatsGloves', 'boots', 'layers', 'baby', 'warmSpace'],
    summary: {
      en: 'The state\'s free, confidential help line — answered 24 hours a day in many languages. Specialists search today\'s listings for clothing programs, coat drives and warming centers near your ZIP code.',
    },
    howToGet:
      'Dial 2-1-1 (or 877-211-6277; TTY 508-370-4890) and ask for "free winter coats or clothing near me". Ask the specialist to check which places have your sizes today, and whether a warming center is open during a cold emergency.',
    neighborhood: 'By phone, statewide',
    phone: '2-1-1',
    website: 'https://mass211.org',
    hours: buildWeek({ 0: ['00:00-24:00'], 1: ['00:00-24:00'], 2: ['00:00-24:00'], 3: ['00:00-24:00'], 4: ['00:00-24:00'], 5: ['00:00-24:00'], 6: ['00:00-24:00'] }),
    languages: ['English', 'Spanish', 'Portuguese', 'Haitian Creole', 'interpretation in many languages'],
    verification: { checkedOn: '2026-10-18', source: 'mass211.org and mass.gov 2-1-1 pages', status: 'verified' },
  },
  {
    id: 'one-warm-coat',
    name: 'One Warm Coat — Nonprofit Locator',
    kind: 'locator',
    audiences: ['kids', 'adults', 'families'],
    offers: ['adultCoats', 'kidsCoats'],
    summary: {
      en: "A national map of local nonprofit partners that receive and distribute free coats. Search by ZIP code and call a partner to ask about availability; a listing does not guarantee stock.",
    },
    howToGet:
      'Open the locator, enter your ZIP code (02121, 02122, 02124, 02125), and call the partner listed before you go — One Warm Coat itself does not give coats to individuals, and partner stock changes daily.',
    neighborhood: 'Online finder',
    website: 'https://onewarmcoat.org/individual-coat-requests/',
    verification: { checkedOn: '2026-10-18', source: 'onewarmcoat.org individual coat requests page', status: 'verified' },
  },
  {
    id: 'findhelp-clothing',
    name: 'findhelp — Dorchester clothing search',
    kind: 'locator',
    cost: 'mixed',
    audiences: ['kids', 'adults', 'families'],
    offers: ['adultCoats', 'kidsCoats', 'layers'],
    summary: {
      en: 'A live directory of free and reduced-cost help. Its Dorchester clothing search gathers church closets, charity programs and school drives that are too small or new to appear in printed lists.',
    },
    howToGet: 'Search findhelp.org for "clothing" with a Dorchester ZIP code, then call the program before travelling — small closets keep irregular hours.',
    neighborhood: 'Online finder',
    website: 'https://www.findhelp.org',
    verification: { checkedOn: '2026-10-18', source: 'findhelp.org Dorchester clothing search', status: 'verified' },
  },
  {
    id: 'boston-cold',
    name: 'City of Boston cold weather page',
    operator: 'City of Boston',
    kind: 'locator',
    audiences: ['adults', 'families'],
    offers: ['warmSpace'],
    summary: {
      en: "When Boston declares a cold emergency (wind chill at or below -10°F for at least a day; an advisory at 0°F), warming centers open at BCYF community centers and library branches during their normal hours. The city posts the current list on this page. If you see someone outside unsheltered in extreme cold, call 911.",
    },
    howToGet:
      'Open boston.gov/cold for today\'s warming center list and cold-safety rules, including the state heat code (68°F by day, 64°F at night, September 15 to May 31 by default; local dates may vary) if your apartment is cold and the landlord will not act.',
    neighborhood: 'Citywide (BCYF and library branches)',
    website: 'https://www.boston.gov/cold',
    verification: { checkedOn: '2026-10-18', source: 'boston.gov cold weather resources', status: 'verified' },
  },
];

/** External help finders, rendered as their own band on the page. */
export const CLOTHING_LOCATORS: WinterClothingPlace[] = WINTER_CLOTHING.filter((p) => p.kind === 'locator');
/** Places (not finders), for the main list. */
export const CLOTHING_PLACES: WinterClothingPlace[] = WINTER_CLOTHING.filter((p) => p.kind !== 'locator');
