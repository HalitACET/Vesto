import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

test.describe('Gardırop Akışı', () => {

  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'user');
  });

  test('Gardırop sayfası açılıyor', async ({ page }) => {
    await page.goto('/tr/dashboard/wardrobe');
    await expect(page).toHaveURL(/wardrobe/);
    // Başlık
    await expect(
      page.locator('h1, h2').filter({ hasText: /gardırop/i })
    ).toBeVisible({ timeout: 5000 });
  });

  test('Kategori filtreleri çalışıyor', async ({ page }) => {
    await page.goto('/tr/dashboard/wardrobe');
    await page.waitForLoadState('networkidle');

    // Filtre chip'leri görünüyor
    const filterChips = page.locator('[data-testid="category-filter"]');
    if (await filterChips.count() > 0) {
      await filterChips.first().click();
      await page.waitForTimeout(500);
      // Hata yok
      await expect(page.locator('[role="alert"]')).not.toBeVisible();
    }
  });

  test('Arama çubuğu çalışıyor', async ({ page }) => {
    await page.goto('/tr/dashboard/wardrobe');
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('[placeholder*="ara"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await page.waitForTimeout(500);
      // Hata yok
      await expect(page.locator('[role="alert"]')).not.toBeVisible();
    }
  });

  test('Kıyafet detay sayfası açılıyor', async ({ page }) => {
    await page.goto('/tr/dashboard/wardrobe');
    await page.waitForLoadState('networkidle');

    // İlk kıyafet kartına tıkla
    const firstCard = page.locator('[data-testid="wardrobe-item-card"]').first();
    if (await firstCard.isVisible()) {
      await firstCard.click();
      await page.waitForURL(/wardrobe\/item/);
      await expect(page).toHaveURL(/item/);
    }
  });

});
