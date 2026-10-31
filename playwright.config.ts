import { defineConfig, devices } from '@playwright/test';

/**
 * E2E configuration.
 *
 * Every project here runs on the **chromium** binary, because that is the only
 * one CI installs (`npx playwright install --with-deps chromium`). The previous
 * firefox and webkit projects could never pass in CI — the binaries were not on
 * the runner — so the job failed before a single assertion ran. Mobile
 * coverage is kept by emulating a phone viewport and user agent on chromium,
 * which is what those projects were really checking anyway.
 *
 * The server under test is the production build (`npm run build` then
 * `npm run start`), not `next dev`: dev compiles on demand, which makes the
 * suite slow and exercises a server nobody ships.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never' }], ['json', { outputFile: 'playwright-report/results.json' }]]
    : 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    /*
     * Every suite except `privacy-controls.spec.ts` starts with a stored decline,
     * so the first-visit consent card is not floating over the controls those
     * tests click. The consent spec opts out with an empty storage state.
     */
    storageState: {
      cookies: [],
      origins: [
        {
          origin: 'http://localhost:3000',
          localStorage: [
            { name: 'dor101-privacy-choice', value: JSON.stringify({ state: { choice: 'decline' }, version: 1 }) },
          ],
        },
      ],
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
