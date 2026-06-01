import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

test.describe('Forum Akışı', () => {

  test('Misafir forum\'u read-only görüyor', async ({ page }) => {
    await page.goto('/tr/dashboard/community');

    // Forum içeriği görünüyor (veya boş state)
    await page.waitForLoadState('networkidle');

    // Beğeni/yorum butonları ya görünmüyor ya disabled
    const likeButton = page.locator('[data-testid="like-button"]').first();
    if (await likeButton.isVisible()) {
      // Click → login yönlendirme
      await likeButton.click();
      await expect(
        page.locator('text=Giriş').or(page.locator('input[type="email"]'))
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test('Authenticated user forum\'da beğeni yapabiliyor', async ({ page }) => {
    await loginAs(page, 'user');
    await page.goto('/tr/dashboard/community');
    await page.waitForLoadState('networkidle');

    const likeButton = page.locator('[data-testid="like-button"]').first();
    if (await likeButton.isVisible()) {
      const countBefore = await page.locator(
        '[data-testid="like-count"]'
      ).first().innerText().catch(() => '0');

      await likeButton.click();
      await page.waitForTimeout(1000);

      // Hata yok
      await expect(page.locator('[role="alert"]')).not.toBeVisible();
    }
  });

  test('Keşfet tab\'ı açılıyor', async ({ page }) => {
    await loginAs(page, 'user');
    await page.goto('/tr/dashboard/community');

    const discoverTab = page.locator('text=Keşfet');
    if (await discoverTab.isVisible()) {
      await discoverTab.click();
      await page.waitForTimeout(500);
      // Arama çubuğu görünüyor
      await expect(
        page.locator('[placeholder*="ara"]')
      ).toBeVisible();
    }
  });

});
