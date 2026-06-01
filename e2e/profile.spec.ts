import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

test.describe('Profil Akışı', () => {

  test('Public profil misafir için açılıyor', async ({ page }) => {
    // Test user'ın ID'si
    const testUserId = process.env.E2E_TEST_USER_ID!;
    await page.goto(`/tr/u/${testUserId}`);
    await page.waitForLoadState('networkidle');

    // Profil içeriği görünüyor
    await expect(
      page.locator('[data-testid="public-profile-header"]')
        .or(page.locator('text=Gardırop'))
    ).toBeVisible({ timeout: 10000 });
  });

  test('Profil sayfası meta title doğru', async ({ page }) => {
    const testUserId = process.env.E2E_TEST_USER_ID!;
    await page.goto(`/tr/u/${testUserId}`);
    await expect(page).toHaveTitle(/Vesto/);
  });

  test('Kendi profil sayfası açılıyor', async ({ page }) => {
    await loginAs(page, 'user');
    await page.goto('/tr/dashboard/profile');
    await page.waitForLoadState('networkidle');

    // Profile screen görünüyor
    await expect(
      page.locator('[data-testid="profile-screen"]')
        .or(page.locator('text=Profili Düzenle'))
    ).toBeVisible();
  });

});
