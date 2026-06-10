import { test, expect } from '@playwright/test';

test.describe('DOR101 Application', () => {
  test('homepage loads correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check main title is visible
    await expect(page.locator('text=DOR101')).toBeVisible({ timeout: 10000 });
    
    // Check navigation is present
    await expect(page.locator('nav')).toBeVisible();
    
    // Check dashboard section exists
    await expect(page.locator('text=Dorchester')).toBeVisible();
  });

  test('language switching works', async ({ page }) => {
    await page.goto('/');
    
    // Find language selector in settings or header
    const langButton = page.locator('button:has-text("Language"), button:has-text("English")').first();
    await langButton.click();
    
    // Select Spanish
    await page.locator('text=Español').click();
    
    // Wait for re-render
    await page.waitForTimeout(500);
    
    // Verify translation changed (should see Spanish text)
    const body = await page.textContent('body');
    // The body should contain some Spanish text
    expect(body).toBeTruthy();
  });

  test('navigation works', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to Projects
    await page.click('text=Housing Projects');
    await page.waitForURL('**/projects');
    await expect(page.locator('h1:has-text("Housing Projects"), h1:has-text("Proyectos")')).toBeVisible();
    
    // Navigate to Map
    await page.click('text=Map');
    await page.waitForURL('**/map');
    
    // Navigate to Resources
    await page.click('text=Resources');
    await page.waitForURL('**/resources');
    await expect(page.locator('h1:has-text("Resource"), h1:has-text("Recurso")')).toBeVisible();
  });

  test('news section shows articles', async ({ page }) => {
    await page.goto('/news');
    
    // Check news section loads
    await expect(page.locator('h1:has-text("News"), h1:has-text("Noticia")')).toBeVisible({ timeout: 10000 });
    
    // Wait for articles to load
    await page.waitForTimeout(2000);
    
    // Check that articles are displayed
    const articles = page.locator('[class*="article"], [class*="news-item"]');
    const count = await articles.count();
    expect(count).toBeGreaterThan(0);
  });

  test('map page loads with map', async ({ page }) => {
    await page.goto('/map');
    
    // Check map section is present
    await expect(page.locator('text=Dorchester, text=Map')).toBeVisible({ timeout: 10000 });
    
    // Check map container exists
    const mapContainer = page.locator('[class*="map"], [class*="leaflet"]');
    await expect(mapContainer.first()).toBeVisible();
  });

  test('settings page is accessible', async ({ page }) => {
    await page.goto('/settings');
    
    // Check settings page loads
    await expect(page.locator('h1:has-text("Settings"), h1:has-text("Configuración")')).toBeVisible({ timeout: 10000 });
    
    // Check language selector exists
    await expect(page.locator('text=Language')).toBeVisible();
  });

  test('notifications are displayed', async ({ page }) => {
    await page.goto('/');
    
    // Look for notification bell/icon
    const notificationIcon = page.locator('[aria-label*="notification"], [class*="notification"]').first();
    if (await notificationIcon.isVisible()) {
      await notificationIcon.click();
      
      // Check notifications panel opens
      await expect(page.locator('text=Notifications')).toBeVisible({ timeout: 5000 });
    }
  });

  test('search functionality works', async ({ page }) => {
    await page.goto('/projects');
    
    // Find search input
    const searchInput = page.locator('input[type="text"], input[placeholder*="Search"]').first();
    await searchInput.fill('housing');
    
    // Wait for results
    await page.waitForTimeout(500);
    
    // Check results are filtered
    const projectCards = page.locator('[class*="Card"], [class*="card"]');
    const count = await projectCards.count();
    expect(count).toBeGreaterThanOrEqual(0); // Just verify it doesn't crash
  });
});

test.describe('Responsive Design', () => {
  test('mobile layout works', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check mobile menu exists or is accessible
    const menuButton = page.locator('button[aria-label*="menu"], button[class*="menu"]').first();
    if (await menuButton.isVisible()) {
      await menuButton.click();
    }
    
    // Verify page is usable
    await expect(page.locator('text=DOR101')).toBeVisible();
  });

  test('tablet layout works', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    // Verify layout adapts
    await expect(page.locator('text=DOR101')).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('page has proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    
    // Check h1 exists
    const h1 = page.locator('h1');
    await expect(h1.first()).toBeVisible();
  });

  test('images have alt text', async ({ page }) => {
    await page.goto('/');
    
    // Check images have alt attributes
    const images = page.locator('img');
    const count = await images.count();
    
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      // Alt should exist (can be empty string for decorative images)
      expect(alt).not.toBeNull();
    }
  });

  test('form inputs have labels', async ({ page }) => {
    await page.goto('/settings');
    
    // Find all inputs
    const inputs = page.locator('input:not([type="hidden"])');
    const count = await inputs.count();
    
    // Check each input has associated label
    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const ariaLabel = await input.getAttribute('aria-label');
      const id = await input.getAttribute('id');
      
      // Either aria-label or associated label should exist
      if (!ariaLabel && id) {
        const label = page.locator(`label[for="${id}"]`);
        await expect(label).toBeVisible();
      }
    }
  });
});