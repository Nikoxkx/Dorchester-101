import { expect, test } from '@playwright/test';
import { dictionaries } from '../src/i18n';
import { LANGUAGES } from '../src/i18n/config';
import { NAV_LABEL_KEY } from '../src/i18n/pageTitles';
import type { TranslationKey } from '../src/i18n/en';

const pages: Array<[string, TranslationKey]> = [
  ['/', 'intro.title'],
  ['/resources', 'resources.title'],
  ['/privacy', 'privacy.title'],
  ['/projects', 'projects.title'],
  ['/map', 'map.title'],
  ['/news', 'news.title'],
  ['/winter-clothing', 'clothing.title'],
];

test.use({ serviceWorkers: 'block' });

for (const language of LANGUAGES) {
  test(`${language.code} headings and browser titles follow the selected language`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium');
    await page.addInitScript((code) => {
      localStorage.setItem('dor101-settings', JSON.stringify({ state: { language: code, weatherEnabled: false, autoRefresh: false }, version: 6 }));
      localStorage.setItem('dor101-privacy-choice', JSON.stringify({ state: { choice: 'decline' }, version: 1 }));
    }, language.code);
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(`${new URL(page.url()).pathname}: ${error.message}`));
    for (const [path, key] of pages) {
      const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
      expect(response?.status(), path).toBeLessThan(400);
      await expect(page.locator('html')).toHaveAttribute('lang', language.contentLocale, { timeout: 20_000 });
      await expect(page.locator('html')).toHaveAttribute('dir', language.dir);
      await expect(page.locator('h1').first()).toHaveText(dictionaries[language.code][key], { timeout: 20_000 });
      await expect(page).toHaveTitle(`${dictionaries[language.code][NAV_LABEL_KEY[path]]} · Dorchester 101`);
    }
    expect(errors).toEqual([]);
  });
}
