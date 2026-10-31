import { expect, test } from '@playwright/test';

const scripts = 'script[src*="vercel-scripts.com"],script[src*="/_vercel/insights"],script[src*="/_vercel/speed-insights"]';

test('the corner pop-up fits a small Arabic screen and a decline persists', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'Mobile Chrome');
  await page.setViewportSize({ width: 320, height: 568 });
  await page.addInitScript(() => {
    // A legacy acknowledgement is not permission for optional analytics.
    if (!localStorage.getItem('dor101-settings')) localStorage.setItem('dor101-settings', JSON.stringify({ state: { language: 'ar', consentSeen: true }, version: 6 }));
  });
  await page.goto('/privacy', { waitUntil: 'domcontentloaded' });
  const notice = page.getByRole('dialog', { name: 'خيارات خصوصيتك' });
  await expect(notice).toBeVisible({ timeout: 20_000 });
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator(scripts)).toHaveCount(0);
  const rect = await notice.boundingBox();
  expect(rect).not.toBeNull();
  expect(rect!.x).toBeGreaterThanOrEqual(0);
  expect(rect!.x + rect!.width).toBeLessThanOrEqual(321);
  expect(rect!.y).toBeGreaterThanOrEqual(0);
  expect(rect!.y + rect!.height).toBeLessThanOrEqual(569);
  expect(await notice.evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe('rgba(0, 0, 0, 0)');

  const controls = notice.locator('a, button');
  await expect(controls).toHaveCount(5);
  for (const control of await controls.all()) {
    await control.scrollIntoViewIfNeeded();
    const box = await control.boundingBox();
    const panel = await notice.boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(panel!.x - 1);
    expect(box!.x + box!.width).toBeLessThanOrEqual(panel!.x + panel!.width + 1);
    expect(box!.y).toBeGreaterThanOrEqual(panel!.y - 1);
    expect(box!.y + box!.height).toBeLessThanOrEqual(panel!.y + panel!.height + 1);
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.y + box!.height).toBeLessThanOrEqual(569);
  }
  await notice.getByRole('button', { name: 'المتابعة دون تحليلات' }).click();
  await expect(notice).toHaveCount(0);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('dor101-privacy-choice')!).state.choice)).toBe('decline');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(notice).toHaveCount(0);
  await expect(page.locator(scripts)).toHaveCount(0);
});

test('the pop-up leaves the page usable and does not force an analytics choice', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'Mobile Chrome');
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('/weather', { waitUntil: 'domcontentloaded' });
  const notice = page.getByRole('dialog', { name: 'Your privacy choices' });
  await expect(notice).toBeVisible({ timeout: 20_000 });

  // No scrim: a control at the top of the page still receives the click.
  await page.getByRole('button', { name: 'Open menu' }).click();
  await expect(page.locator('.dor101-shell')).toHaveAttribute('data-mobile-open', 'true');
  await page.locator('.dor101-scrim').click({ position: { x: 8, y: 8 } });
  await expect(page.locator('.dor101-shell')).toHaveAttribute('data-mobile-open', 'false');

  // Reading the page without answering writes nothing and mounts no SDK.
  await expect(notice).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('dor101-privacy-choice') ?? '{"state":{}}').state.choice ?? 'unset')).toBe('unset');
  await expect(page.locator(scripts)).toHaveCount(0);
});

test('an explicit analytics choice can be withdrawn in another tab', async ({ page, context }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem('dor101-settings')) localStorage.setItem('dor101-settings', JSON.stringify({ state: { language: 'en' }, version: 6 }));
  });
  await page.goto('/privacy', { waitUntil: 'domcontentloaded' });
  const notice = page.getByRole('dialog', { name: 'Your privacy choices' });
  await expect(notice).toBeVisible({ timeout: 20_000 });
  await expect(page.locator(scripts)).toHaveCount(0);
  await notice.getByRole('button', { name: 'Allow analytics' }).click();
  await expect.poll(() => page.locator(scripts).count()).toBeGreaterThanOrEqual(2);

  // Inspect the SDKs' queued beforeSend callbacks. This checks local gating and
  // URL filtering, not deployed network behavior or provider configuration.
  const filtered = await page.evaluate(() => {
    type Queue = Array<[string, (event: { type: string; url: string }) => { url: string } | null]>;
    const win = window as Window & { vaq?: Queue; siq?: Queue };
    const event = { type: 'pageview', url: 'https://example.org/path?private=yes#fragment' };
    return [win.vaq?.find(([name]) => name === 'beforeSend')?.[1](event)?.url,
      win.siq?.find(([name]) => name === 'beforeSend')?.[1](event)?.url];
  });
  expect(filtered).toEqual(['https://example.org/path', 'https://example.org/path']);

  const settings = await context.newPage();
  await settings.goto('/settings#privacy', { waitUntil: 'domcontentloaded' });
  const toggle = settings.getByRole('switch', { name: 'Optional analytics and performance' });
  await expect(toggle).toBeChecked({ timeout: 20_000 });
  await toggle.click();
  await expect(toggle).not.toBeChecked();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('dor101-privacy-choice')!).state.choice)).toBe('decline');
  await expect.poll(() => page.evaluate(() => {
    type Queue = Array<[string, (event: { type: string; url: string }) => unknown]>;
    const win = window as Window & { vaq?: Queue; siq?: Queue };
    const event = { type: 'pageview', url: 'https://example.org/path' };
    return [win.vaq?.find(([name]) => name === 'beforeSend')?.[1](event), win.siq?.find(([name]) => name === 'beforeSend')?.[1](event)];
  })).toEqual([null, null]);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator(scripts)).toHaveCount(0);
});
