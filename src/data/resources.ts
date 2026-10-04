/**
 * The DOR101 community dataset.
 *
 * One record per place, consumed by the map, the directory, the search index
 * and the print view. Nothing about a place is duplicated in a page component,
 * so correcting a phone number or a set of hours once fixes it everywhere.
 *
 * Every record carries its own verification stamp. `status: 'needs-review'` is
 * shown to residents rather than hidden, because an out-of-date pantry time is
 * worse than an honest warning. `checkedOn` is real data used to compute the
 * staleness badge; it is never a hard-coded sentence in a footer.
 *
 * Re-checked entry by entry on 4 October 2026 against each organisation's own
 * published page (address, phone, hours, eligibility). Records that could not
 * be confirmed were replaced with the organisation that actually runs the
 * service, not left standing with a guessed address.
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

const EVERY_DAY = (window: string[] = ['00:00-24:00']): Record<number, string[]> => ({
  0: window,
  1: window,
  2: window,
  3: window,
  4: window,
  5: window,
  6: window,
});

export const RESOURCES: ResourceRecord[] = [
  {
    id: 'bha',
    name: 'Boston Housing Authority',
    category: 'housing',
    operator: 'City of Boston',
    summary: {
      en: 'Public housing, project-based vouchers and help for tenants already in a unit. The Section 8 Housing Choice Voucher waiting list is closed until further notice; public housing is still taking applications.',
      es: 'Vivienda pública, vales de proyectos y ayuda para inquilinos. La lista de espera de la Sección 8 está cerrada hasta nuevo aviso; la vivienda pública sí acepta solicitudes.',
      ht: 'Lojman piblik, vouch pwojè ak èd pou lokatè. Lis datant Seksyon 8 fèmen; lojman piblik ap pran aplikasyon toujou.',
    },
    address: '100 West Springfield Street, Boston, MA 02116',
    neighborhood: 'South End (citywide office)',
    lat: 42.3358,
    lng: -71.0723,
    phone: '(617) 988-4000',
    website: 'https://www.bostonhousing.org',
    hours: buildWeek(STD(['08:30-17:00'])),
    languages: ['English', 'Spanish', 'Haitian Creole', 'Vietnamese', 'Mandarin', 'Cape Verdean Creole', 'Somali', 'Portuguese'],
    accessibility: { stepFree: true, note: 'Accessible entrance on West Springfield Street; interpreters on request.' },
    eligibility: 'Boston residents. Income limits follow HUD AMI bands for the Boston metro area. State-aided developments require applicants to be 60+ and/or disabled; federal developments 62+ and/or disabled.',
    services: [
      'Public housing (accepting applications)',
      'Section 8 Housing Choice Voucher (waitlist closed until further notice)',
      'Project-based and Mod Rehab vouchers (Priority One)',
      'Tenant services',
    ],
    verification: { checkedOn: '2026-10-04', source: 'bostonhousing.org waiting-list and application pages', status: 'verified' },
    detailHref: '/affordable-housing',
    transit: 'Bus 4, 7, 10, 39, 501, 504 to Mass Ave at West Springfield St. Green Line E to Kenmore.',
  },
  {
    id: 'gbfb-dorchester',
    name: 'Greater Boston Food Bank (food finder)',
    category: 'food',
    operator: 'Greater Boston Food Bank',
    summary: {
      en: 'The warehouse that supplies most pantries and meal programs in eastern Massachusetts. It is not a walk-in pantry — use its food finder to get the partner sites and pop-ups nearest your address.',
      es: 'El almacén que abastece a la mayoría de las despensas de Massachusetts oriental. No es una despensa de puerta abierta: use su buscador para encontrar el sitio más cercano.',
      ht: 'Depo ki bay prèske tout depo manje nan Massachusetts. Li pa yon depo pou moun vin chèche manje — sèvi ak zouti rechèch la pou jwenn sit ki pi pre ou.',
    },
    address: '70 South Bay Avenue, Boston, MA 02118',
    neighborhood: 'Newmarket / South Bay',
    lat: 42.3284,
    lng: -71.0648,
    phone: '(617) 427-5200',
    website: 'https://www.gbfb.org/need-food/',
    hours: buildWeek(STD(['08:00-16:30'])),
    hoursNote: 'Office hours only. Pantry and pop-up times come from the food finder, which lists each partner site.',
    languages: ['English', 'Spanish'],
    services: ['Food finder by ZIP code', 'Partner pantries and meal programs', 'Mobile markets'],
    verification: { checkedOn: '2026-10-04', source: 'gbfb.org contact and need-food pages', status: 'verified' },
    detailHref: '/food',
    transit: 'Red Line to Andrew, then bus 10 or 16. Bus 8 and 10 stop on Southampton Street.',
  },
  {
    id: 'codman-square-health',
    name: 'Codman Square Health Center',
    category: 'health',
    operator: 'Codman Square Health Center',
    summary: {
      en: 'Primary care, dental, behavioral health, an X-Clinic for HIV/STI testing and a teaching kitchen on Washington Street. Sliding-scale fees; walk-in insurance help.',
      es: 'Atención primaria, dental, salud conductual, clínica X para pruebas de VIH/ITS y cocina docente en Washington Street. Tarifas según ingresos.',
      ht: 'Swen premyè, dan, sante mantal, klinik X pou tès VIH/IST ak yon kwizin ansèyman sou Washington Street. Tarif selon revni.',
    },
    address: '637 Washington Street, Dorchester, MA 02124',
    neighborhood: 'Codman Square',
    lat: 42.28786,
    lng: -71.07212,
    phone: '(617) 825-9660',
    website: 'https://www.codman.org',
    hours: buildWeek({ 0: ['08:30-20:00'], 1: ['08:30-20:00'], 2: ['08:30-20:00'], 3: ['08:30-20:00'], 4: ['08:30-17:00'], 5: ['09:00-13:00'], 6: [] }),
    hoursNote: 'Hours vary by department; scheduling is (617) 822-8271. Urgent care runs later than the front desk.',
    languages: ['English', 'Spanish', 'Haitian Creole', 'Vietnamese', 'Somali', 'Cape Verdean Creole', 'Portuguese'],
    accessibility: { stepFree: true, note: 'Step-free entrance and elevators to every floor.' },
    eligibility: 'Open to all ages. No one is turned away for inability to pay.',
    services: ['Family medicine', 'Pediatrics', 'Dental', 'Behavioral health', 'HIV/STI care (X-Clinic)', 'Community Market (food)', 'Insurance enrollment walk-in'],
    verification: { checkedOn: '2026-10-04', source: 'codman.org location, hours and food-pantry pages', status: 'verified' },
    transit: 'Bus 23, 24, 26, 47, 51 stop at Codman Square. 8 min walk from Four Corners/Geneva.',
  },
  {
    id: 'bostons-food-district',
    name: 'Project Bread FoodSource Hotline',
    category: 'food',
    operator: 'Project Bread',
    summary: {
      en: 'One phone call finds the closest pantry, summer meal site or help signing up for SNAP. Interpreters on the line, free and confidential.',
      es: 'Una llamada encuentra la despensa más cercana, un sitio de comidas o ayuda para inscribirse en SNAP. Intérpretes disponibles.',
      ht: 'Yon apèl jwenn depo manje ki pi pre, sit manje oswa èd pou enskri nan SNAP. Entèprèt disponib.',
    },
    address: 'Statewide line (serves Dorchester)',
    neighborhood: 'Phone service',
    lat: 42.3105,
    lng: -71.063,
    phone: '1-800-645-8333',
    website: 'https://projectbread.org/get-help',
    hours: buildWeek({ 0: ['08:00-19:00'], 1: ['08:00-19:00'], 2: ['08:00-19:00'], 3: ['08:00-19:00'], 4: ['08:00-19:00'], 5: ['10:00-14:00'], 6: [] }),
    languages: ['English', 'Spanish', 'Portuguese', 'Vietnamese', 'Haitian Creole', 'Mandarin', 'Cantonese', 'Somali'],
    accessibility: { stepFree: true, note: 'Telephone service. 711 for relay.' },
    eligibility: 'Anyone in Massachusetts.',
    services: ['Food resource referral', 'SNAP application help', 'School meal questions', 'Senior food programs'],
    verification: { checkedOn: '2026-10-04', source: 'projectbread.org FoodSource Hotline page', status: 'verified' },
    detailHref: '/food',
  },
  {
    id: 'raft-mass',
    name: 'RAFT Rental Assistance (Residential Assistance for Families in Transition)',
    category: 'housing',
    operator: 'Executive Office of Housing and Livable Communities; administered in Boston by Metro Housing|Boston',
    summary: {
      en: 'Up to $7,000 per 12-month period for rent arrears, overdue utilities, moving costs or mortgage payments. A landlord application is also required for rent arrears. Start online, by calling 2-1-1, or through Metro Housing|Boston.',
      es: 'Hasta $7,000 por cada 12 meses para renta atrasada, servicios, mudanza o hipoteca. Se requiere también una solicitud del arrendador.',
    },
    address: 'Apply online, through 2-1-1, or through Metro Housing|Boston (1411 Tremont Street)',
    neighborhood: 'Citywide',
    lat: 42.3318,
    lng: -71.0569,
    phone: '2-1-1 (877-211-6277) · Boston: (617) 425-6700',
    website: 'https://www.mass.gov/how-to/apply-for-raft-emergency-help-for-housing-costs',
    hours: buildWeek(STD(['09:00-17:00'])),
    languages: ['English', 'Spanish', 'Haitian Creole', 'Vietnamese', 'Portuguese', 'Somali', 'Mandarin'],
    accessibility: { stepFree: true, note: 'Online application; help by phone through 2-1-1 in many languages.' },
    eligibility: 'Households in a housing crisis — a notice to quit, eviction case, utility shut-off or foreclosure threat — with income at or below 50% of Area Median Income for the Boston metro area. Confirm the current limit with the administering agency.',
    services: ['Rent arrears', 'First and last month', 'Security deposit', 'Utility arrears', 'Moving costs'],
    verification: { checkedOn: '2026-10-04', source: 'mass.gov RAFT pages and Metro Housing|Boston program page', status: 'verified' },
    detailHref: '/affordable-housing',
  },
  {
    id: 'gbLS-dorchester',
    name: 'Greater Boston Legal Services',
    category: 'legal',
    operator: 'Greater Boston Legal Services',
    summary: {
      en: 'Free civil lawyers for eviction defence, unsafe housing, benefits appeals, domestic violence and immigration. Intake line Monday–Friday 9:30–12:30; walk-in clinic at Dorchester Courthouse on the 2nd and 4th Wednesday, and Vietnamese-language intake at VietAID on Tuesdays.',
      es: 'Abogados gratuitos para desalojos, viviendas inseguras, apelaciones de beneficios y migración. Línea de admisión de lunes a viernes, 9:30–12:30.',
      ht: 'Avoka gratis pou defans kont eviksyon, lojman ki pa an sekirite, apèl benefis ak imigrasyon.',
    },
    address: '197 Friend Street, Boston, MA 02114',
    neighborhood: 'Boston (serves Dorchester)',
    lat: 42.36562,
    lng: -71.06008,
    phone: '(617) 371-1234',
    website: 'https://www.gbls.org',
    hours: buildWeek(STD(['09:00-17:00'])),
    hoursNote: 'Intake line answers 9:30–12:30, Monday–Friday. Dorchester Courthouse clinic (410 Washington St): 2nd and 4th Wednesday, 9:00–12:00. VietAID intake (42 Charles St): Tuesdays 2:00–4:00.',
    languages: ['English', 'Spanish', 'Haitian Creole', 'Vietnamese', 'Portuguese', 'Cape Verdean Creole'],
    accessibility: { stepFree: true },
    eligibility: 'Income-qualified Boston-area residents. Call the intake line first; the Dorchester clinics are drop-in.',
    services: ['Eviction defence', 'Habitability and repairs', 'SNAP and TAFDC appeals', 'Immigration relief', 'CORI and record sealing'],
    verification: { checkedOn: '2026-10-04', source: 'gbls.org service-locations page', status: 'verified' },
    detailHref: '/resources',
    transit: 'Green Line and Orange Line to North Station, 4 min walk. Commuter Rail to North Station.',
  },
  {
    id: 'dotbdc',
    name: 'Dorchester Bay Economic Development Corporation',
    category: 'community',
    summary: {
      en: 'Neighbourhood nonprofit running affordable housing, youth programs and small-business help around Uphams Corner and Columbia Point. Walk-ins Tuesday to Thursday; appointments Monday and Friday.',
      es: 'Organización vecinal con vivienda asequible, programas juveniles y apoyo a negocios.',
    },
    address: '594 Columbia Road, Suite 302, Dorchester, MA 02125',
    neighborhood: 'Uphams Corner',
    lat: 42.31662,
    lng: -71.06618,
    phone: '(617) 825-4200',
    website: 'https://www.dbedc.org',
    hours: buildWeek(STD(['08:00-17:00'])),
    hoursNote: 'Walk-in Tuesday–Thursday; Monday and Friday by appointment.',
    languages: ['English', 'Spanish', 'Haitian Creole', 'Portuguese', 'Vietnamese', 'Chinese'],
    accessibility: { stepFree: true },
    services: ['Affordable housing development', 'Small-business lending and technical help', 'Technology classes', 'Youth workforce programs', 'Community organising'],
    verification: { checkedOn: '2026-10-04', source: 'dbedc.org and partner programme listings (findhelp.org)', status: 'verified' },
    transit: 'Bus 10 and 16 stop at Columbia Road. 6 min walk from Uphams Corner (Fairmount Line).',
  },
  {
    id: 'fields-corner-main-street',
    name: 'Fields Corner Main Street',
    category: 'community',
    operator: 'Main Streets programme, City of Boston',
    summary: {
      en: 'The Main Streets organisation for the Dorchester Avenue business district at Fields Corner: small-business help, storefront grants and neighbourhood events.',
    },
    address: '1444 Dorchester Avenue, 2nd Floor, Dorchester, MA 02122',
    neighborhood: 'Fields Corner',
    lat: 42.29955,
    lng: -71.06205,
    phone: '(617) 474-1432',
    email: 'info@fieldscorner.org',
    website: 'https://www.fieldscorner.org',
    hoursNote: 'Office hours vary; email or call before visiting. Meetings are posted on the website and Facebook page.',
    services: ['Small-business technical help', 'Storefront improvement grants', 'Main Streets events', 'District promotion'],
    verification: { checkedOn: '2026-10-04', source: 'fieldscorner.org and Boston Chamber member listing', status: 'verified' },
    transit: 'At the Fields Corner headhouse (Red Line, bus 7, 9, 11, 16, 17).',
  },
  {
    id: 'grove-hall-library',
    name: 'BPL Grove Hall Branch Library',
    category: 'school',
    operator: 'Boston Public Library',
    summary: {
      en: 'Books, hotspot and Chromebook lending, English conversation groups, citizenship study help and free printing.',
      es: 'Préstamo de libros e internet, círculos de conversación de inglés y ayuda para el examen de ciudadanía.',
      ht: 'Livè, preta-hotspot, sèk konvèsasyon angle, ak èd pou egzamen sitwayen.',
    },
    address: '41 Geneva Avenue, Dorchester, MA 02121',
    neighborhood: 'Grove Hall',
    lat: 42.30429,
    lng: -71.08552,
    phone: '(617) 427-3337',
    website: 'https://www.bpl.org/locations/grove-hall/',
    hours: buildWeek({ 0: ['10:00-18:00'], 1: ['12:00-20:00'], 2: ['10:00-18:00'], 3: ['10:00-18:00'], 4: ['09:00-17:00'], 5: ['09:00-17:00'], 6: [] }),
    languages: ['English', 'Spanish', 'Haitian Creole', 'Cape Verdean Creole', 'Somali'],
    accessibility: { stepFree: true, note: 'Elevator to all floors, hearing loop in the meeting room.' },
    services: ['Hotspot and device lending', 'ESL conversation groups', 'Citizenship prep', 'Homework help', 'Free printing'],
    verification: { checkedOn: '2026-10-04', source: 'bpl.org Grove Hall branch page', status: 'verified' },
    transit: '5 min walk from Four Corners/Geneva (Fairmount Line). Bus 19, 23, 24, 29.',
  },
  {
    id: 'college-bound-dorchester',
    name: 'College Bound Dorchester',
    category: 'school',
    summary: {
      en: 'College and career advising, Boston Uncornered and adult education for young people from Dorchester who are out of work or out of school.',
    },
    address: '18 Samoset Street, Dorchester, MA 02122',
    neighborhood: 'Fields Corner / Bowdoin-Geneva',
    lat: 42.3058,
    lng: -71.0644,
    phone: '(617) 282-5034',
    website: 'https://www.collegebounddorchester.org',
    hours: buildWeek(STD(['09:00-17:00'])),
    services: ['College readiness advising', 'Boston Uncornered', 'Adult education and HiSET help', 'Job readiness'],
    verification: { checkedOn: '2026-10-04', source: 'collegebounddorchester.org and literacy directory listing (nld.org)', status: 'verified' },
    transit: 'Bus 15, 17 and 18 on Bowdoin Street; 10 min walk from Fields Corner (Red Line).',
  },
  {
    id: 'columbia-savin-hill-civic',
    name: 'Columbia-Savin Hill Civic Association',
    category: 'community',
    summary: {
      en: 'The civic association for Savin Hill and Columbia Point: monthly meetings, development review and neighbourhood events.',
    },
    address: '193 Savin Hill Avenue, Dorchester, MA 02125',
    neighborhood: 'Savin Hill',
    lat: 42.31203,
    lng: -71.0536,
    phone: '(857) 288-8748',
    website: 'https://www.columbiasavinhillcivic.org',
    hoursNote: 'Meetings are monthly and posted on the website; there is no walk-in office.',
    services: ['Monthly civic meetings', 'Development review comments', 'Neighbourhood events', 'Liaison to City departments'],
    verification: { checkedOn: '2026-10-04', source: 'columbiasavinhillcivic.org contact page', status: 'verified' },
    transit: '2 min walk from Savin Hill (Red Line). Bus 16 and 41 on Morrissey Boulevard.',
  },
  {
    id: 'uphams-corner-health',
    name: "Upham's Corner Health Center",
    category: 'health',
    summary: {
      en: 'Community health centre for North Dorchester: family medicine, paediatrics, dental, eye care, behavioural health, HIV/Hep C/STI services, pharmacy and WIC on site.',
      es: 'Centro de salud comunitario del norte de Dorchester: medicina familiar, pediatría, dental, salud conductual, farmacia y WIC.',
    },
    address: '415 Columbia Road, Dorchester, MA 02125',
    neighborhood: 'Uphams Corner',
    lat: 42.3176,
    lng: -71.06755,
    phone: '(617) 287-8000',
    website: 'https://uphamscornerhealthcenter.org',
    hours: buildWeek({ 0: ['08:30-17:00'], 1: ['08:30-17:00'], 2: ['08:30-17:00'], 3: ['08:30-17:00'], 4: ['09:45-17:00'], 5: [], 6: [] }),
    hoursNote: 'Evening and Saturday hours vary by service; call to confirm before travelling.',
    languages: ['English', 'Spanish', 'Haitian Creole', 'Cape Verdean Creole', 'Vietnamese'],
    accessibility: { stepFree: true },
    eligibility: 'Open to all; sliding-fee discount programme for uninsured and underinsured patients.',
    services: ['Family medicine', 'Paediatrics', 'Dental (accepting new patients)', 'Eye care', 'Behavioural health', 'HIV/Hep C/STI care', 'Pharmacy', 'WIC', 'Enrolment assistance'],
    verification: { checkedOn: '2026-10-04', source: 'uphamscornerhealthcenter.org services and contact pages', status: 'verified' },
    transit: 'Bus 15, 16, 41 and 45 on Columbia Road. 5 min walk from Uphams Corner (Fairmount Line).',
  },
  {
    id: 'hcfa-helpline',
    name: 'Health Care For All HelpLine',
    category: 'health',
    operator: 'Health Care For All',
    summary: {
      en: 'Free statewide multilingual phone service that helps you enrol in MassHealth or the Health Connector, answers insurance questions and troubleshoots denials. Help with medical bills is referred to Health Law Advocates.',
      es: 'Servicio telefónico gratuito y multilingüe que ayuda a inscribirse en MassHealth o el Connector y resuelve problemas de seguro.',
    },
    address: 'Statewide phone service (office: 70 Franklin Street, Suite 500, Boston, MA 02110)',
    neighborhood: 'Phone service',
    lat: 42.3555,
    lng: -71.0581,
    phone: '1-800-272-4232',
    website: 'https://hcfama.org/hcfas-helpline/',
    hours: buildWeek(STD(['09:00-17:00'])),
    languages: ['English', 'Spanish', 'Portuguese', 'Haitian Creole', 'French'],
    accessibility: { stepFree: true, note: 'Telephone service; 711 for relay.' },
    services: ['MassHealth enrolment', 'Health Connector enrolment', 'Insurance troubleshooting', 'Referral to free legal help on medical bills'],
    verification: { checkedOn: '2026-10-04', source: 'hcfama.org HelpLine page', status: 'verified' },
  },
  {
    id: 'boston-language-access',
    name: 'City of Boston 311 (language access complaints)',
    category: 'community',
    operator: 'City of Boston',
    summary: {
      en: 'If a city office will not give you an interpreter, call 311. City staff must provide language access free of charge, and 311 can also put in a service request for anything else in the city.',
      es: 'Si una oficina municipal no le da un intérprete, llame al 311. Es gratis.',
    },
    address: 'Citywide service',
    neighborhood: 'Citywide',
    lat: 42.3601,
    lng: -71.0581,
    phone: '311 (or 617-635-4500 from a cell)',
    hours: buildWeek(EVERY_DAY(['00:00-24:00'])),
    hoursNote: 'The 311 line answers 24 hours a day, every day of the year.',
    languages: ['English', 'Spanish', 'Haitian Creole', 'Portuguese', 'Vietnamese', 'Somali', 'Mandarin', 'Cantonese', 'Arabic', 'Cape Verdean Creole'],
    accessibility: { stepFree: true, note: 'Interpreter on three-way conference within the call.' },
    services: ['Interpreter complaints', 'Translated forms request', '311 service requests', 'City information'],
    verification: { checkedOn: '2026-10-04', source: 'boston.gov Boston 311 page', status: 'verified' },
  },
  {
    id: 'fair-foods-lena-park',
    name: 'Fair Foods $2 Bag at Lena Park',
    category: 'food',
    operator: 'Fair Foods; hosted by Lena Park Community Development Corp',
    summary: {
      en: 'Fresh produce for $2 a bag, no papers and no income test, every Tuesday afternoon while it lasts. Over 12 pounds of mixed fruit and vegetables in each bag.',
      es: 'Producto fresco por $2 la bolsa, sin documentos, cada martes por la tarde.',
    },
    address: '150 American Legion Highway, Dorchester, MA 02124',
    neighborhood: 'Franklin Field / Mattapan line',
    lat: 42.2906,
    lng: -71.0874,
    phone: '(617) 533-8133',
    website: 'https://lenaparkcdc.org',
    hours: buildWeek({ 0: [], 1: ['14:00-16:30'], 2: [], 3: [], 4: [], 5: [], 6: [] }),
    hoursNote: 'Tuesdays from 2 PM, while the pallets last. Bring your own bag; $2 per bag.',
    languages: ['English', 'Spanish', 'Haitian Creole'],
    accessibility: { stepFree: true },
    eligibility: 'Anyone. No ID, no proof of address, no income test.',
    services: ['$2 produce bags', 'Community centre programs'],
    verification: { checkedOn: '2026-10-04', source: 'lenaparkcdc.org events and codman.org Dorchester food resources page', status: 'verified' },
    detailHref: '/food',
    transit: 'Bus 14, 22, 28 and 29 on American Legion Highway.',
  },
  {
    id: 'vietaid',
    name: 'VietAID Community Center',
    category: 'community',
    operator: 'Vietnamese American Initiative for Development',
    summary: {
      en: 'The Vietnamese American community centre in Fields Corner: elder services, youth tutoring, citizenship classes, housing counselling and food assistance.',
      vi: 'Trung tâm cộng đồng người Việt tại Fields Corner: dịch vụ cho người cao tuổi, kèm cặp học sinh, lớp quốc tịch, tư vấn nhà ở và hỗ trợ thực phẩm.',
    },
    address: '42 Charles Street, Suite E, Dorchester, MA 02122',
    neighborhood: 'Fields Corner',
    lat: 42.30093,
    lng: -71.06127,
    phone: '(617) 822-3717',
    website: 'https://vietaid.org',
    hours: buildWeek(STD(['09:00-17:00'])),
    hoursNote: 'The community centre itself is open longer hours for booked programmes; call ahead.',
    languages: ['English', 'Vietnamese'],
    accessibility: { stepFree: true },
    services: ['Elder services', 'Youth programs and tutoring', 'Citizenship classes', 'HUD-approved housing counselling', 'Food assistance', 'Community hall hire'],
    verification: { checkedOn: '2026-10-04', source: 'vietaid.org and partner directory listings', status: 'verified' },
    transit: 'Bus 15, 16, 17, 18 and 19 at Fields Corner. 4 min walk from Fields Corner (Red Line).',
  },
  {
    id: 'st-mark-esol',
    name: 'St. Mark Community Education Program',
    category: 'school',
    operator: 'St. Mark Community Education Program (independent 501(c)(3))',
    summary: {
      en: 'Free ESOL classes at four levels and citizenship/civics exam preparation, in person in Fields Corner and online. This is the largest volunteer-led citizenship programme in eastern Massachusetts.',
    },
    address: '25 Beach Street, Dorchester, MA 02122',
    neighborhood: 'Fields Corner',
    lat: 42.29945,
    lng: -71.06232,
    phone: '(617) 288-8515',
    email: 'mike@stmarksesol.org',
    website: 'https://www.stmarksesol.org',
    hoursNote: 'Sessions run in 10-week blocks, mornings, evenings and Saturdays; register online or by phone before the block starts.',
    languages: ['English', 'Spanish'],
    accessibility: { stepFree: true },
    eligibility: 'Adult immigrants and refugees. Citizenship classes are free; ESOL has a $40 book fee.',
    services: ['ESOL levels 1–4', 'Citizenship and civics prep', 'Conversation groups', 'Digital literacy', 'Workforce readiness'],
    verification: { checkedOn: '2026-10-04', source: 'stmarksesol.org and literacy directory listing (nld.org)', status: 'verified' },
    transit: 'Bus 15, 17, 18 and 19 at Fields Corner. 6 min walk from Fields Corner (Red Line).',
  },
  {
    id: 'city-life-vida-urbana',
    name: 'City Life/Vida Urbana Tenant Union',
    category: 'legal',
    summary: {
      en: 'Tenant organising, a free weekly legal clinic and help with rent increases, evictions and foreclosure. The meeting is Tuesday evening at 6:15; you can speak with an organiser and a lawyer there.',
      es: 'Organización de inquilinos, clínica legal gratuita semanal y ayuda con desalojos y ejecuciones.',
    },
    address: '284 Amory Street, First Floor, Jamaica Plain, MA 02130',
    neighborhood: 'Jamaica Plain (serves Dorchester)',
    lat: 42.31294,
    lng: -71.10388,
    phone: '(617) 524-3541',
    website: 'https://www.clvu.org',
    hours: buildWeek({ 0: ['09:00-17:00'], 1: ['09:00-21:00'], 2: ['09:00-17:00'], 3: ['09:00-17:00'], 4: ['09:00-17:00'], 5: [], 6: [] }),
    hoursNote: 'Weekly tenant meeting Tuesdays at 6:15 PM. Spanish-language hotline available.',
    languages: ['English', 'Spanish'],
    accessibility: { stepFree: true },
    services: ['Weekly tenant clinic', 'Organising support', 'Eviction and foreclosure help', 'Rent-strike support', 'Code-enforcement complaints'],
    verification: { checkedOn: '2026-10-04', source: 'clvu.org weekly-meeting and contact pages', status: 'verified' },
    transit: 'Orange Line to Jackson Square, 8 min walk. Bus 22, 29, 41 and 44 nearby.',
    detailHref: '/faq',
  },
  {
    id: 'dorchester-food-coop',
    name: 'Dorchester Food Co-op',
    category: 'food',
    summary: {
      en: 'Community- and worker-owned grocery store in Fields Corner, stocking affordable produce and local goods. SNAP/EBT accepted; member-owner discounts.',
      es: 'Tienda de comestibles cooperativa en Fields Corner, con productos frescos y locales. Acepta SNAP/EBT.',
    },
    address: '195 Bowdoin Street, Dorchester, MA 02122',
    neighborhood: 'Fields Corner / Bowdoin-Geneva',
    lat: 42.3038,
    lng: -71.06153,
    phone: '(617) 297-5943',
    website: 'https://www.dorchesterfoodcoop.com',
    hours: buildWeek({ 0: ['08:00-20:00'], 1: ['08:00-20:00'], 2: ['08:00-20:00'], 3: ['08:00-20:00'], 4: ['08:00-20:00'], 5: ['08:00-20:00'], 6: ['09:00-20:00'] }),
    languages: ['English', 'Spanish'],
    acceptsEbt: true,
    accessibility: { stepFree: true },
    services: ['Grocery store', 'Local produce', 'SNAP/EBT accepted', 'Member ownership'],
    verification: { checkedOn: '2026-10-04', source: 'dorchesterfoodcoop.com contact page', status: 'verified' },
    transit: 'Bus 15, 17, 18 and 19 at Fields Corner. 8 min walk from Fields Corner (Red Line).',
    detailHref: '/food',
  },
  {
    id: 'cpcs-boston',
    name: 'CPCS Boston (public defender)',
    category: 'legal',
    operator: 'Committee for Public Counsel Services',
    summary: {
      en: 'The state public-defender agency. If you are charged with a crime and cannot afford a lawyer, the court appoints one at your first appearance; call CPCS to find out which office covers your court and what to bring.',
    },
    address: '75 Federal Street, 6th Floor, Boston, MA 02110',
    neighborhood: 'Financial District, Boston',
    lat: 42.35542,
    lng: -71.05555,
    phone: '(617) 482-6212',
    website: 'https://www.publiccounsel.net',
    hours: buildWeek(STD(['09:00-17:00'])),
    languages: ['English', 'Spanish', 'Haitian Creole', 'Portuguese', 'Vietnamese', 'Mandarin'],
    accessibility: { stepFree: true },
    services: ['Criminal defence', 'Child welfare (Care and Protection)', 'Mental-health and SORB cases', 'Appeals', 'Interpreters arranged'],
    verification: { checkedOn: '2026-10-04', source: 'publiccounsel.net Boston office page', status: 'verified' },
    transit: 'Red Line to South Station, 5 min walk. Orange Line to Downtown Crossing, 6 min walk.',
  },
  {
    id: 'work-inc-dorchester',
    name: 'Work Inc. (Dorchester)',
    category: 'community',
    summary: {
      en: 'Employment services in Dorchester for people with disabilities or a barrier to work: job coaching, supported employment, benefits counselling and workforce training.',
    },
    address: '25 Beach Street, Dorchester, MA 02122',
    neighborhood: 'Fields Corner',
    lat: 42.29945,
    lng: -71.06232,
    phone: '(617) 691-1500',
    website: 'https://www.workinc.org',
    hours: buildWeek(STD(['08:30-16:30'])),
    accessibility: { stepFree: true },
    eligibility: 'Adults with disabilities, and people referred by the state vocational-rehabilitation system.',
    services: ['Job coaching', 'Supported employment', 'Benefits counselling so work does not cut a check', 'Workforce training'],
    verification: { checkedOn: '2026-10-04', source: 'mass.gov location listing and disabilityinfo.org programme record', status: 'verified' },
    transit: 'Bus 15, 17, 18 and 19 at Fields Corner. 5 min walk from Fields Corner (Red Line).',
  },
  {
    id: 'codman-square-community-market',
    name: 'Codman Square Community Market',
    category: 'food',
    operator: 'Codman Square Health Center',
    summary: {
      en: 'Choice-based food pantry — the former Codman Square Food Pantry, moved half a mile up Washington Street. Shop for up to the posted quantity per item, once a month. No ID required.',
      es: 'Despensa con opción de alimentos, a media milla del centro de salud. Sin identificación.',
    },
    address: '450 Washington Street, Dorchester, MA 02124',
    neighborhood: 'Codman Square',
    lat: 42.2895,
    lng: -71.07218,
    phone: '(617) 825-9660',
    website: 'https://www.codman.org/wellness-resource/food-pantry/',
    hours: buildWeek({ 0: [], 1: ['08:00-13:00'], 2: ['14:00-19:00'], 3: ['08:00-13:00'], 4: [], 5: [], 6: [] }),
    hoursNote: 'Tuesday 8–1, Wednesday 2–7, Thursday 8–1. SNAP sign-up help in the main lobby on Wednesday afternoons.',
    languages: ['English', 'Spanish', 'Haitian Creole', 'Somali'],
    requiresId: false,
    accessibility: { stepFree: true },
    services: ['Choice-based groceries', 'Baby supplies when stocked', 'Nutrition counselling', 'SNAP application help'],
    verification: { checkedOn: '2026-10-04', source: 'codman.org Community Market page', status: 'verified' },
    transit: 'Bus 23, 24, 26, 47 at Codman Square.',
    detailHref: '/food',
  },
  {
    id: 'metro-housing-boston',
    name: 'Metro Housing|Boston',
    category: 'housing',
    summary: {
      en: 'The housing agency for Greater Boston: administers RAFT here, helps with rental vouchers and housing search, and runs the Housing Consumer Education Center. Start with a phone call.',
      es: 'La agencia de vivienda del área de Boston: administra RAFT y ayuda con vales y búsqueda de vivienda.',
    },
    address: '1411 Tremont Street, Boston, MA 02120',
    neighborhood: 'Mission Hill (serves Dorchester)',
    lat: 42.33323,
    lng: -71.09566,
    phone: '(617) 425-6700',
    website: 'https://www.metrohousingboston.org',
    hours: buildWeek(STD(['08:45-17:00'])),
    languages: ['English', 'Spanish', 'Haitian Creole', 'Portuguese'],
    accessibility: { stepFree: true },
    services: ['RAFT applications for Boston', 'Rental voucher assistance', 'Housing search help', 'Housing Consumer Education Center', 'Landlord mediation'],
    verification: { checkedOn: '2026-10-04', source: 'metrohousingboston.org and program directory listings', status: 'verified' },
    transit: 'Green Line E to Brigham Circle, then bus 39. Orange Line to Roxbury Crossing, then bus 66.',
  },
  {
    id: 'housing-navigator-ma',
    name: 'Housing Navigator Massachusetts',
    category: 'housing',
    summary: {
      en: "The state's official free search tool for income-restricted rentals — the replacement for the retired MassAccess registry. Filter by town, household size, income and accessibility; each listing says whether to apply by lottery or waitlist. MyMassHome does the same for homes for sale.",
      es: 'Buscador oficial gratuito de alquileres de ingresos limitados en Massachusetts; reemplaza el registro MassAccess.',
    },
    address: 'Online service',
    neighborhood: 'Statewide',
    lat: 42.3555,
    lng: -71.0565,
    website: 'https://housingnavigatorma.org',
    languages: ['English', 'Spanish'],
    accessibility: { stepFree: true, note: 'Filterable by accessibility features; the site states its WCAG conformance.' },
    services: ['Income-restricted rental listings', 'Waitlist and lottery listings', 'AMI and rent filters', 'Accessibility filters'],
    verification: { checkedOn: '2026-10-04', source: 'housingnavigatorma.org and CHAPA announcement of the MassAccess retirement', status: 'verified' },
    detailHref: '/affordable-housing',
  },
  {
    id: 'metrolist-boston',
    name: "Metrolist (Mayor's Office of Housing)",
    category: 'housing',
    operator: 'City of Boston, Mayor\u2019s Office of Housing',
    summary: {
      en: 'Every City of Boston income-restricted lottery and waitlist is advertised on Metrolist, plus an eligibility estimator. Lotteries are overseen by the Mayor\u2019s Office of Housing at 26 Court Street. If you are at immediate risk of homelessness, call the Office of Housing Stability at (617) 635-4200.',
      es: 'Todos los sorteos y listas de espera de vivienda de ingresos limitados de Boston se anuncian en Metrolist.',
    },
    address: '26 Court Street, Boston, MA 02108',
    neighborhood: 'Government Center',
    lat: 42.3592,
    lng: -71.0573,
    phone: '(617) 635-3880',
    email: 'housing@boston.gov',
    website: 'https://www.boston.gov/metrolist',
    hours: buildWeek(STD(['09:00-17:00'])),
    languages: ['English', 'Spanish', 'Haitian Creole', 'Vietnamese', 'Mandarin', 'Somali', 'Portuguese', 'Arabic'],
    accessibility: { stepFree: true, note: 'Interpreters by appointment; listing advertisements are published in 11 languages.' },
    services: ['Income-restricted listings', 'Lottery and waitlist applications', 'AMI eligibility estimator', 'Weekly listing digest'],
    verification: { checkedOn: '2026-10-04', source: 'boston.gov Metrolist and Mayor\u2019s Office of Housing pages', status: 'verified' },
    detailHref: '/affordable-housing',
  },
  {
    id: 'somali-development-center',
    name: 'Somali Development Center',
    category: 'community',
    summary: {
      en: 'Casework, interpretation and employment help for Somali and other East African residents of Boston, including Dorchester families. Housing search assistance, ESOL and citizenship help, and elder services.',
      so: 'Adeegyo bulsho, turjumaad iyo kaalmo shaqo oo Soomaali iyo Bariga Afrika; caawimaad guri raadin, ESOL iyo fasaxa dhalashada.',
    },
    address: '10 Malcolm X Boulevard, 2nd Floor, Roxbury, MA 02119',
    neighborhood: 'Roxbury (serves Dorchester)',
    lat: 42.33188,
    lng: -71.08496,
    phone: '(617) 522-0700',
    website: 'https://sdcboston.org',
    hours: buildWeek(STD(['09:00-17:00'])),
    languages: ['Somali', 'English', 'Arabic', 'Amharic', 'Swahili'],
    accessibility: { stepFree: true },
    eligibility: 'Open to Somali and other African residents of Boston regardless of immigration status.',
    services: ['Casework in Somali', 'Interpretation and translation', 'Employment and job-readiness', 'ESOL and citizenship assistance', 'Housing search help', 'Elder services'],
    verification: { checkedOn: '2026-10-04', source: 'sdcboston.org, City of Boston immigration services referral list and findhelp.org programme record', status: 'verified' },
    transit: 'Orange Line to Roxbury Crossing, 5 min walk. Bus 15, 41, 42, 44, 45, 66 nearby.',
  },
  {
    id: 'yawkey-center-adult-ed',
    name: 'Catholic Charities Yawkey Center (adult education)',
    category: 'school',
    operator: 'Catholic Charities Boston',
    summary: {
      en: 'Free ESOL and adult basic education classes, workforce development and a food pantry, run out of the Yawkey Center in Dorchester.',
    },
    address: '185 Columbia Road, Dorchester, MA 02121',
    neighborhood: 'Uphams Corner / Four Corners',
    lat: 42.30984,
    lng: -71.07351,
    phone: '(617) 506-6600',
    website: 'https://www.ccab.org/adult-education-workforce-development/esol/',
    hours: buildWeek({ 0: ['09:00-15:30'], 1: ['09:00-15:30'], 2: ['09:00-15:30'], 3: ['09:00-15:30'], 4: ['09:00-15:30'], 5: [], 6: [] }),
    hoursNote: 'Classes run 9:00–15:30; call for the current enrolment window.',
    languages: ['English', 'Spanish', 'Haitian Creole'],
    accessibility: { stepFree: true },
    services: ['ESOL classes', 'Adult basic education', 'Workforce development', 'Food pantry'],
    verification: { checkedOn: '2026-10-04', source: 'ccab.org location and ESOL pages', status: 'verified' },
    transit: 'Bus 15, 16, 41 and 45 on Columbia Road. 6 min walk from Uphams Corner (Fairmount Line).',
  },
  {
    id: 'abcd-esol',
    name: 'ABCD (Action for Boston Community Development)',
    category: 'school',
    operator: 'Action for Boston Community Development',
    summary: {
      en: 'Boston\u2019s largest antipoverty agency: free ESOL and adult education, career coaching, SummerWorks youth jobs and fuel assistance (LIHEAP). Dorchester residents are served through its neighbourhood sites.',
    },
    address: '178 Tremont Street, Boston, MA 02111',
    neighborhood: 'Downtown, citywide service',
    lat: 42.3536,
    lng: -71.0638,
    phone: '(617) 357-6000',
    website: 'https://bostonabcd.org/service/english-for-speakers-of-other-languages-esol/',
    hours: buildWeek(STD(['09:00-17:00'])),
    languages: ['English', 'Spanish', 'Haitian Creole', 'Portuguese', 'Chinese', 'Vietnamese'],
    accessibility: { stepFree: true },
    services: ['Free ESOL classes', 'Adult education and career coaching', 'SummerWorks youth employment', 'Fuel assistance (LIHEAP applications)'],
    verification: { checkedOn: '2026-10-04', source: 'bostonabcd.org ESOL and SummerWorks pages', status: 'verified' },
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
