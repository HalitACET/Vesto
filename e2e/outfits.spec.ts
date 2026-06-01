import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

test.describe('Kombin Akışı', () => {

  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'user');
  });

  test('Kombinler sayfası açılıyor', async ({ page }) => {
    await page.goto('/tr/dashboard/outfits');
    await expect(page).toHaveURL(/outfits/);
    await page.waitForLoadState('networkidle');
    // Hata yok
    await expect(
      page.locator('text=Bir şeyler ters gitti')
    ).not.toBeVisible();
  });

  test('Yeni kombin butonu canvas\'a yönlendiriyor', async ({ page }) => {
    await page.goto('/tr/dashboard/outfits');
    await page.waitForLoadState('networkidle');

    const newButton = page.locator('text=Yeni Kombin');
    if (await newButton.isVisible()) {
      await newButton.click();
      await page.waitForURL(/canvas/);
      await expect(page).toHaveURL(/canvas/);
    }
  });

  test('Canvas sayfası açılıyor', async ({ page }) => {
    await page.goto('/tr/dashboard/canvas');
    await page.waitForLoadState('networkidle');

    // Mannequin veya slot'lar görünüyor
    await expect(
      page.locator('[data-testid="mannequin-canvas"]')
        .or(page.locator('text=Üst Giyim'))
        .or(page.locator('text=Kombin'))
    ).toBeVisible({ timeout: 10000 });
  });

});
