import { test, expect } from '@playwright/test';
import { load } from 'cheerio';
import sharp from 'sharp';
import { PUBLIC_ROUTES, SITE_URL } from '../src/lib/site';
import { SOCIAL_IMAGE } from '../src/lib/social';

// HTTP-only tests: crawlers must see all metadata without running JavaScript.
for (const route of PUBLIC_ROUTES.filter((path) => path !== '/settings')) {
  test(`share metadata is complete and unique for ${route}`, async ({ request }) => {
    const response = await request.get(route, { headers: { 'User-Agent': 'facebookexternalhit/1.1' } });
    expect(response.ok()).toBeTruthy();
    const $ = load(await response.text());
    const tag = (key: string) => {
      const nodes = $(`head meta[property="${key}"], head meta[name="${key}"]`);
      expect(nodes, `${key} must occur once in head`).toHaveLength(1);
      return nodes.attr('content');
    };
    expect(tag('og:image')).toBe(new URL(SOCIAL_IMAGE.url, SITE_URL).href);
    expect(tag('twitter:image')).toBe(tag('og:image'));
    expect(tag('og:image:width')).toBe('1200');
    expect(tag('og:image:height')).toBe('630');
    expect(tag('og:image:type')).toBe('image/jpeg');
    expect(tag('og:image:alt')).toBe(SOCIAL_IMAGE.alt);
    expect(tag('twitter:image:alt')).toBe(SOCIAL_IMAGE.alt);
    expect(new URL(tag('og:url')!).href).toBe(new URL(route, SITE_URL).href);
    expect(tag('twitter:card')).toBe('summary_large_image');
    expect(tag('og:site_name')).toBe('Dorchester 101');
    expect(tag('twitter:title')).toBe(tag('og:title'));
    expect(tag('twitter:description')).toBe(tag('og:description'));
    expect(tag('og:description')?.length).toBeGreaterThan(10);
    expect(new URL($('head link[rel="canonical"]').attr('href')!).href).toBe(new URL(route, SITE_URL).href);
  });
}

test('Twitterbot can fetch both the head tags and the JPEG without authentication', async ({ request }) => {
  const response = await request.get('/', { headers: { 'User-Agent': 'Twitterbot/1.0' } });
  const $ = load(await response.text());
  expect($('head meta[name="twitter:image"]').attr('content')).toBe(new URL(SOCIAL_IMAGE.url, SITE_URL).href);
  const image = await request.get(SOCIAL_IMAGE.url, { headers: { 'User-Agent': 'Twitterbot/1.0' } });
  expect(image.status()).toBe(200);
  expect(image.headers()['content-type']).toContain('image/jpeg');
  expect(image.headers()['cache-control']).toContain('immutable');
  expect(image.headers()['x-robots-tag'] ?? '').not.toContain('noindex');
  const bytes = await image.body();
  expect(bytes.length).toBeLessThan(1_000_000);
  expect(await sharp(bytes).metadata()).toMatchObject({ width: 1200, height: 630 });
  const robots = await request.get('/robots.txt');
  expect(await robots.text()).not.toMatch(/Disallow: \/social/);
});

test('legacy image URLs still resolve to the current screenshot card', async ({ request }) => {
  for (const legacy of ['/opengraph-image', '/twitter-image', '/api/og?title=Food']) {
    const response = await request.get(legacy);
    expect(response.ok()).toBeTruthy();
    expect(response.headers()['content-type']).toContain('image/jpeg');
    expect(new URL(response.url()).pathname).toBe(SOCIAL_IMAGE.url);
  }
});
