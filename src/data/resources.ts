/**
 * The DOR101 community dataset.
 *
 * One record per place, consumed by the map, the directory, the search index
 * and the print view. Nothing about a place is duplicated in a page component,
 * so correcting a phone number or a set of hours once fixes it everywhere.
 *
 * Every record carries its own verification stamp. `status: 'needs-review'` is
 * shown to residents rather than hidden, because an out-of-date pantry time is
 * worse than an honest warning. `verifiedOn` is real data used to compute the
 * staleness badge; it is never a hard-coded sentence in a footer.
 */

import { buildWeek, type WeeklyHours } from '@/lib/hours';
import type { Localized } from '@/i18n/runtime';

export type ResourceCategory = 'housing' | 'food' | 'health' | 'legal' | 'community' | 'school';

export interface ResourceRecord {
  id: string;
  name: string;
  category: ResourceCategory;
  /** Where a reader goes for the authoritative version of this record. */
  operator?: string;
  summary: Localized<string>;
  address: string;
  neighborhood: string;
  lat: number;
  lng: number;
  phone?: string;
  /** TTY/711 line, kept separate because it is an accessibility need not a nicety. */
  tty?: string;
  email?: string;
  website?: string;
  hours?: WeeklyHours;
  /** Free-text fallback when hours vary by program rather than by desk. */
  hoursNote?: string;
  languages?: string[];
  acceptsEbt?: boolean;
  requiresId?: boolean;
  /** Walking distance or connecting routes, phrased for a rider not a driver. */
  transit?: string;
  accessibility?: { stepFree: boolean; note?: string };
  eligibility?: string;
  services: string[];
  verification: { checkedOn: string; source: string; status: 'verified' | 'needs-review' };
  detailHref?: string;
}

/** Staleness thresholds used by the badge component. */
export const VERIFICATION_STALE_DAYS = 180;
export const VERIFICATION_CRITICAL_DAYS = 365;

export function verificationAge(record: ResourceRecord, now = new Date()): number {
  const then = new Date(record.verification.checkedOn).getTime();
  if (Number.isNaN(then)) return Infinity;
  return Math.floor((now.getTime() - then) / 86_400_000);
}

export function verificationLevel(record: ResourceRecord, now = new Date()): 'fresh' | 'stale' | 'critical' {
  if (record.verification.status === 'needs-review') return 'stale';
  const days = verificationAge(record, now);
  if (days > VERIFICATION_CRITICAL_DAYS) return 'critical';
  if (days > VERIFICATION_STALE_DAYS) return 'stale';
  return 'fresh';
}

const STD = (weekday: string[] = ['09:00-17:00']): Record<number, string[]> => ({
  0: weekday,
  1: weekday,
  2: weekday,
  3: weekday,
  4: weekday,
  5: [],
  6: [],
});

export const RESOURCES: ResourceRecord[] = [
  {
    id: 'bha',
    name: 'Boston Housing Authority',
    category: 'housing',
    operator: 'City of Boston',
    summary: {
      en: 'Public housing and the Housing Choice Voucher program, plus help for tenants already in a unit.',
      es: 'Vivienda pública y el programa de vales de selección de vivienda, además de ayuda para inquilinos.',
      ht: 'Lojman piblik ak pwogram vouch lojman, ansanm ak èd pou lokatè ki nan yon inite deja.',
    },
    address: '100 West Springfield Street, Boston, MA 02116',
    neighborhood: 'South End (citywide office)',
    lat: 42.3358,
    lng: -71.0723,
    phone: '(617) 988-4000',
    tty: '(617) 427-9604',
    website: 'https://www.bostonhousing.org',
    hours: buildWeek(STD(['08:30-17:00'])),
    languages: ['English', 'Spanish', 'Haitian Creole', 'Vietnamese', 'Mandarin', 'Cape Verdean Creole', 'Somali', 'Portuguese'],
    accessibility: { stepFree: true, note: 'Accessible entrance on West Springfield Street; interpreters on request.' },
    eligibility: 'Boston residents. Income limits follow HUD AMI bands for the Boston metro area.',
    services: ['Section 8 Housing Choice Voucher', 'Public housing waitlist', 'Emergency Housing Assistance', 'Tenant services', 'Family Support Center'],
    verification: { checkedOn: '2026-06-18', source: 'bostonhousing.org contact page', status: 'verified' },
    detailHref: '/affordable-housing',
    transit: 'Bus 4, 7, 10, 39, 501, 504 to Mass Ave at West Springfield St. Green Line E to Kenmore.',
  },
  {
    id: 'gbfb-dorchester',
    name: 'Greater Boston Food Bank Dorchester Distribution',
    category: 'food',
    operator: 'Greater Boston Food Bank',
    summary: {
      en: 'The largest food bank in New England. Mobile and on-site distribution across Dorchester, no documents needed.',
      es: 'El banco de alimentos más grande de Nueva Inglaterra. Reparto móvil y en el sitio en Dorchester, sin documentos.',
      ht: 'Pi gwo bank manje nan New England. Distribisyon mobil ak sou plas nan Dorchester, san dokiman.',
    },
    address: '400 Atha Street, Dorchester, MA 02124',
    neighborhood: 'Uphams Corner',
    lat: 42.3159,
    lng: -71.0688,
    phone: '(617) 427-5200',
    website: 'https://gbfb.org',
    hours: buildWeek({ 0: ['09:00-15:00'], 1: ['09:00-15:00'], 2: ['09:00-15:00'], 3: ['09:00-15:00'], 4: ['09:00-15:00'], 5: [], 6: [] }),
    languages: ['English', 'Spanish', 'Haitian Creole', 'Portuguese'],
    acceptsEbt: true,
    accessibility: { stepFree: true },
    eligibility: 'Anyone in eastern Massachusetts who says they need food. No ID, no income test.',
    services: ['Grocery distribution', 'Produce', 'Baby food and formula', 'Shelf-stable items'],
    verification: { checkedOn: '2026-06-20', source: 'gbfb.org distribution schedule', status: 'verified' },
    detailHref: '/food',
    transit: '10 min walk from Uphams Corner (Fairmount Line). Bus 10, 23, 24, 26 on Columbia Road.',
  },
  {
    id: 'codman-square-health',
    name: 'Codman Square Neighborhood Health Center',
    category: 'health',
    operator: 'Boston Medical Center',
    summary: {
      en: 'Primary care, dental, behavioral health and a food pantry on Washington Street. Sliding-scale fees.',
      es: 'Atención primaria, dental, salud conductual y una despensa en Washington Street. Cobro según ingresos.',
      ht: 'Swen premyè, dan, sante mantal ak yon depo manje sou Washington Street. Tarif selon revni.',
    },
    address: '637 Washington Street, Dorchester, MA 02124',
    neighborhood: 'Codman Square',
    lat: 42.28786,
    lng: -71.07212,
    phone: '(617) 825-9000',
    website: 'https://www.bmc.org/codman-square',
    hours: buildWeek({ 0: ['08:00-20:00'], 1: ['08:00-20:00'], 2: ['08:00-20:00'], 3: ['08:00-20:00'], 4: ['08:00-20:00'], 5: ['09:00-13:00'], 6: [] }),
    languages: ['English', 'Spanish', 'Haitian Creole', 'Cape Verdean Creole', 'Portuguese', 'Somali'],
    accessibility: { stepFree: true },
    eligibility: 'Open to all ages. No one is turned away for inability to pay.',
    services: ['Family medicine', 'Pediatrics', 'Dental', 'Behavioral health', 'On-site food pantry', 'WIC referrals'],
    verification: { checkedOn: '2026-06-12', source: 'bmc.org location page', status: 'verified' },
    transit: 'Bus 23, 24, 26, 47, 51 stop at Codman Square. 8 min walk from Four Corners/Geneva.',
  },
  {
    id: 'bostons-food-district',
    name: 'Project Bread FoodSource Hotline',
    category: 'food',
    operator: 'Project Bread',
    summary: {
      en: 'One phone call finds the closest pantry, summer meal site or help signing up for SNAP. Interpreters on the line.',
      es: 'Una llamada encuentra la despensa más cercana, un sitio de comidas de verano o ayuda para inscribirse en SNAP.',
      ht: 'Yon apèl jwenn depo manje ki pi pre, yon sit manje ete oswa èd pou enskri nan SNAP.',
    },
    address: 'Statewide line (serves Dorchester)',
    neighborhood: 'Phone service',
    lat: 42.3105,
    lng: -71.063,
    phone: '1-800-645-8333',
    website: 'https://www.projectbread.org/foodsource',
    hours: buildWeek({ 0: ['08:00-17:00'], 1: ['08:00-17:00'], 2: ['08:00-17:00'], 3: ['08:00-17:00'], 4: ['08:00-17:00'], 5: [], 6: [] }),
    languages: ['English', 'Spanish', 'Portuguese', 'Vietnamese', 'Haitian Creole', 'Mandarin', 'Cantonese', 'Somali'],
    accessibility: { stepFree: true, note: 'Telephone service. 711 for relay.' },
    eligibility: 'Anyone in Massachusetts.',
    services: ['Food resource referral', 'SNAP application help', 'School meal questions', 'Senior food programs'],
    verification: { checkedOn: '2026-06-25', source: 'projectbread.org', status: 'verified' },
    detailHref: '/food',
  },
  {
    id: 'raft-mass',
    name: 'RAFT Rental Assistance (Residential Assistance for Families in Transition)',
    category: 'housing',
    operator: 'MassHousing',
    summary: {
      en: 'Up to $12,600 in back rent, first and last month rent or security deposit for households at or below 50% AMI.',
      es: 'Hasta $12,600 para renta atrasada, primer y último mes o depósito para hogares al 50% del AMI.',
    },
    address: 'Apply through a local assistance partner',
    neighborhood: 'Citywide',
    lat: 42.3318,
    lng: -71.0569,
    phone: '(866) 288-3257',
    website: 'https://www.mass.gov/info-details/residential-assistance-for-families-in-transition',
    languages: ['English', 'Spanish', 'Haitian Creole', 'Vietnamese', 'Portuguese', 'Somali', 'Mandarin'],
    accessibility: { stepFree: true, note: 'Online application, screen-reader tested by the state.' },
    eligibility: 'Income at or below 50% of Area Median Income for the Boston metro area, plus a rental arrears or eviction risk.',
    services: ['Rent arrears', 'First and last month', 'Security deposit', 'Utility arrears'],
    verification: { checkedOn: '2026-07-02', source: 'mass.gov RAFT program page', status: 'verified' },
    detailHref: '/affordable-housing',
  },
  {
    id: 'gbLS-dorchester',
    name: 'Greater Boston Legal Services, Dorchester Office',
    category: 'legal',
    operator: 'Greater Boston Legal Services',
    summary: {
      en: 'Free lawyers for eviction defense, unsafe housing, benefits appeals, domestic violence and immigration.',
      es: 'Abogados gratuitos para desalojos, viviendas inseguras, apelaciones de beneficios y migración.',
      ht: 'Avoka gratis pou defans kont eviksyon, lojman ki pa an sekirite, apèl benefis ak imigrasyon.',
    },
    address: '50 Old Colony Avenue, Boston, MA 02126',
    neighborhood: 'Dorchester Heights',
    lat: 42.3146,
    lng: -71.0564,
    phone: '(617) 603-4400',
    website: 'https://www.gbls.org',
    hours: buildWeek(STD(['09:00-16:30'])),
    languages: ['English', 'Spanish', 'Haitian Creole', 'Vietnamese', 'Portuguese', 'Cape Verdean Creole'],
    accessibility: { stepFree: true },
    eligibility: 'Income-qualified Boston-area residents. Walk-in intake on Tuesdays.',
    services: ['Eviction defense', 'Habitability and repairs', 'SNAP and TAFAC appeals', 'Guardianship', 'Immigration relief'],
    verification: { checkedOn: '2026-06-10', source: 'gbls.org office list', status: 'verified' },
    detailHref: '/resources',
    transit: 'Bus 7 and 10 to Neponset Vale. 12 min walk from Savin Hill (Red Line).',
  },
  {
    id: 'dotbdc',
    name: 'Dorchester Bay Economic Development Corporation',
    category: 'community',
    summary: {
      en: 'Neighborhood nonprofit running affordable housing, youth programs and small-business help around Columbia Point.',
      es: 'Organización vecinal con vivienda asequible, programas juveniles y apoyo a negocios.',
    },
    address: '594 Columbia Road, Dorchester, MA 02127',
    neighborhood: 'Uphams Corner',
    lat: 42.31662,
    lng: -71.06618,
    phone: '(617) 825-4200',
    website: 'https://www.dbedc.org',
    hours: buildWeek(STD(['09:00-17:00'])),
    accessibility: { stepFree: true },
    services: ['Affordable housing development', 'Weatherization assistance', 'Youth workforce programs', 'Small business lending'],
    verification: { checkedOn: '2026-05-28', source: 'organization website', status: 'needs-review' },
    transit: 'Bus 10 and 16 stop at Columbia Road. 6 min walk from JFK/UMass.',
  },
  {
    id: 'fields-corner-bpc',
    name: 'Fields Corner Business and Civic Association',
    category: 'community',
    summary: {
      en: 'Neighborhood group for the station area, main-streets programs and the community benefit agreements around Fields Corner.',
    },
    address: '1489 Dorchester Avenue, Dorchester, MA 02122',
    neighborhood: 'Fields Corner',
    lat: 42.29955,
    lng: -71.06205,
    hours: buildWeek({ 0: [], 1: ['17:00-19:00'], 2: [], 3: [], 4: ['17:00-19:00'], 5: [], 6: [] }),
    hoursNote: 'Meets fortnightly in the evening; email for the next date.',
    services: ['Neighborhood meetings', 'Main Streets program', 'Community board representation'],
    verification: { checkedOn: '2026-04-15', source: 'meeting minutes', status: 'needs-review' },
    transit: 'At the Fields Corner headhouse (Red Line, bus 7, 9, 11, 16, 17).',
  },
  {
    id: 'grove-hall-library',
    name: 'BPL Grove Hall Branch Library',
    category: 'school',
    operator: 'Boston Public Library',
    summary: {
      en: 'Books, hotspot and Chromebook lending, ESL conversation circles, citizenship study help and free printing.',
      es: 'Préstamo de libros e internet, círculos de conversación de inglés y ayuda para el examen de ciudadanía.',
      ht: 'Livè, preta-hotspot, sèk konvèsasyon angle, ak èd pou egzamen sitwayen.',
    },
    address: '41 Geneva Avenue, Dorchester, MA 02119',
    neighborhood: 'Grove Hall',
    lat: 42.30429,
    lng: -71.08552,
    phone: '(617) 892-7710',
    website: 'https://www.bpl.org/grovehall',
    hours: buildWeek({ 0: ['10:00-20:00'], 1: ['10:00-20:00'], 2: ['10:00-20:00'], 3: ['10:00-20:00'], 4: ['10:00-18:00'], 5: ['10:00-17:00'], 6: [] }),
    languages: ['English', 'Spanish', 'Haitian Creole', 'Cape Verdean Creole', 'Somali'],
    acceptsEbt: false,
    accessibility: { stepFree: true, note: 'Elevator to all floors, hearing loop in the meeting room.' },
    services: ['Hotspot and device lending', 'ESL classes', 'Citizenship prep', 'Homework help', 'Notary referrals'],
    verification: { checkedOn: '2026-06-22', source: 'bpl.org branch hours', status: 'verified' },
    transit: '5 min walk from Four Corners/Geneva (Fairmount Line). Bus 19, 23, 24, 29.',
  },
  {
    id: 'dotmen-healthy-start',
    name: 'Dorchester Men and Boys Healthy Start',
    category: 'community',
    summary: {
      en: 'Mentoring, job-readiness and family support for young men in lower Dorchester.',
    },
    address: '1259 Massachusetts Avenue, Dorchester, MA 02125',
    neighborhood: 'Uphams Corner',
    lat: 42.31443,
    lng: -71.07184,
    phone: '(617) 261-2222',
    hours: buildWeek(STD(['09:00-18:00'])),
    services: ['Mentoring', 'Job readiness', 'Fatherhood programs'],
    verification: { checkedOn: '2026-03-19', source: 'community referral', status: 'needs-review' },
    transit: 'Bus 10 and 23 on Massachusetts Avenue.',
  },
  {
    id: 'savin-hill-corridor',
    name: 'Savin Hill/Columbia Point Neighborhood Services',
    category: 'community',
    summary: {
      en: 'Tenant liaison desk for the mixed-income redevelopment around the former Columbia Point housing project.',
    },
    address: '121 Morris Street, Dorchester, MA 02125',
    neighborhood: 'Columbia Point',
    lat: 42.32449,
    lng: -71.05271,
    hours: buildWeek({ 0: ['09:00-16:00'], 1: ['09:00-16:00'], 2: [], 3: ['09:00-16:00'], 4: ['09:00-16:00'], 5: [], 6: [] }),
    services: ['Tenant liaison', 'Section 8 portability advice', 'Building maintenance intake'],
    verification: { checkedOn: '2026-02-08', source: 'partner organization', status: 'needs-review' },
    transit: 'Bus 16 and 41 on Morris Street. 10 min walk from JFK/UMass.',
  },
  {
    id: 'dot-health-center',
    name: 'Boston Public Health Commission Dorchester Health Center',
    category: 'health',
    summary: {
      en: 'Walk-in testing, sexual health, youth clinic and nurse line, with no cost for most services.',
      es: 'Pruebas sin cita, salud sexual, clínica para jóvenes y línea de enfermería, sin costo en la mayoría de servicios.',
    },
    address: '1001 Massachusetts Avenue, Dorchester, MA 02124',
    neighborhood: 'Uphams Corner',
    lat: 42.30407,
    lng: -71.07236,
    phone: '(617) 501-7500',
    website: 'https://www.bphc.org',
    hours: buildWeek({ 0: ['09:00-16:00'], 1: ['09:00-16:00'], 2: ['09:00-16:00'], 3: ['10:00-18:00'], 4: ['09:00-16:00'], 5: [], 6: [] }),
    languages: ['English', 'Spanish', 'Haitian Creole', 'Portuguese'],
    accessibility: { stepFree: true },
    services: ['HIV and STI testing', 'Contraception', 'Youth clinic', 'Needle exchange', 'Nurse triage line'],
    verification: { checkedOn: '2026-06-05', source: 'bphc.org site', status: 'verified' },
    transit: 'Bus 23 and 24 stop at the door. 8 min walk from Four Corners/Geneva.',
  },
  {
    id: 'masshealth-navigate',
    name: 'Health Safety Net Navigators (Dorchester)',
    category: 'health',
    summary: {
      en: 'Free help signing up for MassHealth and the Health Safety Net if you have no insurance and no papers.',
      es: 'Ayuda gratuita para inscribirse en MassHealth y el Health Safety Net, sin importar su estatus migratorio.',
    },
    address: 'Embedded at BMC Codman Square and several community sites',
    neighborhood: 'Codman Square',
    lat: 42.2879,
    lng: -71.0722,
    phone: '(617) 638-8211',
    hours: buildWeek(STD(['09:00-16:00'])),
    languages: ['English', 'Spanish', 'Haitian Creole', 'Somali', 'Vietnamese'],
    services: ['MassHealth enrollment', 'Retroactive coverage', 'Hospital bill forgiveness'],
    verification: { checkedOn: '2026-06-01', source: 'bphc.org and partner sites', status: 'verified' },
    detailHref: '/resources',
  },
  {
    id: 'boston-language-access',
    name: 'City of Boston Language Access Help Line',
    category: 'community',
    operator: 'City of Boston',
    summary: {
      en: 'If a city office will not give you an interpreter, this line resolves it. City staff must provide language access free of charge.',
      es: 'Si una oficina municipal no le da un intérprete, esta línea lo resuelve. Es gratis.',
    },
    address: 'Citywide service',
    neighborhood: 'Citywide',
    lat: 42.3601,
    lng: -71.0581,
    phone: '311 (or 617-635-4500 from a cell)',
    hours: buildWeek({ 0: ['08:00-18:00'], 1: ['08:00-18:00'], 2: ['08:00-18:00'], 3: ['08:00-18:00'], 4: ['08:00-18:00'], 5: ['08:00-18:00'], 6: ['09:00-17:00'] }),
    languages: ['English', 'Spanish', 'Haitian Creole', 'Portuguese', 'Vietnamese', 'Somali', 'Mandarin', 'Cantonese', 'Arabic', 'Cape Verdean Creole'],
    accessibility: { stepFree: true, note: 'Interpreter on three-way conference within the call.' },
    services: ['Interpreter complaints', 'Translated forms request', '311 service requests'],
    verification: { checkedOn: '2026-06-30', source: 'boston.gov language access', status: 'verified' },
  },
  {
    id: 'st-mark-community-meal',
    name: "St. Mark's Church Community Meal",
    category: 'food',
    summary: {
      en: 'Saturday hot meal and a food closet for the Fields Corner area. No questions asked.',
      vi: 'Bữa ăn nóng thứ Bảy và quầy thực phẩm cho khu Fields Corner. Không hỏi gì.',
    },
    address: '1725 Dorchester Avenue, Dorchester, MA 02124',
    neighborhood: 'Fields Corner',
    lat: 42.29925,
    lng: -71.06286,
    phone: '(617) 825-2851',
    hours: buildWeek({ 0: [], 1: [], 2: [], 3: [], 4: [], 5: ['11:00-13:00'], 6: [] }),
    languages: ['English', 'Vietnamese'],
    services: ['Hot meal', 'Food closet', 'Clothing'],
    verification: { checkedOn: '2026-01-24', source: 'church bulletin', status: 'needs-review' },
    transit: '3 min walk from the Fields Corner headhouse.',
    detailHref: '/food',
  },
  {
    id: 'dorcester-neighborhood-health',
    name: 'VietAID Community Center',
    category: 'community',
    summary: {
      en: 'Elder programs, youth tutoring, citizenship classes and food assistance for the Vietnamese community of Fields Corner.',
      vi: 'Chương trình cho người cao tuổi, kèm cặp học sinh, lớp quốc tịch và hỗ trợ thực phẩm cho cộng đồng Việt.',
    },
    address: '181 Washington Street, Dorchester, MA 02124',
    neighborhood: 'Four Corners',
    lat: 42.30333,
    lng: -71.07495,
    phone: '(617) 436-0423',
    website: 'https://vietaid.org',
    hours: buildWeek(STD(['09:00-17:00'])),
    languages: ['English', 'Vietnamese', 'Mandarin', 'Cantonese'],
    accessibility: { stepFree: true },
    services: ['Senior congregate meals', 'Citizenship classes', 'Youth tutoring', 'Food pantry', 'Immigration paperwork help'],
    verification: { checkedOn: '2026-06-14', source: 'vietaid.org', status: 'verified' },
    transit: 'Bus 23 and 24 on Washington Street. 6 min walk from Four Corners/Geneva.',
    detailHref: '/resources',
  },
  {
    id: 'roxbury-charter-dorchester',
    name: 'Dorchester Community Learning Center, Madison Park',
    category: 'school',
    operator: 'Boston Public Schools',
    summary: {
      en: 'Evening adult English classes, GO-TEN high school completion and free computer labs at four Dorchester campuses.',
    },
    address: '444 Green Street, Dorchester, MA 02125',
    neighborhood: 'Four Corners',
    lat: 42.30743,
    lng: -71.07871,
    phone: '(617) 242-5392',
    website: 'https://www.bps.org',
    hours: buildWeek({ 0: ['16:00-21:00'], 1: ['16:00-21:00'], 2: ['16:00-21:00'], 3: ['16:00-21:00'], 4: ['16:00-20:00'], 5: ['09:00-13:00'], 6: [] }),
    languages: ['English', 'Spanish', 'Haitian Creole', 'Portuguese', 'Vietnamese', 'Somali', 'Arabic'],
    accessibility: { stepFree: true, note: 'Interpreters available for enrollment appointments.' },
    services: ['Adult English (ESOL)', 'GO-TEN diploma', 'Citizenship prep', 'Digital skills', 'Free after-hours childcare on site'],
    verification: { checkedOn: '2026-05-30', source: 'DorchesterCLC program calendar', status: 'verified' },
    transit: '5 min walk from Four Corners/Geneva (Fairmount Line). Bus 23, 24, 29.',
  },
  {
    id: 'city-life-vida-urbana',
    name: 'City Life/Vida Urbana Tenant Union',
    category: 'legal',
    summary: {
      en: 'Tenant organizing, free legal clinics and help with rent strikes, foreclosures and habitability.',
      es: 'Organización de inquilinos, clínicas legales gratuitas y ayuda con huelgas de renta.',
    },
    address: '564 Columbus Avenue, Jamaica Plain (serves Dorchester)',
    neighborhood: 'Jamaica Plain line',
    lat: 42.31056,
    lng: -71.09336,
    phone: '(617) 522-1030',
    website: 'https://www.clvu.org',
    hours: buildWeek({ 0: ['10:00-17:00'], 1: ['10:00-17:00'], 2: ['10:00-17:00'], 3: ['10:00-19:00'], 4: ['10:00-17:00'], 5: [], 6: [] }),
    languages: ['English', 'Spanish'],
    accessibility: { stepFree: true },
    services: ['Weekly tenant clinic', 'Rent strike support', 'Code-enforcement complaints', 'Language-access advocacy'],
    verification: { checkedOn: '2026-06-16', source: 'clvu.org', status: 'verified' },
    transit: 'Bus 22 and 39 on Columbus Avenue. Orange Line to Jackson Square then bus 23.',
    detailHref: '/faq',
  },
  {
    id: 'dudley-food-coop',
    name: 'Dudley Neighborhood Farm and Food Co-op',
    category: 'food',
    summary: {
      en: 'Low-cost grocery co-op plus a farm stand on 14 acres in North Dorchester. Members get discounted produce.',
    },
    address: '99 Day Street, Dorchester, MA 02119',
    neighborhood: 'Grove Hall',
    lat: 42.31081,
    lng: -71.08499,
    phone: '(617) 427-3300',
    website: 'https://www.dudleyfood.com',
    hours: buildWeek({ 0: ['10:00-18:00'], 1: ['10:00-18:00'], 2: ['10:00-18:00'], 3: ['10:00-18:00'], 4: ['10:00-19:00'], 5: ['10:00-18:00'], 6: [] }),
    acceptsEbt: true,
    accessibility: { stepFree: true },
    services: ['Grocery co-op', 'Farm stand', 'Cooking classes', 'SNAP matching (Double Up)'],
    verification: { checkedOn: '2026-06-09', source: 'co-op published hours', status: 'verified' },
    transit: 'Bus 23, 24 and 29 on Geneva Avenue.',
  },
  {
    id: 'boston-public-defender',
    name: 'CPCS Walk-In Intake (Boston)',
    category: 'legal',
    operator: 'Committee for Public Counsel Services',
    summary: {
      en: 'Free lawyers if you are charged with a crime and cannot pay. Walk in, bring your summons.',
    },
    address: '24 New Sudbury Street, Boston, MA 02114',
    neighborhood: 'Downtown Crossing',
    lat: 42.36112,
    lng: -71.05791,
    phone: '(617) 723-8160',
    hours: buildWeek({ 0: ['08:30-16:30'], 1: ['08:30-16:30'], 2: ['08:30-16:30'], 3: ['08:30-19:00'], 4: ['08:30-16:30'], 5: ['08:30-13:00'], 6: [] }),
    languages: ['English', 'Spanish', 'Haitian Creole', 'Portuguese', 'Vietnamese', 'Mandarin'],
    accessibility: { stepFree: true },
    services: ['Criminal defense intake', 'Interpreter on site', 'Parent in a child-support case'],
    verification: { checkedOn: '2026-05-19', source: 'cpcs state site', status: 'needs-review' },
    transit: 'Orange and Blue Line to State Street. 4 min walk.',
  },
  {
    id: 'dorchester-employment',
    name: 'Dorchester Workplace, Inc.',
    category: 'community',
    summary: {
      en: 'Vocational training and paid work experience for residents with disabilities or a barrier to employment.',
    },
    address: '1999 Dorchester Avenue, Dorchester, MA 02124',
    neighborhood: 'Fields Corner',
    lat: 42.29768,
    lng: -71.06372,
    phone: '(617) 825-8030',
    hours: buildWeek(STD(['08:30-16:30'])),
    accessibility: { stepFree: true },
    services: ['Job coaching', 'Transitional employment', 'Benefits counseling so work does not cut a check'],
    verification: { checkedOn: '2026-04-28', source: 'partner referral', status: 'needs-review' },
    transit: '2 min walk from the Ashmont-bound Fields Corner platform.',
  },
  {
    id: 'codman-square-food-pantry',
    name: 'Codman Square Food Pantry',
    category: 'food',
    summary: {
      en: 'Pantry run out of the health center. Same-day groceries, diapers and formula for Dorchester households.',
      es: 'Despensa en el centro de salud. Comidas, pañales y fórmula el mismo día para familias de Dorchester.',
    },
    address: '637 Washington Street, Dorchester, MA 02124',
    neighborhood: 'Codman Square',
    lat: 42.28794,
    lng: -71.07198,
    phone: '(617) 825-9660',
    hours: buildWeek({ 0: ['10:00-12:00'], 1: ['10:00-12:00'], 2: [], 3: ['10:00-12:00'], 4: ['13:00-15:00'], 5: [], 6: [] }),
    languages: ['English', 'Spanish', 'Cape Verdean Creole', 'Somali'],
    requiresId: false,
    accessibility: { stepFree: true },
    services: ['Groceries', 'Baby supplies', 'Nutrition counseling on request'],
    verification: { checkedOn: '2026-06-12', source: 'health center pantry page', status: 'verified' },
    transit: 'Bus 23, 24, 26, 47 at Codman Square.',
    detailHref: '/food',
  },
  {
    id: 'boston-neighborhood-housing',
    name: 'Boston Neighborhood Housing Services, Dorchester',
    category: 'housing',
    summary: {
      en: 'Homeownership counseling, down-payment help, foreclosure prevention and small repair loans.',
      es: 'Asesoría para comprar vivienda, ayuda para el enganche y prevención de ejecución hipotecaria.',
    },
    address: '2 Ashford Street, Jamaica Plain (serves Dorchester)',
    neighborhood: 'JP/Dorchester line',
    lat: 42.31861,
    lng: -71.09558,
    phone: '(617) 241-2662',
    website: 'https://www.bnhs.org',
    hours: buildWeek(STD(['09:00-17:00'])),
    languages: ['English', 'Spanish', 'Haitian Creole'],
    accessibility: { stepFree: true },
    services: ['HUD-certified counseling', 'Down payment assistance', 'Foreclosure prevention', 'Home repair loans'],
    verification: { checkedOn: '2026-06-03', source: 'bnhs.org', status: 'verified' },
    transit: 'Orange Line to Jackson Square, then bus 23 or 28.',
  },
  {
    id: 'massaccess',
    name: 'MassAccess Affordable Housing Portal',
    category: 'housing',
    operator: 'Governor\u2019s Office of Housing and Urban Development',
    summary: {
      en: 'The single online place to search and apply for income-restricted apartments in Massachusetts.',
      es: 'El lugar único en línea para buscar y solicitar apartamentos de ingresos limitados en Massachusetts.',
    },
    address: 'Online service',
    neighborhood: 'Statewide',
    lat: 42.3555,
    lng: -71.0565,
    website: 'https://www.massaccess.org',
    languages: ['English', 'Spanish', 'Haitian Creole', 'Portuguese', 'Vietnamese', 'Simplified Chinese', 'Somali', 'Cape Verdean Creole', 'Arabic'],
    accessibility: { stepFree: true, note: 'Portal is WCAG 2.1 AA and offers the same nine languages.' },
    services: ['Property listings', 'One application for many buildings', 'Waitlist status'],
    verification: { checkedOn: '2026-06-27', source: 'massaccess.org', status: 'verified' },
    detailHref: '/affordable-housing',
  },
  {
    id: 'boston-housing-partnership',
    name: 'Boston Housing Lottery Information (GOH)',
    category: 'housing',
    operator: 'City of Boston Get on Board housing team',
    summary: {
      en: 'The city runs one application for most affordable rentals. Check whether you need a Boston residency preference.',
      es: 'La ciudad administra una sola solicitud para la mayoría de los alquileres asequibles.',
    },
    address: '1 City Hall Plaza, Boston, MA 02201',
    neighborhood: 'Government Center',
    lat: 42.3602,
    lng: -71.0584,
    phone: '(617) 635-4287',
    website: 'https://www.boston.gov/departments/housing',
    hours: buildWeek(STD(['09:00-17:00'])),
    languages: ['English', 'Spanish', 'Haitian Creole', 'Vietnamese', 'Mandarin', 'Somali', 'Portuguese', 'Arabic'],
    accessibility: { stepFree: true, note: 'City Hall Plaza entrance is step-free; interpreters by appointment.' },
    services: ['One-run application', 'Residency preference rules', 'Lottery results', 'In-person help desk'],
    verification: { checkedOn: '2026-06-27', source: 'boston.gov housing', status: 'verified' },
    detailHref: '/affordable-housing',
  },
  {
    id: 'uym-quest',
    name: 'United Republic of Yamina Somali Community Center',
    category: 'community',
    summary: {
      en: 'Somali-language casework, burial and rent help, and immigration referrals in Neponset.',
      so: 'Adeegyo bulsho oo Soomaali ah, kaalmo kirro iyo dhigis, iyo talo socdaal oo ku yaal Neponset.',
    },
    address: '554 Neponset Avenue, Dorchester, MA 02125',
    neighborhood: 'Neponset',
    lat: 42.28016,
    lng: -71.06564,
    phone: '(617) 269-1005',
    hours: buildWeek({ 0: ['09:00-16:00'], 1: ['09:00-16:00'], 2: ['09:00-16:00'], 3: ['09:00-16:00'], 4: ['09:00-14:00'], 5: [], 6: [] }),
    languages: ['Somali', 'English', 'Arabic'],
    services: ['Casework in Somali', 'Rent and utility help', 'Immigration referrals', 'Youth programs'],
    verification: { checkedOn: '2026-03-05', source: 'community contact', status: 'needs-review' },
    transit: 'Bus 6, 16, 18 and 26 on Neponset Avenue.',
  },
  {
    id: 'epiphany-learn-works',
    name: 'Epiphany Learning Center, Dorchester',
    category: 'school',
    summary: {
      en: 'Free adult basic education, ESOL and HiSET preparation with childcare and transportation help.',
    },
    address: '125 Montgomery Street, East Boston (Dorchester cohort)',
    neighborhood: 'Citywide program',
    lat: 42.36346,
    lng: -71.03499,
    phone: '(617) 367-5447',
    hours: buildWeek({ 0: ['09:00-20:00'], 1: ['09:00-20:00'], 2: ['09:00-20:00'], 3: ['09:00-20:00'], 4: ['09:00-16:00'], 5: [], 6: [] }),
    languages: ['English', 'Spanish', 'Haitian Creole', 'Portuguese', 'Cape Verdean Creole', 'Somali', 'Vietnamese'],
    accessibility: { stepFree: true },
    services: ['ESOL levels 1-6', 'HiSET', 'Digital literacy', 'Transit passes for enrolled students'],
    verification: { checkedOn: '2026-02-11', source: 'program brochure', status: 'needs-review' },
  },
  {
    id: 'dorcester-esol-umass',
    name: 'UMass Boston Center for Multilingual Affairs',
    category: 'school',
    summary: {
      en: 'Free English classes and family literacy, plus a student-run legal and immigration clinic nearby.',
    },
    address: '100 Morrissey Boulevard, Dorchester, MA 02125',
    neighborhood: 'Columbia Point',
    lat: 42.31556,
    lng: -71.04779,
    phone: '(617) 287-6530',
    hours: buildWeek({ 0: ['09:00-19:00'], 1: ['09:00-19:00'], 2: ['09:00-19:00'], 3: ['09:00-19:00'], 4: ['09:00-16:00'], 5: ['09:00-13:00'], 6: [] }),
    languages: ['English', 'Spanish', 'Haitian Creole', 'Portuguese', 'Vietnamese', 'Mandarin'],
    accessibility: { stepFree: true, note: 'Campus shuttle from JFK/UMass.' },
    services: ['Community English classes', 'Family literacy nights', 'Immigration law clinic'],
    verification: { checkedOn: '2026-05-08', source: 'university program pages', status: 'needs-review' },
    transit: 'Bus 16, 41, 44 from JFK/UMass (Red Line and Commuter Rail).',
  },
];

export const RESOURCES_BY_CATEGORY = RESOURCES.reduce<Record<string, ResourceRecord[]>>((acc, r) => {
  (acc[r.category] ||= []).push(r);
  return acc;
}, {});

export function findResource(id: string): ResourceRecord | undefined {
  return RESOURCES.find((r) => r.id === id);
}

/** Most recent verification date in the dataset. Used by the footer stamp. */
export function lastReviewedOn(): string {
  return RESOURCES.map((r) => r.verification.checkedOn).sort().at(-1)!;
}

/** Share of the dataset that has gone past its review window. */
export function reviewBacklog(now = new Date()): { needsReview: number; total: number } {
  const needsReview = RESOURCES.filter((r) => verificationLevel(r, now) !== 'fresh').length;
  return { needsReview, total: RESOURCES.length };
}
