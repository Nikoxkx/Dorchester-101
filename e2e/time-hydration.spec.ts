import { expect, test } from '@playwright/test';

// The static pages may be built days before a visitor arrives, and a visitor's
// browser can be in a different timezone from the build server.
test.use({ timezoneId: 'Pacific/Auckland', serviceWorkers: 'block' });

test('time-sensitive pages hydrate without treating the build time as the current time', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2030-01-15T20:15:00Z'));
  await page.addInitScript(() => {
    localStorage.setItem('dor101-settings', JSON.stringify({ state: { language: 'es', autoRefresh: true, weatherEnabled: false }, version: 6 }));
    localStorage.setItem('dor101-privacy-choice', JSON.stringify({ state: { choice: 'decline' }, version: 1 }));
  });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(`${new URL(page.url()).pathname}: ${error.message}`));
  for (const path of ['/', '/about', '/directory', '/embed', '/food', '/resources', '/news', '/winter-clothing']) {
    const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
    expect(response?.status(), path).toBeLessThan(400);
    await expect(page.locator('html')).toHaveAttribute('lang', 'es', { timeout: 20_000 });
    await page.locator('h1').first().waitFor({ state: 'visible' });
    await page.waitForTimeout(500);
  }
  expect(errors).toEqual([]);
});
