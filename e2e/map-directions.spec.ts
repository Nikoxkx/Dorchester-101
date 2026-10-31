import { expect, test } from '@playwright/test';

test('a map link opens directions without requesting location, then includes it after consent', async ({ page, context }) => {
  await page.addInitScript(() => {
    localStorage.setItem('dor101-settings', JSON.stringify({ state: { language: 'es', autoRefresh: false }, version: 6 }));
    localStorage.setItem('dor101-privacy-choice', JSON.stringify({ state: { choice: 'decline' }, version: 1 }));
    const win = window as Window & { locationRequests: number };
    win.locationRequests = 0;
    // A deterministic position verifies that only an explicit click calls
    // geolocation. This mock does not test the browser's permission prompt.
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: (success: PositionCallback) => {
          win.locationRequests += 1;
          success({ coords: { latitude: 42.3, longitude: -71.06 } } as GeolocationPosition);
        },
      },
    });
  });
  // Verify that the actual new tab opens, without contacting Google in CI.
  await context.route('https://www.google.com/maps/**', (route) => route.fulfill({ status: 200, body: 'Directions' }));
  await page.goto('/map?place=fields-corner-main-street', { waitUntil: 'domcontentloaded' });
  const sheet = page.getByRole('dialog', { name: 'Detalles del lugar' });
  await expect(sheet).toBeVisible({ timeout: 20_000 });
  await expect(sheet.getByRole('heading', { name: 'Fields Corner Main Street' })).toBeVisible();
  const walking = sheet.getByRole('link', { name: 'Ruta a pie' });
  const before = new URL((await walking.getAttribute('href'))!);
  expect(before.searchParams.get('destination')).toBe('42.301386,-71.059766');
  expect(before.searchParams.get('travelmode')).toBe('walking');
  expect(before.searchParams.has('origin')).toBe(false);
  expect(await page.evaluate(() => (window as Window & { locationRequests: number }).locationRequests)).toBe(0);

  const [popup] = await Promise.all([page.waitForEvent('popup'), walking.click()]);
  await popup.waitForLoadState('domcontentloaded');
  expect(new URL(popup.url()).searchParams.has('origin')).toBe(false);
  await popup.close();
  expect(await page.evaluate(() => (window as Window & { locationRequests: number }).locationRequests)).toBe(0);

  await sheet.getByRole('button', { name: 'Usar mi ubicación para ver el tiempo a pie' }).click();
  await expect.poll(async () => new URL((await walking.getAttribute('href'))!).searchParams.get('origin')).toBe('42.300000,-71.060000');
  expect(await page.evaluate(() => (window as Window & { locationRequests: number }).locationRequests)).toBe(1);
  await expect(sheet.getByText(/A unos .* min a pie.*(pies|millas?)/)).toBeVisible();
});
