import { test, expect } from '@playwright/test';

test.describe('SEO', () => {

  test('Landing page title doğru', async ({ page }) => {
    await page.goto('/tr');
    await expect(page).toHaveTitle(/Vesto/);
  });

  test('Landing page meta description var', async ({ page }) => {
    await page.goto('/tr');
    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute('content', /.+/);
  });

  test('OG image tag var', async ({ page }) => {
    await page.goto('/tr');
    const ogImage = page.locator('meta[property="og:image"]');
    await expect(ogImage).toHaveAttribute('content', /.+/);
  });

  test('robots.txt erişilebilir', async ({ page }) => {
    const response = await page.goto('/robots.txt');
    expect(response?.status()).toBe(200);

    const content = await page.content();
    expect(content).toContain('Disallow');
  });

  test('sitemap.xml erişilebilir', async ({ page }) => {
    const response = await page.goto('/sitemap.xml');
    expect(response?.status()).toBe(200);
  });

});
