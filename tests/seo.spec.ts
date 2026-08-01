import { test, expect } from '@playwright/test';

test.describe('Crawl and social metadata', () => {
  test('publishes robots and sitemap endpoints', async ({ request }) => {
    const robots = await request.get('/robots.txt');
    expect(robots.status()).toBe(200);
    expect(await robots.text()).toContain('Sitemap: https://bekhab.ir/sitemap.xml');

    const sitemap = await request.get('/sitemap.xml');
    expect(sitemap.status()).toBe(200);
    const body = await sitemap.text();
    expect(body).toContain('<loc>https://bekhab.ir</loc>');
    expect(body).toContain('<loc>https://bekhab.ir/blog</loc>');
    expect(body).not.toContain('<lastmod>');
  });

  test('uses the application dark theme in the web manifest', async ({ request }) => {
    const response = await request.get('/manifest.json');
    expect(response.status()).toBe(200);
    const manifest = await response.json();
    expect(manifest.background_color).toBe('#020617');
    expect(manifest.theme_color).toBe('#020617');
    expect(manifest.orientation).toBeUndefined();
  });

  test('composes the resources page title once', async ({ page }) => {
    await page.goto('/blog');
    await expect(page).toHaveTitle('منابع معتبر خواب | بخواب');
  });

  test('only publishes structured data that matches visible product content', async ({ page }) => {
    await page.goto('/');
    const schemas = await page.locator('script[type="application/ld+json"]').allTextContents();
    const parsed = schemas.map((schema) => JSON.parse(schema));

    expect(parsed.some((schema) => schema['@type'] === 'FAQPage')).toBe(false);
    expect(parsed.some((schema) => 'softwareVersion' in schema)).toBe(false);
  });

  test('serves a real 1200×630 social preview image', async ({ page, request }) => {
    await page.goto('/');
    const imageUrl = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(new URL(imageUrl!).pathname).toBe('/og-image.png');

    const image = await request.get('/og-image.png');
    expect(image.status()).toBe(200);
    expect(image.headers()['content-type']).toBe('image/png');
    expect(Number(image.headers()['content-length'])).toBeGreaterThan(10_000);

    const dimensions = await page.evaluate(async () => {
      const loaded = new Image();
      loaded.src = '/og-image.png';
      await loaded.decode();
      return { width: loaded.naturalWidth, height: loaded.naturalHeight };
    });
    expect(dimensions).toEqual({ width: 1200, height: 630 });
  });
});
