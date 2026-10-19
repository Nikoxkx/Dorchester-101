import type { Metadata } from 'next';
import { SITE_FULL_NAME, SITE_URL } from './site';
import image from './social-image.json';

export const SOCIAL_TITLE = 'Dorchester 101 — Your neighborhood. A little easier.';
export const SOCIAL_DESCRIPTION =
  'Find housing, food, transit and everyday help in Dorchester, Boston. One free community guide, in nine languages. No account. No ads.';
export const SOCIAL_IMAGE = image;

/**
 * Next replaces nested metadata instead of deep-merging it. Every page that
 * overrides Open Graph must also supply its image and matching Twitter fields.
 * One static, content-hashed JPEG: no image-generation cold start, API robots
 * exclusion, duplicate file-convention tags, or stale Twitter homepage copy.
 */
export function socialMetadata({
  title = SOCIAL_TITLE,
  description = SOCIAL_DESCRIPTION,
  url = '/',
}: { title?: string; description?: string; url?: string } = {}): Pick<Metadata, 'openGraph' | 'twitter'> {
  const images = [{ ...SOCIAL_IMAGE, url: new URL(SOCIAL_IMAGE.url, SITE_URL).href }];
  return {
    openGraph: {
      type: 'website',
      siteName: SITE_FULL_NAME,
      locale: 'en_US',
      title,
      description,
      url: new URL(url, SITE_URL).href,
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images,
    },
  };
}
