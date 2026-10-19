/**
 * Capture the real homepage, then frame it as a 1200×630 social card.
 * Start the app first. No fabricated UI, fixture data, or remote design assets.
 * See docs/SOCIAL-PREVIEWS.md for setup, refresh and deployment checks.
 */
import { chromium } from 'playwright';
import sharp from 'sharp';
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const baseURL = process.env.SOCIAL_CAPTURE_URL ?? 'http://localhost:3000';
const siteURL = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dorchester-101.vercel.app');
const output = path.join(root, 'public/social');
const dataURL = async (file, mime) => `data:${mime};base64,${(await readFile(path.join(root, file))).toString('base64')}`;
const escapeHTML = (text) => text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const browser = await chromium.launch({
  ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}),
  args: process.env.CHROMIUM_NO_SANDBOX === '1' ? ['--no-sandbox'] : [],
});
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 800 },
    deviceScaleFactor: 1,
    colorScheme: 'light',
    reducedMotion: 'reduce',
    locale: 'en-US',
    timezoneId: 'America/New_York',
    serviceWorkers: 'block',
  });
  const page = await context.newPage();
  await page.goto(baseURL, { waitUntil: 'domcontentloaded', timeout: 120_000 });
  await page.locator('.dor101-home h1').waitFor();
  // Dismiss the real notice through its own UI; no site content is rewritten.
  const notice = page.getByRole('region', { name: 'Your privacy, in plain words' });
  await notice.waitFor({ state: 'visible' });
  await notice.getByRole('button', { name: 'Got it', exact: true }).click();
  await notice.waitFor({ state: 'hidden' });
  await page.evaluate(async () => {
    await document.fonts.ready;
    const hero = document.querySelector('.dor101-home img');
    if (!(hero instanceof HTMLImageElement)) throw new Error('Homepage photo not found');
    await hero.decode();
    await Promise.all(document.getAnimations().filter((animation) =>
      animation.effect?.getComputedTiming().iterations !== Infinity,
    ).map((animation) => animation.finished.catch(() => {})));
  });
  // Only development tooling is hidden. Production UI remains untouched.
  await page.addStyleTag({ content: 'nextjs-portal { display: none !important; }' });
  const screenshot = await page.screenshot({ animations: 'disabled' });
  await mkdir(output, { recursive: true });
  await writeFile(path.join(output, 'homepage.png'), screenshot);

  const template = await readFile(path.join(root, 'scripts/lib/social-card.html'), 'utf8');
  const tokens = {
    DOMAIN: escapeHTML(siteURL.host),
    SCREENSHOT: `data:image/png;base64,${screenshot.toString('base64')}`,
    SANS: await dataURL('node_modules/@fontsource/public-sans/files/public-sans-latin-400-normal.woff2', 'font/woff2'),
    BOLD: await dataURL('node_modules/@fontsource/public-sans/files/public-sans-latin-700-normal.woff2', 'font/woff2'),
    DISPLAY: await dataURL('node_modules/@fontsource-variable/fraunces/files/fraunces-latin-wght-normal.woff2', 'font/woff2'),
  };
  // Use a separate page: the application's CSP must not affect composition.
  const card = await context.newPage();
  await card.setViewportSize({ width: 1200, height: 630 });
  await card.setContent(template.replace(/\{\{(\w+)\}\}/g, (_, key) => tokens[key]), { waitUntil: 'load' });
  await card.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((image) => image.decode()));
  });
  const jpeg = await sharp(await card.screenshot()).jpeg({ quality: 94, mozjpeg: true }).toBuffer();
  if (jpeg.length > 1_000_000) throw new Error('Social image exceeds the 1 MB budget');
  const hash = createHash('sha256').update(jpeg).digest('hex').slice(0, 12);
  const filename = `dorchester-101-${hash}.jpg`;
  await writeFile(path.join(output, filename), jpeg);
  await writeFile(path.join(root, 'src/lib/social-image.json'), JSON.stringify({
    url: `/social/${filename}`,
    width: 1200,
    height: 630,
    type: 'image/jpeg',
    alt: 'Dorchester 101 — a free community guide in nine languages. Actual homepage screenshot showing the Dorchester Bay hero, resource links and neighborhood navigation.',
  }, null, 2) + '\n');
  console.log(`Created ${filename} (${Math.round(jpeg.length / 1024)} KB) from ${baseURL}`);
} finally {
  await browser.close();
}
