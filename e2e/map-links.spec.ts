import { expect, test, type Page } from '@playwright/test';

// Route fixtures need to see the requests rather than a service-worker cache.
test.use({ serviceWorkers: 'block' });

async function prepare(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('dor101-settings', JSON.stringify({ state: { language: 'en', autoRefresh: false }, version: 6 }));
    localStorage.setItem('dor101-privacy-choice', JSON.stringify({ state: { choice: 'decline' }, version: 1 }));
  });
  await page.route('**/api/mbta**', (route) => {
    const url = new URL(route.request().url());
    const data = url.searchParams.get('type') === 'stops' && url.searchParams.get('route') === '16'
      ? { stops: [{ id: '1234', name: 'Example Street at Main Street', lat: 42.3, lng: -71.06, accessible: false }], source: 'mbta-live' }
      : { stops: [], arrivals: [], alerts: [], vehicles: [], shapes: {}, source: 'timetable' };
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(data) });
  });
}

test('same-page links update the map and station photos match the selected stop', async ({ page }) => {
  await prepare(page);
  await page.goto('/map?stop=place-fldcr', { waitUntil: 'domcontentloaded' });
  const sheet = page.getByRole('dialog', { name: 'Place details' });
  await expect(sheet.getByRole('heading', { name: 'Fields Corner', exact: true })).toBeVisible({ timeout: 20_000 });
  await sheet.getByRole('link', { name: /Fields Corner Main Street/ }).click();
  await expect(page).toHaveURL(/place=fields-corner-main-street/);
  await expect(sheet.getByRole('heading', { name: 'Fields Corner Main Street' })).toBeVisible();
  expect(new URL(page.url()).searchParams.has('stop')).toBe(false);

  // The route links at the bottom of this same page must change the filter.
  await page.locator('a[href="/map?route=16"]').first().click();
  await expect(page.getByRole('combobox', { name: 'Route' })).toHaveValue('16');
  await page.goto('/map?stop=place-smmnl', { waitUntil: 'domcontentloaded' });
  await expect(sheet.getByRole('heading', { name: 'Shawmut', exact: true })).toBeVisible({ timeout: 20_000 });
  const photo = sheet.locator('img').first();
  await expect(photo).toHaveAttribute('alt', /Shawmut/i);
  await expect(photo).toHaveAttribute('src', /shawmut-headhouse/);
});

test('a live bus-stop link has details, a close control and directions', async ({ page }) => {
  await prepare(page);
  await page.goto('/map?route=16&stop=1234', { waitUntil: 'domcontentloaded' });
  const sheet = page.getByRole('dialog', { name: 'Place details' });
  await expect(sheet.getByRole('heading', { name: 'Example Street at Main Street' })).toBeVisible({ timeout: 20_000 });
  await expect(sheet.getByRole('button', { name: 'Close' })).toBeVisible();
  const href = await sheet.getByRole('link', { name: 'Walking route' }).getAttribute('href');
  expect(new URL(href!).searchParams.get('destination')).toBe('42.300000,-71.060000');
  await expect(sheet.getByText('Accessibility not confirmed')).toBeVisible();
});
