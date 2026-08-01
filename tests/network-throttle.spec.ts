import { test, expect } from '@playwright/test';
import { installAudioProbe, readProbe } from './helpers/audio-probe';

// Slow 3G-ish profile applied via Chrome DevTools Protocol.
const SLOW_3G = {
  offline: false,
  downloadThroughput: (400 * 1024) / 8, // ~400 kbps
  uploadThroughput: (400 * 1024) / 8,
  latency: 400, // ms RTT
};

test.describe('Behaviour on a slow connection', () => {
  test('page still loads and becomes interactive on slow 3G', async ({ page }) => {
    const client = await page.context().newCDPSession(page);
    await client.send('Network.enable');
    await client.send('Network.emulateNetworkConditions', SLOW_3G);

    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60_000 });

    // The sounds section heading should appear even if assets are still streaming.
    await expect(page.locator('#sounds')).toBeVisible({ timeout: 60_000 });
    await expect(page.locator(`button[aria-label="پخش باران تهران"]`).first()).toBeVisible({
      timeout: 60_000,
    });
  });

  test('a sound eventually plays after the file streams in on slow 3G', async ({ page }) => {
    await installAudioProbe(page);
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await page.waitForLoadState('networkidle').catch(() => {});

    // Throttle AFTER first paint so we measure asset fetch, not bundle load.
    const client = await page.context().newCDPSession(page);
    await client.send('Network.enable');
    await client.send('Network.emulateNetworkConditions', SLOW_3G);

    await page.locator(`button[aria-label="پخش باران تهران"]`).first().click();

    // rain.mp3 is ~230KB → a few seconds at 400kbps. Poll until decoded.
    await expect
      .poll(async () => (await readProbe(page)).decodeOk, {
        timeout: 30_000,
        intervals: [500, 1000, 2000],
      })
      .toBeGreaterThan(0);

    const probe = await readProbe(page);
    expect(probe.startedCount, 'source should start once decoded').toBeGreaterThan(0);
  });

  test('turning a loading sound off prevents it from starting later', async ({ page }) => {
    await installAudioProbe(page);
    await page.route('**/sounds/rain.mp3', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await route.continue();
    });
    await page.goto('/', { waitUntil: 'networkidle' });

    await page.locator('button[aria-label="پخش باران تهران"]').first().click();
    await page.locator('button[aria-label="توقف باران تهران"]').first().click();
    await page.waitForTimeout(2500);

    expect((await readProbe(page)).startedCount).toBe(0);
    await expect(page.locator('button[aria-label="پخش باران تهران"]').first()).toBeVisible();
  });

  test('offline: clicking a sound fails gracefully without crashing the page', async ({
    page,
  }) => {
    await installAudioProbe(page);
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await page.waitForLoadState('networkidle').catch(() => {});

    const pageErrors: string[] = [];
    page.on('pageerror', (e) => pageErrors.push(e.message));

    const client = await page.context().newCDPSession(page);
    await client.send('Network.enable');
    await client.send('Network.emulateNetworkConditions', {
      offline: true,
      downloadThroughput: 0,
      uploadThroughput: 0,
      latency: 0,
    });

    // Use a sound not yet cached
    await page.locator(`button[aria-label="پخش امواج خزر"]`).first().click();
    await page.waitForTimeout(2000);

    // The app must not throw an uncaught error; the UI must remain responsive.
    expect(pageErrors, `Uncaught errors offline:\n${pageErrors.join('\n')}`).toEqual([]);
    await expect(page.locator('#sounds')).toBeVisible();
  });

  test('a failed sound load restores the inactive UI and explains the failure', async ({ page }) => {
    await installAudioProbe(page);
    await page.route('**/sounds/ocean.mp3', (route) => route.abort('failed'));
    await page.goto('/', { waitUntil: 'networkidle' });

    await page.locator('button[aria-label="پخش امواج خزر"]').first().click();

    await expect(page.locator('button[aria-label="پخش امواج خزر"]').first()).toBeVisible();
    await expect(page.locator('#audio-error')).toContainText('بارگذاری صدا انجام نشد');
  });
});
