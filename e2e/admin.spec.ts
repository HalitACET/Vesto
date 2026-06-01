import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

test.describe('Admin Panel', () => {

  test('Admin kullanıcı yönetimine erişebiliyor', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/tr/admin/users');
    await page.waitForLoadState('networkidle');

    await expect(
      page.locator('text=Kullanıcı Yönetimi')
    ).toBeVisible({ timeout: 10000 });
  });

  test('Admin AI monitöre erişebiliyor', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/tr/admin/ai-monitor');
    await page.waitForLoadState('networkidle');

    await expect(
      page.locator('text=AI Analiz Monitörü')
    ).toBeVisible({ timeout: 10000 });
  });

  test('Admin moderasyon paneline erişebiliyor', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/tr/admin/moderation');
    await page.waitForLoadState('networkidle');

    await expect(
      page.locator('text=Forum Moderasyonu')
    ).toBeVisible({ timeout: 10000 });
  });

  test('Admin istatistiklere erişebiliyor', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/tr/admin/analytics');
    await page.waitForLoadState('networkidle');

    await expect(
      page.locator('text=Platform İstatistikleri')
    ).toBeVisible({ timeout: 10000 });
  });

  test('Normal user admin\'e erişemiyor', async ({ page }) => {
    await loginAs(page, 'user');
    await page.goto('/tr/admin');

    // Ya redirect ya da hata
    await page.waitForTimeout(2000);
    await expect(page).not.toHaveURL(/\/admin$/);
  });

});
