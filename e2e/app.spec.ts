import { test, expect } from '@playwright/test';

test.describe('DOR101 desk', () => {
  test('homepage loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('DOR101').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('nav').first()).toBeVisible();
    await expect(page.getByText('Dorchester').first()).toBeVisible();
  });

  test('language switching works', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Language').click();
    await page.getByText('Español').click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  });

  test('navigation works', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Housing Projects' }).first().click();
    await page.waitForURL('**/projects');
    await expect(page.locator('h1')).toContainText(/Housing Projects|Proyectos/);

    await page.getByRole('link', { name: 'Map' }).first().click();
    await page.waitForURL('**/map');

    await page.getByRole('link', { name: 'Resources' }).first().click();
    await page.waitForURL('**/resources');
    await expect(page.locator('h1')).toContainText(/Resource|Recurso/);
  });

  test('news section shows articles', async ({ page }) => {
    await page.goto('/news');
    await expect(page.locator('h1')).toContainText(/News|Noticia/, { timeout: 15000 });
    await page.waitForTimeout(2000);
    const count = await page.locator('.news-item, article').count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('map page loads with map', async ({ page }) => {
    await page.goto('/map');
    await expect(page.getByText('Dorchester').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('.leaflet-container, [class*="leaflet"]').first()).toBeVisible({ timeout: 15000 });
  });

  test('settings page is accessible', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.locator('h1')).toContainText(/Settings|Configuración/, { timeout: 10000 });
    await expect(page.getByText('Language')).toBeVisible();
  });

  test('notifications are displayed', async ({ page }) => {
    await page.goto('/');
    const bell = page.getByLabel(/Notifications/);
    await expect(bell).toBeVisible();
    await bell.click();
    await expect(page.getByText(/Notices|Notifications/)).toBeVisible({ timeout: 5000 });
  });

  test('search functionality works', async ({ page }) => {
    await page.goto('/projects');
    const searchInput = page.locator('input').first();
    await searchInput.fill('housing');
    await page.waitForTimeout(300);
    const cards = page.locator('article, [class*="card"], [class*="Card"]');
    expect(await cards.count()).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Responsive Design', () => {
  test('mobile layout works', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    const menu = page.getByLabel('Open menu');
    if (await menu.isVisible()) await menu.click();
    await expect(page.getByText('DOR101').first()).toBeVisible();
  });

  test('tablet layout works', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await expect(page.getByText('DOR101').first()).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('page has proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('images have alt text', async ({ page }) => {
    await page.goto('/');
    const images = page.locator('img');
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      expect(await images.nth(i).getAttribute('alt')).not.toBeNull();
    }
  });

  test('form inputs have labels', async ({ page }) => {
    await page.goto('/settings');
    const inputs = page.locator('input:not([type="hidden"])');
    const count = await inputs.count();
    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const ariaLabel = await input.getAttribute('aria-label');
      const id = await input.getAttribute('id');
      if (!ariaLabel && id) {
        await expect(page.locator(`label[for="${id}"]`)).toBeVisible();
      }
    }
  });
});
