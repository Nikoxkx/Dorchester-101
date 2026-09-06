/** Central site map — one source of truth for nav order, numbering,
 *  and routes (used by the header, the mobile drawer, and the footer). */

export interface SiteSection {
  href: string;
  num: string;
  labelKey?: string;
  /** short nav label for tight spaces */
  navLabel: string;
  blurb: string;
}

export const PRIMARY_NAV: SiteSection[] = [
  { href: '/affordable-housing', num: '01', labelKey: 'nav.affordable', navLabel: 'Housing', blurb: 'Income-restricted rentals, waitlists, AMI bands' },
  { href: '/food', num: '02', labelKey: 'nav.food', navLabel: 'Food', blurb: 'Pantries, free meals, SNAP and WIC help' },
  { href: '/map', num: '03', labelKey: 'nav.map', navLabel: 'Map', blurb: 'Everything in Dorchester on one map' },
  { href: '/projects', num: '04', labelKey: 'nav.projects', navLabel: 'Projects', blurb: 'BPDA developments across the neighborhood' },
  { href: '/market-trends', num: '05', labelKey: 'nav.market', navLabel: 'Market', blurb: 'Rent and sale estimates, block by block' },
  { href: '/neighborhood', num: '06', labelKey: 'nav.neighborhood', navLabel: 'Guide', blurb: 'Streets, squares, MBTA access, who represents you' },
  { href: '/tools', num: '07', labelKey: 'nav.tools', navLabel: 'Tools', blurb: 'Rent-burden, AMI and benefit calculators' },
  { href: '/news', num: '08', labelKey: 'nav.news', navLabel: 'News', blurb: 'Dorchester headlines, one feed' },
];

export const SECONDARY_NAV: SiteSection[] = [
  { href: '/resources', num: '09', labelKey: 'nav.resources', navLabel: 'Directory', blurb: 'Legal aid, clinics, community organizations' },
  { href: '/faq', num: '10', labelKey: 'nav.faq', navLabel: 'FAQ', blurb: 'Straight answers about rights and programs' },
  { href: '/privacy', num: '11', navLabel: 'Privacy', blurb: 'What we collect (nothing) and why' },
  { href: '/terms', num: '12', navLabel: 'Terms', blurb: 'How this directory is licensed and used' },
];

export const ALL_SECTIONS = [...PRIMARY_NAV, ...SECONDARY_NAV];
