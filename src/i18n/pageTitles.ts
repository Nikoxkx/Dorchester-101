import type { TranslationKey } from './en';

/** Small route-to-label map shared by navigation and the browser tab title. */
export const NAV_LABEL_KEY: Record<string, TranslationKey> = {
  '/': 'nav.dashboard',
  '/projects': 'nav.projects',
  '/affordable-housing': 'nav.affordable',
  '/market-trends': 'nav.market',
  '/map': 'nav.map',
  '/food': 'nav.food',
  '/weather': 'nav.weather',
  '/winter-clothing': 'nav.clothing',
  '/neighborhood': 'nav.neighborhood',
  '/tools': 'nav.tools',
  '/news': 'nav.news',
  '/resources': 'nav.resources',
  '/directory': 'directory.title',
  '/embed': 'nav.resources',
  '/faq': 'nav.faq',
  '/settings': 'nav.settings',
  '/about': 'about.title',
  '/privacy': 'privacy.title',
  '/terms': 'legal.termsTitle',
};
