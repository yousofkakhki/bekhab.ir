import { test, expect } from '@playwright/test';

test.describe('Sleep tracker', () => {
  test('exposes controls that let the user start a tracking session', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('button', { name: 'شروع ثبت حرکت شبانه' })).toBeVisible();
    await expect(page.getByText('شاخص آرامش حرکتی', { exact: true })).toBeVisible();
    await expect(page.getByText(/جایگزین ابزار پزشکی یا سنجش مراحل خواب نیست/)).toBeVisible();
  });

  test('releases the wake lock when motion tracking is unavailable', async ({ page }) => {
    await page.addInitScript(() => {
      delete (window as unknown as { DeviceMotionEvent?: unknown }).DeviceMotionEvent;
      const state = { requested: 0, released: 0 };
      Object.defineProperty(window, '__wakeLockProbe', { value: state });
      Object.defineProperty(navigator, 'wakeLock', {
        configurable: true,
        value: {
          request: async () => {
            state.requested += 1;
            return {
              release: async () => {
                state.released += 1;
              },
            };
          },
        },
      });
    });
    await page.goto('/');

    await page.getByRole('button', { name: 'شروع ثبت حرکت شبانه' }).click();

    await expect(
      page.getByText('سنسور حرکت در این دستگاه پشتیبانی نمی‌شود', { exact: true })
    ).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(() =>
          (window as unknown as { __wakeLockProbe: { released: number } }).__wakeLockProbe.released
        )
      )
      .toBe(1);
  });

  test('releases the wake lock when the tracker UI unmounts', async ({ page }) => {
    await page.addInitScript(() => {
      const state = { requested: 0, released: 0 };
      Object.defineProperty(window, '__wakeLockProbe', { value: state });
      Object.defineProperty(navigator, 'wakeLock', {
        configurable: true,
        value: {
          request: async () => {
            state.requested += 1;
            return {
              release: async () => {
                state.released += 1;
              },
            };
          },
        },
      });
    });
    await page.goto('/');
    await page.getByRole('button', { name: 'شروع ثبت حرکت شبانه' }).click();
    await expect
      .poll(() =>
        page.evaluate(() =>
          (window as unknown as { __wakeLockProbe: { requested: number } }).__wakeLockProbe.requested
        )
      )
      .toBe(1);

    await page.getByRole('link', { name: 'منابع خواب' }).click();

    await expect
      .poll(() =>
        page.evaluate(() =>
          (window as unknown as { __wakeLockProbe: { released: number } }).__wakeLockProbe.released
        )
      )
      .toBe(1);
  });
});
