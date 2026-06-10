import { test, expect } from '@playwright/test';
import {
  installAudioProbe,
  readProbe,
  readContextStates,
} from './helpers/audio-probe';

const RAIN = 'باران تهران';

/**
 * These run under the `mobile-android` project (Pixel 5 / Chrome Android UA).
 *
 * True background playback (screen locked / tab hidden) on Chrome Android requires
 * an HTMLMediaElement and/or the MediaSession API. A pure Web Audio AudioContext is
 * auto-suspended by the OS when backgrounded. We assert the prerequisites that
 * decide whether audio CAN survive backgrounding.
 */
test.describe('Chrome Android — background playback readiness', () => {
  test.beforeEach(async ({ page }) => {
    await installAudioProbe(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('runs under a mobile Android user agent', async ({ page }) => {
    const ua = await page.evaluate(() => navigator.userAgent);
    expect(ua).toMatch(/Android/i);
  });

  test('MediaSession metadata is published (enables lock-screen / background controls)', async ({
    page,
  }) => {
    await page.locator(`button[aria-label="پخش ${RAIN}"]`).first().click();
    await page.waitForTimeout(1000);

    const hasMediaSession = await page.evaluate(() => 'mediaSession' in navigator);
    expect(hasMediaSession, 'Browser lacks MediaSession API').toBeTruthy();

    const metadata = await page.evaluate(
      () => (navigator.mediaSession?.metadata?.title ?? null) as string | null
    );

    expect(
      metadata,
      'navigator.mediaSession.metadata is not set. Without it, Chrome Android shows no ' +
        'media notification and will not keep audio alive in the background.'
    ).not.toBeNull();
  });

  test('MediaSession play/pause action handlers are registered', async ({ page }) => {
    await page.locator(`button[aria-label="پخش ${RAIN}"]`).first().click();
    await page.waitForTimeout(1000);

    // We can't read handlers directly; instead assert the app set playbackState,
    // which any MediaSession-aware integration sets alongside handlers.
    const playbackState = await page.evaluate(
      () => (navigator.mediaSession?.playbackState ?? 'none') as string
    );

    expect(
      playbackState,
      'mediaSession.playbackState is "none" — no MediaSession integration, so OS media ' +
        'controls / background keep-alive are unavailable on Chrome Android.'
    ).not.toBe('none');
  });

  test('audio engine is not auto-suspended when the tab is hidden', async ({ page }) => {
    await page.locator(`button[aria-label="پخش ${RAIN}"]`).first().click();
    await page.waitForTimeout(1000);

    // Simulate the page going to the background.
    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        get: () => 'hidden',
      });
      Object.defineProperty(document, 'hidden', {
        configurable: true,
        get: () => true,
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.waitForTimeout(800);

    const states = await readContextStates(page);
    const probe = await readProbe(page);

    // Pure Web Audio with no keep-alive strategy: nothing keeps it running when hidden.
    // This documents the current behaviour and will flag a regression if a fix lands.
    test
      .info()
      .annotations.push({
        type: 'background-audio',
        description: `contextStates=${JSON.stringify(states)} suspends=${probe.suspends}`,
      });

    // Soft expectation: at least one context should remain running for background audio.
    expect(
      states.some((s) => s === 'running'),
      `No AudioContext is "running" while hidden (${JSON.stringify(states)}). ` +
        'Background audio will not work on Chrome Android.'
    ).toBeTruthy();
  });
});
