/**
 * Free coats and winter clothing in Dorchester and Boston.
 *
 * This dataset follows the same rules as `src/data/resources.ts`: one record
 * per place, every field checked against the organisation's own page, and a
 * `checkedOn` stamp on each record so the page can show its age instead of
 * asserting it is current. On top of the hand check, `/api/winter-clothing`
 * re-tests each record's official page at request time and the page shows
 * the result — a dead link is labelled "could not be checked", never buried.
 *
 * The honesty rules matter more here than usual, because the reader may be
 * cold right now:
 *   · A program that gives coats only through partners is kind `referral`,
 *     with the Dorchester partners named — never shown as a walk-in.
 *   · A seasonal drive carries its real dates and computes in/out of
 *     season; when a program's coat hours are not published, `hours` is
 *     left empty and the card says to call, instead of borrowing the
 *     building's office hours and pretending they are the coat closet's.
 *   · The last group (`locator`) never goes stale by construction: Mass
 *     2-1-1 and the other finders maintain their own listings daily.
 *
 * Records hand-checked on 2026-10-18 against each organisation's page.
 */

import { buildWeek, type WeeklyHours } from '@/lib/hours';
import type { Localized } from '@/i18n/runtime';

/** Matches the `clothing.kind.*` translation keys. */
export type ClothingKind = 'walkIn' | 'phoneFirst' | 'referral' | 'seasonal' | 'locator' | 'appointment';
/** Matches the `clothing.offer.*` translation keys. */
export type ClothingOffer = 'adultCoats' | 'kidsCoats' | 'hatsGloves' | 'boots' | 'layers' | 'baby' | 'warmSpace';
export type ClothingAudience = 'kids' | 'adults' | 'women' | 'families' | 'veterans';

export interface WinterClothingPlace {
  id: string;
  name: string;
  operator?: string;
  kind: ClothingKind;
  audiences: ClothingAudience[];
  offers: ClothingOffer[];
  summary: Localized<string>;
  /** The concrete next step: who to call, what to ask for, what to bring. */
  howToGet: string;
  eligibility?: string;
  address?: string;
  neighborhood: string;
  lat?: number;
  lng?: number;
  phone?: string;
  email?: string;
  website: string;
  hours?: WeeklyHours;
  hoursNote?: string;
  /** Dated programs; `from`/`to` are ISO dates when the org publishes them. */
  season?: { label: string; from?: string; to?: string };
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
  if (place.verification.status === 'needs-review') return 'stale';
  const days = clothingCheckedAge(place, now);
  if (days > CLOTHING_CRITICAL_DAYS) return 'critical';
  if (days > CLOTHING_STALE_DAYS) return 'stale';
  return 'fresh';
}

/** true/false when the program publishes dates; null when it runs year-round. */
export function inSeason(place: WinterClothingPlace, now = new Date()): boolean | null {
  if (!place.season?.from && !place.season?.to) return null;
  const t = now.getTime();
  if (place.season.from && t < new Date(`${place.season.from}T00:00:00`).getTime()) return false;
  if (place.season.to && t > new Date(`${place.season.to}T23:59:59`).getTime()) return false;
  return true;
}

const WEEKDAYS = (w: string[]): Record<number, string[]> => ({ 0: w, 1: w, 2: w, 3: w, 4: w, 5: [], 6: [] });

export const WINTER_CLOTHING: WinterClothingPlace[] = [
  {
    id: 'abcd-dorchester-nsc',
    name: 'ABCD Dorchester Neighborhood Service Center',
    operator: 'Action for Boston Community Development',
    kind: 'walkIn',
    audiences: ['families', 'kids', 'adults'],
    offers: ['adultCoats', 'kidsCoats', 'hatsGloves', 'layers'],
    summary: {
      en: 'The strongest Dorchester-local starting point: a clothing and essentials program at ABCD\'s Dorchester center, and a Cradles to Crayons partner that can order a free winter gear pack for children 12 and under.',
    },
    howToGet:
      'Walk in or call (617) 288-2700 and ask about the clothing and essentials program. For a child 12 or younger, staff can also place a Cradles to Crayons order (coat, warm clothes and more, free). Call first in cold snaps — popular sizes go fast.',
    eligibility: 'Open to Dorchester residents; some ABCD programs ask for proof of address and income. Cradles to Crayons packs are for children from birth to age 12 in families at or below 200% of the federal poverty level.',
    address: '110 Claybourne Street, Dorchester, MA 02124',
    neighborhood: 'Franklin, Dorchester',
    lat: 42.2959451,
    lng: -71.0708917,
    phone: '(617) 288-2700',
    website: 'https://bostonabcd.org/location/dorchester-neighborhood-service-center/',
    hours: buildWeek({ 0: ['11:00-17:00'], 1: ['09:00-17:00'], 2: ['09:00-17:00'], 3: ['09:00-17:00'], 4: ['09:00-17:00'], 5: [], 6: [] }),
    hoursNote: 'Center hours; ask which days the clothing program runs when you call.',
    requiresId: true,
    transit: 'Red Line to Fields Corner, then a short walk; buses 15, 17 and 19 stop nearby.',
    verification: { checkedOn: '2026-10-18', source: 'bostonabcd.org Dorchester NSC location page', status: 'verified' },
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
      'Ask a Dorchester partner to place an order for your child: ABCD Dorchester NSC (110 Claybourne St, 617-288-2700), the Family Nurturing Center (200 Bowdoin St, 617-474-1143), DotHouse Health patients (1353 Dorchester Ave, 617-740-2332), upham\'s Corner Health Center patients (415 Columbia Rd), the Epiphany School (617-545-8200), Walnut Grove Head Start (617-648-6388), WORK Inc (617-691-1604), or your child\'s school (Lee K-8, UP Academy and YMCA King K-6 are partners).',
    eligibility: 'Children from birth to age 12 whose families are at or below 200% of the federal poverty level, referred by a Service Partner.',
    address: '281 Newtonville Ave, Newton, MA 02460 (the Giving Factory — not a family walk-in site)',
    neighborhood: 'Via Dorchester partners',
    lat: 42.3527484,
    lng: -71.1983573,
    phone: '(617) 779-4700',
    website: 'https://www.cradlestocrayons.org/boston/family-assistance/',
    hoursNote: 'No direct family orders or walk-ins; partner offices keep their own hours.',
    verification: { checkedOn: '2026-10-18', source: 'cradlestocrayons.org family assistance page and partner list', status: 'verified' },
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
    season: { label: 'October 5, 2026 – January 9, 2027', from: '2026-10-05', to: '2027-01-09' },
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
      en: 'The largest free clothing distributor for adults in Boston, open 365 days a year downtown. Clothing appointments are first-come; emergency clothing is available in the lobby.',
    },
    howToGet:
      'Come early in the morning and ask for a Fresh Threads clothing appointment — slots fill daily. If you need something the same day, emergency clothing is handed out in the lobby. Calling (617) 542-4211 first is wise in a cold snap.',
    address: '39 Boylston Street, Boston, MA 02116',
    neighborhood: 'Downtown (Chinatown)',
    lat: 42.3524207,
    lng: -71.0635269,
    phone: '(617) 542-4211',
    website: 'https://stfrancishouse.org/day-shelter/',
    hours: buildWeek({ 0: ['06:30-15:00'], 1: ['06:30-15:00'], 2: ['06:30-14:00'], 3: ['06:30-15:00'], 4: ['06:30-15:00'], 5: ['06:30-15:00'], 6: ['06:30-15:00'] }),
    hoursNote: 'Day shelter hours, 365 days; clothing appointments are first-come, so morning arrival matters.',
    transit: 'Green Line to Boylston or Orange/Red to Downtown Crossing.',
    verification: { checkedOn: '2026-10-18', source: 'stfrancishouse.org day shelter page', status: 'verified' },
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
    eligibility: 'Women (all who identify as women). No ID or referral needed.',
    address: '67 Newbury Street, Boston, MA 02116',
    neighborhood: 'Back Bay',
    lat: 42.3521713,
    lng: -71.0739726,
    phone: '(617) 267-1722',
    website: 'https://womenslunchplace.org/help',
    hours: buildWeek({ 0: ['07:00-14:00'], 1: ['07:00-14:00'], 2: ['07:00-14:00'], 3: ['07:00-14:00'], 4: ['07:00-14:00'], 5: ['07:00-14:00'], 6: [] }),
    transit: 'Green Line to Arlington or Copley.',
    verification: { checkedOn: '2026-10-18', source: 'womenslunchplace.org help page', status: 'verified' },
  },
  {
    id: 'rosies-place',
    name: 'Rosie\'s Place',
    kind: 'phoneFirst',
    audiences: ['women'],
    offers: ['adultCoats', 'hatsGloves', 'layers', 'warmSpace'],
    summary: {
      en: 'A sanctuary for women in the South End. Winter clothing is arranged through the advocates, alongside meals, showers, laundry and legal help.',
    },
    howToGet:
      'Come during guest hours and ask an advocate about winter clothing, or call (617) 442-9322 first to ask what is available in your size. Women may bring their children.',
    eligibility: 'Women (all who identify as women); children welcome with their mothers.',
    address: '889 Harrison Ave, Boston, MA 02118',
    neighborhood: 'South End',
    lat: 42.3340958,
    lng: -71.0769040,
    phone: '(617) 442-9322',
    website: 'https://www.rosiesplace.org',
    hours: buildWeek(WEEKDAYS(['08:30-17:30'])),
    hoursNote: 'Guest hours; some services (including clothing) are arranged with advocates inside.',
    transit: 'Silver Line to Melnea Cass Blvd; bus 1 along Massachusetts Ave.',
    verification: { checkedOn: '2026-10-18', source: 'rosiesplace.org', status: 'verified' },
  },
  {
    id: 'yawkey-basic-needs',
    name: 'Yawkey Center — Basic Needs',
    operator: 'Catholic Charities Boston',
    kind: 'phoneFirst',
    audiences: ['families', 'adults', 'kids'],
    offers: ['adultCoats', 'kidsCoats', 'layers'],
    summary: {
      en: 'Catholic Charities\' Dorchester hub runs a Basic Needs and Emergency Living Assistance team alongside its food pantry; the team helps with essentials including warm clothing when available.',
    },
    howToGet:
      'Call (617) 506-6600 and ask the Basic Needs team what winter clothing is available before you travel — stock is donation-based and turns over quickly. The food pantry runs weekday mornings and early afternoons at the same address.',
    address: '185 Columbia Road, Dorchester, MA 02121',
    neighborhood: 'Uphams Corner / Four Corners',
    lat: 42.30984,
    lng: -71.07351,
    phone: '(617) 506-6600',
    website: 'https://www.ccab.org',
    hours: buildWeek(WEEKDAYS(['10:00-12:00', '13:00-14:00'])),
    hoursNote: 'Pantry windows shown; call for Basic Needs hours and clothing availability.',
    transit: 'Fairmount Line to Uphams Corner; buses 41, 45 and 17.',
    verification: { checkedOn: '2026-10-18', source: 'ccab.org Yawkey Center pages', status: 'verified' },
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
      'Call Social Services at (617) 318-6940 and ask about seasonal coat distributions and emergency clothing help. Emergency assistance covers ZIP codes 02121, 02125 and 02127; outside those, call (617) 542-5420.',
    eligibility: 'Emergency assistance is zoned: 02121, 02125, 02127 for this office.',
    address: '650 Dudley Street, Boston, MA 02125',
    neighborhood: 'Uphams Corner',
    lat: 42.3193152,
    lng: -71.0695763,
    phone: '(617) 318-6940',
    website: 'https://easternusa.salvationarmy.org/boston-kroc/help/',
    hoursNote: 'Social Services hours are not published for clothing — call first.',
    transit: 'Fairmount Line to Uphams Corner; buses 15, 17 and 41 stop close by.',
    verification: { checkedOn: '2026-10-18', source: 'easternusa.salvationarmy.org Boston Kroc help page', status: 'verified' },
  },
  {
    id: 'coats4vets',
    name: 'Coats4Vets',
    operator: 'Massachusetts Military Support Foundation',
    kind: 'appointment',
    audiences: ['veterans'],
    offers: ['adultCoats'],
    summary: {
      en: 'Free winter coats for veterans and active-duty service members, by registration. The closest standing center is in Sandwich on Cape Cod, so call about Boston-area distribution events before travelling.',
    },
    howToGet:
      'Register on the Coats4Vets site or call (617) 378-3974 / email coats4vets@mmsfi.org. Proof of service (DD-214, VA card or military ID) is required. Ask specifically about Boston-area distribution events — the standing pickup center is 117 Route 6A, Sandwich.',
    eligibility: 'Veterans and active-duty service members with proof of service; registration required.',
    neighborhood: 'By registration (events vary)',
    phone: '(617) 378-3974',
    email: 'coats4vets@mmsfi.org',
    website: 'https://mmsfi.org/coats4vets/',
    requiresId: true,
    verification: { checkedOn: '2026-10-18', source: 'mmsfi.org Coats4Vets page', status: 'verified' },
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
      en: 'The national coat-drive network\'s map of local nonprofits that receive and hand out free coats. Search by ZIP code to see who near Dorchester is stocked.',
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
      en: 'When Boston declares a cold emergency (wind chill at or below -10°F; an advisory at 0°F), warming centers open at BCYF community centers and library branches during their normal hours. The city posts the current list on this page. If you see someone outside unsheltered in extreme cold, call 911.',
    },
    howToGet:
      'Open boston.gov/cold for today\'s warming center list and cold-safety rules, including the state heat code (68°F by day, 64°F at night, September 15 to June 15) if your apartment is cold and the landlord will not act.',
    neighborhood: 'Citywide (BCYF and library branches)',
    website: 'https://www.boston.gov/cold',
    verification: { checkedOn: '2026-10-18', source: 'boston.gov cold weather resources', status: 'verified' },
  },
];

/** The never-stale backstops, rendered as their own band on the page. */
export const CLOTHING_LOCATORS: WinterClothingPlace[] = WINTER_CLOTHING.filter((p) => p.kind === 'locator');
/** Places (not finders), for the main list. */
export const CLOTHING_PLACES: WinterClothingPlace[] = WINTER_CLOTHING.filter((p) => p.kind !== 'locator');
