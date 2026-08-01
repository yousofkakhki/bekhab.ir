import { test, expect } from '@playwright/test';
import {
  installAudioProbe,
  readProbe,
  readContextStates,
} from './helpers/audio-probe';

// Use sounds whose files DO exist so loading isn't the variable under test.
const RAIN = 'باران تهران';
const FIRE = 'آتش بخاری';

test.describe('Play / pause synchronisation', () => {
  test.beforeEach(async ({ page }) => {
    await installAudioProbe(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('each sound exposes one unambiguous play action', async ({ page }) => {
    await expect(page.locator(`button[aria-label="پخش ${RAIN}"]`)).toHaveCount(1);
  });

  test('activating ONE sound starts exactly ONE source in ONE context', async ({ page }) => {
    await page.locator(`button[aria-label="پخش ${RAIN}"]`).first().click();
    await page.waitForTimeout(1200);

    const probe = await readProbe(page);

    expect(
      probe.contexts,
      `Expected a single shared AudioContext, but the app created ${probe.contexts}. ` +
        `Each component calling useAudioMixer() makes its own context.`
    ).toBe(1);

    expect(
      probe.startedCount,
      `Expected 1 buffer source for one sound, got ${probe.startedCount} (doubled playback).`
    ).toBe(1);
  });

  test('global pause stops ALL audible output (no context left running)', async ({ page }) => {
    // Start two sounds
    await page.locator(`button[aria-label="پخش ${RAIN}"]`).first().click();
    await page.locator(`button[aria-label="پخش ${FIRE}"]`).first().click();
    await page.waitForTimeout(1200);

    // Global pause (the floating bar)
    await page.locator('button[aria-label="توقف همه"]').click();
    await page.waitForTimeout(600);

    const states = await readContextStates(page);
    const running = states.filter((s) => s === 'running');

    expect(
      running.length,
      `After pressing global pause, ${running.length} AudioContext(s) are still "running" ` +
        `(states: ${JSON.stringify(states)}). Pause did not stop all audio.`
    ).toBe(0);
  });

  test('UI state and engine state stay consistent across play→pause→play', async ({ page }) => {
    const playBtn = page.locator(`button[aria-label="پخش ${RAIN}"]`).first();
    await playBtn.click();
    await page.waitForTimeout(800);

    // Card should now show the "pause/stop" affordance (aria-label flips to توقف ...)
    await expect(page.locator(`button[aria-label="توقف ${RAIN}"]`).first()).toBeVisible();

    // Floating global bar appears and reports it is playing
    const globalBar = page.locator('text=در حال پخش');
    await expect(globalBar).toBeVisible();

    // Global pause → should report stopped
    await page.locator('button[aria-label="توقف همه"]').click();
    await page.waitForTimeout(400);
    await expect(page.getByText('متوقف', { exact: true })).toBeVisible();

    // Resume
    await page.locator('button[aria-label="پخش همه"]').click();
    await page.waitForTimeout(400);
    await expect(page.locator('text=در حال پخش')).toBeVisible();
  });

  test('toggling a sound off stops its source', async ({ page }) => {
    await page.locator(`button[aria-label="پخش ${RAIN}"]`).first().click();
    await page.waitForTimeout(1000);
    let probe = await readProbe(page);
    const startedAfterPlay = probe.startedCount;
    expect(startedAfterPlay).toBeGreaterThan(0);

    // Toggle the same sound off
    await page.locator(`button[aria-label="توقف ${RAIN}"]`).first().click();
    await page.waitForTimeout(500);
    probe = await readProbe(page);

    expect(
      probe.stoppedCount,
      'Turning a sound off should stop at least one source node.'
    ).toBeGreaterThan(0);
  });

  test('stop-all clears active sounds and hides the global bar', async ({ page }) => {
    await page.locator(`button[aria-label="پخش ${RAIN}"]`).first().click();
    await page.locator(`button[aria-label="پخش ${FIRE}"]`).first().click();
    await page.waitForTimeout(800);

    await expect(page.locator('button[aria-label="توقف همه صداها"]')).toBeVisible();
    await page.locator('button[aria-label="توقف همه صداها"]').click();
    await page.waitForTimeout(500);

    // Global bar disappears when no active sounds remain
    await expect(page.locator('button[aria-label="توقف همه صداها"]')).toHaveCount(0);
  });

  test('a saved mix can be restored', async ({ page }) => {
    await page.locator(`button[aria-label="پخش ${RAIN}"]`).first().click();
    await page.locator(`button[aria-label="پخش ${FIRE}"]`).first().click();
    await page.getByRole('button', { name: '💾 ذخیره ترکیب فعلی' }).click();
    await page.locator('button[aria-label="توقف همه صداها"]').click();

    await page.getByRole('button', { name: 'بازیابی ترکیب ذخیره‌شده' }).click();

    await expect(page.locator(`button[aria-label="توقف ${RAIN}"]`).first()).toBeVisible();
    await expect(page.locator(`button[aria-label="توقف ${FIRE}"]`).first()).toBeVisible();
  });
});
