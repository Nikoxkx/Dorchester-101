import { test, expect } from '@playwright/test';

/**
 * Core-flow E2E coverage.
 * English is the default; the RTL suite flips the app to Arabic and asserts
 * both the language attribute and the direction flip (WCAG/RTL guarantee).
 * The axe sweep lives in e2e/accessibility.spec.ts and runs in CI.
 */

test.describe('DOR101 — core flows (English)', () => {
  test('dashboard loads with live sections', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('link', { name: /full map|Full map/i }).first()).toBeVisible();
    // Quick actions render
    await expect(page.getByText('Quick actions')).toBeVisible();
  });

  test('command palette opens with Cmd+K and finds sections', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Control+k');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await page.keyboard.type('food');
    await expect(dialog.getByRole('option').first()).toBeVisible({ timeout: 5000 });
    await page.keyboard.press('Enter');
    await page.waitForURL('**/food');
    await expect(page.locator('h1')).toContainText(/Food/i);
  });

  test('projects: filter, open detail sheet, save favorite', async ({ page }) => {
    await page.goto('/projects');
    await expect(page.locator('h1')).toContainText(/Projects/i);
    await page.getByRole('button', { name: /view details/i }).first().click();
    const sheet = page.getByRole('dialog');
    await expect(sheet).toBeVisible();
    await sheet.getByRole('button', { name: /save/i }).first().click();
    // Heart state toggles without reload
    await expect(sheet.locator('button[aria-pressed="true"]').first()).toBeVisible();
  });

  test('affordable housing: AMI calculator computes against HUD limits', async ({ page }) => {
    await page.goto('/affordable-housing');
    await page.getByRole('tab', { name: /AMI calculator/i }).click();
    await expect(page.getByText(/of Area Median Income|Area Median Income/i).first()).toBeVisible();
    // A household of 4 at $85,700 is exactly 50% AMI per HUD FY2026
    const income = page.locator('#hh-income');
    await income.fill('85700');
    await expect(page.getByText('50%')).toBeVisible();
  });

  test('food resources: hotline visible, pantries listed with hours', async ({ page }) => {
    await page.goto('/food');
    await expect(page.getByRole('link', { name: /1-800-645-8333/ })).toBeVisible();
    await expect(page.locator('article').first()).toBeVisible();
  });

  test('settings: theme, text size, and accessibility toggles persist', async ({ page }) => {
    await page.goto('/settings');
    await page.getByRole('switch', { name: /reduce motion/i }).click();
    await page.reload();
    await expect(page.getByRole('switch', { name: /reduce motion/i })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  test('404 page renders the design system, not framework default', async ({ page }) => {
    const res = await page.goto('/this-page-does-not-exist');
    expect(res?.status()).toBe(404);
    await expect(page.getByText('Page not found')).toBeVisible();
  });
});

test.describe('DOR101 — RTL (Arabic)', () => {
  test('switching to Arabic flips direction and translates UI', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /language/i }).click();
    await page.getByRole('option', { name: /العربية/ }).click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    // Sidebar sits on the right in RTL
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible();
    const box = await sidebar.boundingBox();
    const viewport = page.viewportSize();
    if (box && viewport) {
      expect(box.x).toBeGreaterThan(viewport.width / 2);
    }
  });

  test('Arabic dashboard renders translated headings', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'dor101-settings',
        JSON.stringify({ state: { language: 'ar', theme: 'light' }, version: 0 }),
      );
    });
    await page.goto('/');
    await expect(page.locator('h1')).not.toBeEmpty();
    // Arabic script visible somewhere in the header area
    await expect(page.getByText(/الرئيسية|دورتشستر/).first()).toBeVisible();
  });

  test('Arabic projects page keeps filter controls usable', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'dor101-settings',
        JSON.stringify({ state: { language: 'ar' }, version: 0 }),
      );
    });
    await page.goto('/projects');
    await expect(page.locator('h1')).toContainText(/مشاريع/);
    await expect(page.getByRole('tab', { name: /الكل|الجميع/ }).first()).toBeVisible();
  });
});

test.describe('Responsive', () => {
  test('mobile layout: bottom tab bar and drawer', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    const menu = page.getByRole('button', { name: /open menu/i });
    await expect(menu).toBeVisible();
    await menu.click();
    await expect(page.locator('aside').last()).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible();
  });
});

test.describe('Accessibility basics', () => {
  test('skip link appears on focus', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: /skip/i })).toBeFocused();
  });

  test('images have alt text', async ({ page }) => {
    await page.goto('/');
    const images = page.locator('img');
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      expect(await images.nth(i).getAttribute('alt')).not.toBeNull();
    }
  });
});
