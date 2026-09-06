import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Automated accessibility sweep — WCAG 2.2 AA via axe-core.
 * Runs on the core pages in CI; zero critical violations is the bar.
 * RTL (Arabic) is swept too: direction flips must not break contrast,
 * labels, or focus order.
 */

const PAGES = ['/', '/projects', '/affordable-housing', '/food', '/news', '/resources', '/faq', '/settings', '/tools', '/map'];

test.describe('axe-core — light mode', () => {
  for (const path of PAGES) {
    test(`no critical violations: ${path}`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      // Give client data fetching a beat before the sweep.
      await page.waitForTimeout(1200);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      const critical = results.violations.filter((v) =>
        ['critical', 'serious'].includes(v.impact ?? ''),
      );
      expect(
        critical.map((v) => `${v.id}: ${v.nodes.length} nodes`),
        JSON.stringify(critical, null, 2),
      ).toEqual([]);
    });
  }
});

test.describe('axe-core — dark mode', () => {
  test('dashboard has no critical violations in dark mode', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'dor101-settings',
        JSON.stringify({ state: { theme: 'dark' }, version: 0 }),
      );
    });
    await page.goto('/');
    await page.waitForTimeout(1000);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
      .analyze();
    const critical = results.violations.filter((v) => ['critical', 'serious'].includes(v.impact ?? ''));
    expect(critical.map((v) => v.id)).toEqual([]);
  });
});

test.describe('axe-core — RTL Arabic', () => {
  test('dashboard in Arabic has no critical violations', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'dor101-settings',
        JSON.stringify({ state: { language: 'ar' }, version: 0 }),
      );
    });
    await page.goto('/');
    await page.waitForTimeout(1000);
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
      .analyze();
    const critical = results.violations.filter((v) => ['critical', 'serious'].includes(v.impact ?? ''));
    expect(critical.map((v) => v.id)).toEqual([]);
  });
});
