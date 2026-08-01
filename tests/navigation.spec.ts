import { test, expect } from '@playwright/test';

test.describe('Navigation integrity', () => {
  test('does not expose placeholder destinations as working links', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('a[href="#"]')).toHaveCount(0);
    await expect(page.locator('a[href="#shop"]')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: '🛒 فروشگاه خواب' })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'نظرات کاربران' })).toHaveCount(0);
  });

  test('the resources page only presents articles with real destinations', async ({ page }) => {
    await page.goto('/blog');

    const resources = page.locator('article a[href^="https://"]');
    await expect(resources).toHaveCount(3);
    await expect(page.locator('article:not(:has(a[href^="https://"]))')).toHaveCount(0);
  });

  test('uses descriptive feature language instead of unsupported outcome claims', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('محاسبه تقریبی زمان خواب', { exact: true })).toBeVisible();
    await expect(page.getByText('شاخص آرامش حرکتی', { exact: true })).toBeVisible();
    await expect(page.getByText('تسکین وزوز گوش', { exact: true })).toHaveCount(0);
    await expect(page.getByText('انقلابی در کیفیت خواب', { exact: true })).toHaveCount(0);
  });

  test('keeps the core tools directly available during overnight hours', async ({ page }) => {
    await page.clock.install({ time: new Date('2026-08-02T01:30:00') });
    await page.goto('/');

    await expect(page.getByRole('heading', { name: /آرام بگیرید/ })).toBeVisible();
    await expect(page.getByRole('link', { name: 'شروع کنید' })).toBeVisible();
    await expect(page.getByText('وقت خوابه 🌙', { exact: true })).toHaveCount(0);
  });
});
