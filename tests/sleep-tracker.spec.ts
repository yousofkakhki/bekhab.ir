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

  test('does not create a movement score when the sensor emits no data', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'DeviceMotionEvent', {
        configurable: true,
        value: class DeviceMotionEvent extends Event {},
      });
    });
    await page.goto('/');

    await page.getByRole('button', { name: 'شروع ثبت حرکت شبانه' }).click();
    await page.getByRole('button', { name: 'پایان و ذخیره حرکت‌ها' }).click();

    await expect(page.getByText('هیچ داده‌ای از سنسور حرکت دریافت نشد', { exact: true })).toBeVisible();
    await expect(page.getByText('شاخص این جلسه', { exact: true })).toHaveCount(0);
  });

  test('does not score a session that is too short to be meaningful', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'DeviceMotionEvent', {
        configurable: true,
        value: class DeviceMotionEvent extends Event {},
      });
    });
    await page.goto('/');

    await page.getByRole('button', { name: 'شروع ثبت حرکت شبانه' }).click();
    await page.waitForFunction(() => '__bekhabMotionHandler' in window);
    await page.evaluate(() => {
      const event = new Event('devicemotion');
      Object.defineProperty(event, 'accelerationIncludingGravity', {
        value: { x: 0, y: 0, z: 9.81 },
      });
      window.dispatchEvent(event);
    });
    await page.getByRole('button', { name: 'پایان و ذخیره حرکت‌ها' }).click();

    await expect(page.getByText('برای محاسبه شاخص، دست‌کم یک دقیقه داده لازم است', { exact: true })).toBeVisible();
    await expect(page.getByText('شاخص این جلسه', { exact: true })).toHaveCount(0);
  });

  test('does not score a long session with inadequate sensor coverage', async ({ page }) => {
    await page.addInitScript(() => {
      let now = 1_000_000;
      Date.now = () => now;
      Object.assign(window, {
        __advanceTrackerTime: (milliseconds: number) => {
          now += milliseconds;
        },
      });
      Object.defineProperty(window, 'DeviceMotionEvent', {
        configurable: true,
        value: class DeviceMotionEvent extends Event {},
      });
    });
    await page.goto('/');

    await page.getByRole('button', { name: 'شروع ثبت حرکت شبانه' }).click();
    await page.waitForFunction(() => '__bekhabMotionHandler' in window);
    await page.evaluate(() => {
      const event = new Event('devicemotion');
      Object.defineProperty(event, 'accelerationIncludingGravity', {
        value: { x: 0, y: 0, z: 9.81 },
      });
      window.dispatchEvent(event);
      (window as unknown as { __advanceTrackerTime: (milliseconds: number) => void })
        .__advanceTrackerTime(60_001);
    });
    await page.getByRole('button', { name: 'پایان و ذخیره حرکت‌ها' }).click();

    await expect(page.getByText('داده سنسور برای محاسبه شاخص کافی نبود', { exact: true })).toBeVisible();
    await expect(page.getByText('شاخص این جلسه', { exact: true })).toHaveCount(0);
  });

  test('renders one movement bucket for a session contained within one hour', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(async () => {
      const startTime = new Date(2026, 0, 1, 1, 10).getTime();
      const request = indexedDB.open('bekhab-sleep', 1);
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        request.onupgradeneeded = () => {
          if (!request.result.objectStoreNames.contains('sessions')) {
            request.result.createObjectStore('sessions', { keyPath: 'id' });
          }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      const transaction = db.transaction('sessions', 'readwrite');
      transaction.objectStore('sessions').put({
        id: 'same-hour-session',
        startTime,
        endTime: startTime + 10 * 60_000,
        spikes: [],
        efficiency: 100,
      });
      await new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
      db.close();
    });

    await page.reload();

    await expect(page.getByText('شاخص این جلسه', { exact: true })).toBeVisible();
    await expect(page.locator('.sleep-bar')).toHaveCount(1);
  });
});
