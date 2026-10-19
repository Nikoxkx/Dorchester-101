import { describe, expect, it, vi, afterEach } from 'vitest';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import sharp from 'sharp';
import { SOCIAL_IMAGE, SOCIAL_TITLE, SOCIAL_DESCRIPTION, socialMetadata } from '@/lib/social';
import { SITE_URL } from '@/lib/site';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('social previews', () => {
  it('shares one absolute, accessible image and matching copy on both platforms', () => {
    const metadata = socialMetadata();
    const image = { ...SOCIAL_IMAGE, url: new URL(SOCIAL_IMAGE.url, SITE_URL).href };
    expect(metadata.openGraph).toMatchObject({
      type: 'website', siteName: 'Dorchester 101', url: new URL('/', SITE_URL).href,
      title: SOCIAL_TITLE, description: SOCIAL_DESCRIPTION, images: [image],
    });
    expect(metadata.twitter).toMatchObject({
      card: 'summary_large_image', title: SOCIAL_TITLE, description: SOCIAL_DESCRIPTION, images: [image],
    });
  });

  it('does not leave the homepage title on a shared section link', () => {
    const metadata = socialMetadata({ title: 'Food help', description: 'Pantries and meals.', url: '/food' });
    expect(metadata.openGraph).toMatchObject({ title: 'Food help', description: 'Pantries and meals.', url: new URL('/food', SITE_URL).href });
    expect(metadata.twitter).toMatchObject({ title: 'Food help', description: 'Pantries and meals.', images: metadata.openGraph?.images });
  });

  it('uses the configured production origin, not the capture server or preview host', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://dorchester.example');
    vi.resetModules();
    const { socialMetadata: custom } = await import('@/lib/social');
    expect(custom({ url: '/map' }).openGraph).toMatchObject({
      url: 'https://dorchester.example/map',
      images: [{ ...SOCIAL_IMAGE, url: `https://dorchester.example${SOCIAL_IMAGE.url}` }],
    });
  });

  it('ships a valid lightweight 1200×630 JPEG with a content-hashed filename', async () => {
    const bytes = readFileSync(`public${SOCIAL_IMAGE.url}`);
    expect(bytes.length).toBeLessThan(1_000_000);
    expect(SOCIAL_IMAGE.url).toContain(createHash('sha256').update(bytes).digest('hex').slice(0, 12));
    expect(await sharp(bytes).metadata()).toMatchObject({ width: 1200, height: 630, format: 'jpeg' });
    expect(await sharp('public/social/homepage.png').metadata()).toMatchObject({ width: 1440, height: 800 });
  });
});
