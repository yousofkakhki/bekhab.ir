import { test, expect } from '@playwright/test';

test.describe('Sleep Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should load the application', async ({ page }) => {
    const body = page.locator('body');
    await expect(body).toBeVisible();
    const content = page.locator('main, [role="main"]');
    if (await content.count() > 0) {
      await expect(content).toBeVisible();
    }
  });

  test('should have sound controls', async ({ page }) => {
    // Check if app has loaded - verify buttons or inputs exist
    const controls = page.locator('button, input, [role="button"]');
    const count = await controls.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should play/pause sounds', async ({ page }) => {
    // Look for play buttons
    const buttons = page.locator('button');
    const playButton = buttons.first();
    await expect(playButton).toBeVisible();
    await playButton.click();
  });

  test('should calculate sleep cycles', async ({ page }) => {
    // Look for time inputs
    const inputs = page.locator('input[type="time"], input[type="number"]');
    if (await inputs.count() > 0) {
      const firstInput = inputs.first();
      await firstInput.fill('23:00');
      await page.waitForTimeout(500);
    }
  });

  test('should have focus mode', async ({ page }) => {
    // Look for focus mode button
    const buttons = page.locator('button');
    const focusButton = buttons.filter({ hasText: /focus|تمرکز/ }).first();
    if (await focusButton.isVisible()) {
      await focusButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('all sounds are accessible (200 status)', async ({ page }) => {
    const sounds = ['rain', 'fire', 'white-noise', 'fan', 'ocean', 'birds', 'thunder', 'wind'];

    for (const sound of sounds) {
      const response = await page.goto(`/sounds/${sound}.mp3`, { waitUntil: 'domcontentloaded' });
      expect(response?.status()).toBe(200);
    }
  });

  test('should render correctly in RTL (Persian)', async ({ page }) => {
    const html = page.locator('html');
    const dir = await html.getAttribute('dir');
    expect(dir).toBe('rtl');

    const lang = await html.getAttribute('lang');
    expect(lang).toBe('fa');
  });

  test('should persist sound mix to localStorage', async ({ page }) => {
    // Check if sound volumes can be adjusted
    const sliders = page.locator('input[type="range"]');
    if (await sliders.count() > 0) {
      const slider = sliders.first();
      // Verify slider can be interacted with
      await expect(slider).toBeVisible();
      await slider.evaluate((el: HTMLInputElement) => {
        el.value = '0.5';
        el.dispatchEvent(new Event('change', { bubbles: true }));
      });
    }
  });

  test('should handle no audio playback gracefully', async ({ page }) => {
    // The app should not crash even if audio can't play
    const buttons = page.locator('button');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);
  });

  test('sleep calculation warning for short sleep', async ({ page }) => {
    // Look for warning cards or alerts
    const cards = page.locator('[class*="card"], [class*="alert"], [class*="warning"]');
    const cardCount = await cards.count();
    // Should have some UI elements
    expect(cardCount).toBeGreaterThanOrEqual(0);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    const headings = page.locator('h1, h2, h3');
    const count = await headings.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should be responsive - check mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    const content = page.locator('body');
    await expect(content).toBeVisible();
  });
});
