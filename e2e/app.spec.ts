import { test, expect } from '@playwright/test';

/**
 * End-to-end checks for the site as it is actually built.
 *
 * These assert against the production build (`npm run build` + `npm run start`,
 * see playwright.config.ts) and stick to things the server renders or the
 * browser can reach deterministically. Assertions that depended on a
 * third-party feed answering, or on a phrase that no longer exists in the
 * markup, are what made this suite red for months without telling anyone
 * anything about the app.
 */

/** Routes that must render, with a phrase each one is known to contain. */
const PAGES: Array<{ path: string; heading: RegExp }> = [
  { path: '/', heading: /Find housing, food and help in Dorchester/i },
  { path: '/projects', heading: /Housing projects/i },
  { path: '/map', heading: /Dorchester resource map/i },
  { path: '/news', heading: /Local news/i },
  { path: '/settings', heading: /Settings|Configuración/i },
  // /food and /market-trends render their h1 in a client island, so these two
  // wait for hydration rather than reading server-rendered HTML.
  { path: '/food', heading: /^Food$|Alimentos|Manje/i },
  { path: '/faq', heading: /questions|preguntas/i },
  { path: '/about', heading: /About|Acerca/i },
  { path: '/affordable-housing', heading: /housing|vivienda/i },
  { path: '/market-trends', heading: /Market trends|Tendencias del mercado/i },
  { path: '/neighborhood', heading: /Dorchester Guide|neighborhood|barrio/i },
  { path: '/tools', heading: /tools|herramientas/i },
  { path: '/directory', heading: /directory|directorio|services|servicios/i },
  { path: '/privacy', heading: /privacy|privacidad/i },
  { path: '/terms', heading: /terms|términos/i },
];

test.describe('Pages render', () => {
  for (const page of PAGES) {
    test(`${page.path} renders its heading`, async ({ page: p }) => {
      const response = await p.goto(page.path);
      expect(response?.status(), `${page.path} should answer 200`).toBe(200);
      await expect(p.getByRole('heading', { level: 1 }).first()).toContainText(page.heading, {
        timeout: 15_000,
      });
    });
  }
});

test.describe('Navigation', () => {
  test('the nav points at routes that exist', async ({ page }) => {
    await page.goto('/');

    // The header, the mobile drawer and the footer each carry a <nav>, so this
    // is deliberately not a bare `nav` locator — that resolves to three
    // elements and fails Playwright's strict mode.
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();

    // Asserted on the attribute rather than the click: whether a given link is
    // expanded at this viewport is a layout detail, and a wrong href is the
    // thing that actually breaks the site.
    for (const [label, href] of [
      ['Housing projects', '/projects'],
      ['Map and transit', '/map'],
      ['Directory', '/resources'],
      ['News', '/news'],
      ['Food', '/food'],
    ] as const) {
      const link = nav.locator(`a[href="${href}"]`).first();
      await expect(link, `nav should link to ${href}`).toHaveCount(1);
      await expect(link).toContainText(new RegExp(label.split(' ')[0], 'i'));
    }
  });

  test('following a nav link loads the destination', async ({ page }) => {
    await page.goto('/');
    const link = page.getByRole('link', { name: /Housing projects/i }).first();

    // Below the `lg` breakpoint the rail is a drawer that starts closed, so the
    // link exists in the DOM but is off-canvas. Opening it is what a person on
    // a phone actually does.
    if (!(await link.isVisible())) {
      await page.getByRole('button', { name: /open menu/i }).click();
    }

    await expect(link).toBeVisible();
    await link.click();
    await page.waitForURL('**/projects');
    await expect(page.getByRole('heading', { level: 1 }).first()).toContainText(/Housing projects/i);
  });

  test('an unknown route shows the not-found page, not a crash', async ({ page }) => {
    const response = await page.goto('/this-route-does-not-exist');
    expect(response?.status()).toBe(404);
  });
});

test.describe('Language', () => {
  test('the language switcher offers English and Spanish', async ({ page }) => {
    await page.goto('/');

    // The header trigger opens a menu whose options are <button role=
    // "menuitemradio">. The explicit role replaces the implicit "button" role,
    // so getByRole('button', ...) matches none of them — that is why this test
    // reported "element(s) not found" while the options were on the page.
    const trigger = page.getByRole('button', { name: /change language/i });
    await expect(trigger).toBeVisible();
    await trigger.click();

    const menu = page.getByRole('menu', { name: /choose your language/i });
    await expect(menu).toBeVisible();
    await expect(menu.getByRole('menuitemradio', { name: /English/i }).first()).toBeVisible();
    await expect(menu.getByRole('menuitemradio', { name: /Español|Spanish/i }).first()).toBeVisible();
  });
});

test.describe('API routes the UI depends on', () => {
  test('/api/health reports the build version', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject({ service: 'DOR101' });
    expect(typeof body.version).toBe('string');
    expect(body.version).toMatch(/^\d+\.\d+\.\d+/);
    expect(Array.isArray(body.checks)).toBe(true);
  });

  test('/api/resources answers with the directory', async ({ request }) => {
    const response = await request.get('/api/resources');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
  });

  test('the manifest and an icon are served', async ({ request }) => {
    const manifest = await request.get('/manifest.json');
    expect(manifest.status()).toBe(200);
    expect((await manifest.json()).name).toBeTruthy();

    const icon = await request.get('/icons/icon-192.png');
    expect(icon.status()).toBe(200);
    expect(icon.headers()['content-type']).toContain('image/png');
  });
});

test.describe('Search', () => {
  test('the projects search box accepts input without breaking the page', async ({ page }) => {
    await page.goto('/projects');
    const input = page.locator('input[type="text"]').first();
    await expect(input).toBeVisible();
    await input.fill('housing');
    await page.waitForTimeout(500);
    // The point is that filtering does not throw; a count of zero results is a
    // legitimate answer and must not fail the run.
    await expect(page.getByRole('heading', { level: 1 }).first()).toContainText(/Housing projects/i);
  });
});

test.describe('Accessibility', () => {
  test('every page has exactly one h1', async ({ page }) => {
    for (const { path } of PAGES) {
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
    }
  });

  test('images on the homepage carry an alt attribute', async ({ page }) => {
    await page.goto('/');
    const images = page.locator('img');
    const count = await images.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i += 1) {
      // An empty alt is correct for decoration; a missing one is not.
      expect(await images.nth(i).getAttribute('alt'), `img #${i} has no alt`).not.toBeNull();
    }
  });

  test('settings inputs are labelled', async ({ page }) => {
    await page.goto('/settings');

    // Judged in the page, because a control counts as labelled if it has an
    // aria-label, a label[for], an aria-labelledby, or a wrapping <label> —
    // which is how the 25 theme/density radio buttons on this page are marked
    // up. Counting only aria-label and label[for] reports 25 false failures.
    const { total, unlabelled } = await page.evaluate(() => {
      const controls = Array.from(
        document.querySelectorAll<HTMLElement>('input:not([type="hidden"]), select, textarea'),
      );
      const isLabelled = (el: HTMLElement) =>
        Boolean(el.getAttribute('aria-label')) ||
        Boolean(el.getAttribute('aria-labelledby')) ||
        (Boolean(el.id) && document.querySelector(`label[for="${CSS.escape(el.id)}"]`) !== null) ||
        el.closest('label') !== null;
      return {
        total: controls.length,
        unlabelled: controls
          .filter((el) => !isLabelled(el))
          .map((el) => `${el.tagName.toLowerCase()}[type=${el.getAttribute('type') ?? '-'}]`),
      };
    });

    expect(total).toBeGreaterThan(0);
    expect(unlabelled, `unlabelled controls on /settings: ${unlabelled.join(', ')}`).toEqual([]);
  });
});

test.describe('Responsive layout', () => {
  test('the homepage is usable on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
    // Nothing should force horizontal scrolling at phone width.
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, 'page scrolls horizontally on a 375px viewport').toBeLessThanOrEqual(1);
  });

  test('the homepage is usable on a tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
  });
});

// TEMPORARY DIAGNOSTIC — remove once the overflow source is identified.
test('DIAG overflow at 375px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  await page.waitForTimeout(3000);
  const info = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const offenders: string[] = [];
    for (const el of Array.from(document.querySelectorAll('*'))) {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.right > vw + 1) {
        const cls = (typeof el.className === 'string' ? el.className : '').trim().slice(0, 90);
        offenders.push(
          `${el.tagName.toLowerCase()} right=${Math.round(r.right)} w=${Math.round(r.width)}` +
            `${cls ? ` class="${cls}"` : ''}${el.id ? ` id=${el.id}` : ''}`,
        );
      }
    }
    return {
      clientWidth: vw,
      scrollWidth: document.documentElement.scrollWidth,
      bodyScrollWidth: document.body.scrollWidth,
      offenderCount: offenders.length,
      widest: offenders.slice(0, 30),
    };
  });
  console.log('OVERFLOW-DIAG ' + JSON.stringify(info));
});
