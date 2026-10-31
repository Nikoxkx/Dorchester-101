import { expect, test } from '@playwright/test';

test('the offline worker does not replay old live API responses or store query URLs', async ({ page, context }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);

  const apiUrl = '/api/mbta?type=arrivals&stops=private-test-stop';
  await page.route('**/api/mbta**', (route) => route.fulfill({
    status: 200, contentType: 'application/json', body: JSON.stringify({ marker: 'fresh-test-response' }),
  }));
  const marker = await page.evaluate(async (url) => (await (await fetch(url)).json()).marker, apiUrl);
  expect(marker).toBe('fresh-test-response');
  await page.unroute('**/api/mbta**');

  // A query-bearing navigation must not be kept in the service-worker cache.
  await page.goto('/faq?private-test=one', { waitUntil: 'domcontentloaded' });
  const cachedUrls = await page.evaluate(async () => {
    const keys = await caches.keys();
    const lists = await Promise.all(keys.filter((key) => key.startsWith('dor101-')).map(async (key) => (await caches.open(key)).keys()));
    return lists.flat().map((request) => request.url);
  });
  expect(cachedUrls.some((url) => url.includes('private-test'))).toBe(false);
  expect(cachedUrls.some((url) => new URL(url).pathname.startsWith('/api/'))).toBe(false);

  await context.setOffline(true);
  const result = await page.evaluate(async (url) => {
    try { await fetch(url); return 'response'; } catch { return 'network-error'; }
  }, apiUrl);
  expect(result).toBe('network-error');
});
