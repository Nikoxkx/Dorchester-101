import type { MetadataRoute } from 'next';
import { PUBLIC_ROUTES, SITE_URL } from '@/lib/site';
import { lastReviewedOn } from '@/data/resources';

/**
 * The sitemap lives at the standard `/sitemap.xml` path, which is what search
 * engines and `robots.txt` look for.
 *
 * `lastmod` is not decorative: it comes from the date the listings were actually
 * checked, so a crawl budget goes to the pages that changed rather than to a
 * number that moves every build.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const origin = new URL(SITE_URL).origin;
  const reviewedOn = new Date(lastReviewedOn());
  const now = new Date();

  return PUBLIC_ROUTES.map((route) => {
    const isDirectory = route === '/' || route === '/resources' || route === '/directory' || route === '/map' || route === '/weather' || route === '/winter-clothing' || route === '/food';
    const isAboutFaq = route === '/about' || route === '/faq' || route === '/resources' || route === '/directory';
    return {
      url: `${origin}${route}`,
      // Each section's share card, so image results associate the card with
      // its page (same generated images the pages declare in OpenGraph).
      ...(route === '/'
        ? { images: [`${origin}/opengraph-image`] }
        : route === '/weather'
          ? { images: [`${origin}/api/og?title=Boston+weather&desc=Live+Dorchester+forecast%2C+storm+warnings%2C+and+what+to+wear+%E2%80%94+from+the+National+Weather+Service.&kicker=DOR101+%C2%B7+LIVE+WEATHER`] }
          : route === '/map'
            ? { images: [`${origin}/api/og?title=Live+MBTA+map&desc=Real-time+buses+and+trains%2C+arrivals%2C+alerts+and+every+Dorchester+resource+on+one+map.&kicker=DOR101+%C2%B7+LIVE+MAP`] }
            : {}),
      lastModified: isAboutFaq ? reviewedOn : now,
      changeFrequency:
        route === '/news' || route === '/map' || route === '/weather'
          ? 'hourly'
          : route === '/winter-clothing' || isDirectory
            ? 'weekly'
            : 'monthly',
      priority: route === '/' ? 1 : isDirectory ? 0.9 : 0.7,
    } satisfies MetadataRoute.Sitemap[number];
  });
}
