import { expect, test } from '@playwright/test';

const copy = {
  es: {
    '/': { heading: 'Encuentre vivienda, alimentos y ayuda en Dorchester', title: 'Inicio · Dorchester 101' },
    '/embed': { heading: 'Dorchester 101 · Directorio de recursos comunitarios', title: 'Directorio · Dorchester 101' },
    '/map': { heading: 'Mapa de recursos de Dorchester', title: 'Mapa y transporte · Dorchester 101' },
    '/food': { heading: 'Alimentos', title: 'Alimentos · Dorchester 101' },
    '/market-trends': { heading: 'Tendencias del mercado', title: 'Tendencias del mercado · Dorchester 101' },
  },
  ar: {
    '/': { heading: 'اعثر على الإسكان والغذاء والمساعدة في دورتشستر', title: 'الرئيسية · Dorchester 101' },
    '/embed': { heading: 'Dorchester 101 · دليل الموارد المجتمعية', title: 'دليل الموارد · Dorchester 101' },
    '/map': { heading: 'خريطة موارد دورتشستر', title: 'الخريطة والمواصلات · Dorchester 101' },
    '/food': { heading: 'الغذاء', title: 'الغذاء · Dorchester 101' },
    '/market-trends': { heading: 'اتجاهات السوق', title: 'اتجاهات السوق · Dorchester 101' },
  },
} as const;

test.describe('mobile localized layouts', () => {
  for (const lang of ['es', 'ar'] as const) {
    for (const width of [320, 390]) {
      test(`${lang} stays readable at ${width}px after hydration`, async ({ page }, testInfo) => {
        // The viewport is set explicitly here; the desktop project would duplicate it.
        test.skip(testInfo.project.name !== 'Mobile Chrome');
        await page.setViewportSize({ width, height: 844 });
        await page.addInitScript(({ language }) => {
          if (!localStorage.getItem('dor101-settings')) {
            localStorage.setItem('dor101-settings', JSON.stringify({
              state: { language, weatherEnabled: true, autoRefresh: false }, version: 6,
            }));
          }
          if (!localStorage.getItem('dor101-privacy-choice')) {
            localStorage.setItem('dor101-privacy-choice', JSON.stringify({ state: { choice: 'decline' }, version: 1 }));
          }
        }, { language: lang });

        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        for (const path of ['/', '/embed', '/map', '/food', '/market-trends'] as const) {
          await page.goto(path, { waitUntil: 'domcontentloaded' });
          await expect(page.locator('html')).toHaveAttribute('lang', lang);
          await expect(page.locator('html')).toHaveAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
          // Waiting for the localized heading also waits for this page's client
          // island, not just the shared document settings, to hydrate.
          await expect(page.getByRole('heading', { level: 1 })).toHaveText(copy[lang][path].heading, { timeout: 20_000 });
          if (path === '/map') await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 20_000 });
          if (path === '/market-trends') await expect(page.locator('#snapshot')).toBeVisible({ timeout: 20_000 });
          await expect(page).toHaveTitle(copy[lang][path].title);
          await expect.poll(
            () => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth),
            { message: `${path} must not overflow horizontally at ${width}px` },
          ).toBeLessThanOrEqual(2);
        }
        expect(errors).toEqual([]);
      });
    }
  }
});
