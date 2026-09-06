import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

/**
 * Crawler instructions, generated from the same route list as the sitemap so the
 * two can never disagree about what exists.
 *
 * `/api/*` is disallowed because those are unauthenticated JSON views of a
 * rate-limited third-party feed: a crawler that walks them burns the MBTA quota
 * for the residents using the site. `/settings` is disallowed because it holds no
 * content, only this device's preferences.
 */
export default function robots(): MetadataRoute.Robots {
  const origin = new URL(SITE_URL);
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/settings', '/print'],
      },
    ],
    sitemap: `${origin.origin}/sitemap.xml`,
    host: origin.origin,
  };
}
