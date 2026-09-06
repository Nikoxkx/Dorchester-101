/**
 * Site-wide constants that have to be identical in the metadata, the sitemap,
 * the robots file and the service worker. One place, no drift.
 */

/** Canonical origin. Set NEXT_PUBLIC_SITE_URL in deployment; localhost in dev. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const SITE_NAME = 'DOR101';
export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? '1.3.0';

/**
 * Contact. A community project should publish a human address, so this is read
 * from the environment rather than invented in code: an address made up at
 * build time is a mailbox someone else owns. With no address configured the UI
 * routes people to the public issue tracker instead of showing a dead form.
 */
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? '';
export const REPO_URL = 'https://github.com/Nikoxkx/Dorchester-101';
export const CONTACT_FALLBACK_URL = process.env.NEXT_PUBLIC_CONTACT_URL ?? `${REPO_URL}/issues/new`;
export const hasEmailContact = CONTACT_EMAIL.trim().length > 0;
export const SITE_FULL_NAME = 'Dorchester 101';

/** Pages that should exist in the sitemap. `noindex` pages are absent by design. */
export const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/affordable-housing',
  '/faq',
  '/food',
  '/map',
  '/market-trends',
  '/neighborhood',
  '/news',
  '/projects',
  '/resources',
  '/tools',
  '/directory',
  '/settings',
  '/privacy',
  '/terms',
] as const;

/** The neighbourhood the whole project is about, for JSON-LD `areaServed`. */
export const AREA_SERVED = {
  name: 'Dorchester, Boston',
  alternateName: 'Dorchester',
  containedInPlace: 'Suffolk County, Massachusetts',
  geo: { latitude: 42.3105, longitude: -71.063 },
} as const;
