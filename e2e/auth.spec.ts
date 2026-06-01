import { test, expect } from '@playwright/test';

test.describe('Auth Akışı', () => {

  test('Landing page misafir için açılıyor', async ({ page }) => {
    await page.goto('/tr');
    await expect(page).toHaveTitle(/Vesto/);
    // Login/Register CTA görünüyor
    await expect(page.locator('text=Giriş Yap')).toBeVisible();
  });

  test('Login sayfası açılıyor', async ({ page }) => {
    await page.goto('/tr/login');
    await expect(page.locator('text=Tekrar hoş geldiniz')).toBeVisible();
    await expect(page.locator('[placeholder="E-posta"]')).toBeVisible();
    await expect(page.locator('[placeholder="Şifre"]')).toBeVisible();
  });

  test('Yanlış şifre ile login hata veriyor', async ({ page }) => {
    await page.goto('/tr/login');
    await page.fill('[placeholder="E-posta"]', 'yanlis@email.com');
    await page.fill('[placeholder="Şifre"]', 'yanlissifre');
    await page.click('button:has-text("Giriş Yap")');

    // Hata mesajı görünüyor
    await expect(page.locator('[role="alert"]')).toBeVisible({
      timeout: 5000,
    });
  });

  test('Başarılı login dashboard\'a yönlendiriyor', async ({ page }) => {
    await page.goto('/tr/login');
    await page.fill(
      '[placeholder="E-posta"]',
      process.env.E2E_TEST_EMAIL!
    );
    await page.fill(
      '[placeholder="Şifre"]',
      process.env.E2E_TEST_PASSWORD!
    );
    await page.click('button:has-text("Giriş Yap")');

    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    await expect(page).toHaveURL(/dashboard/);
  });

  test('Dashboard korumalı — misafir yönlendiriliyor', async ({ page }) => {
    await page.goto('/tr/dashboard');
    await page.waitForURL('**/login**', { timeout: 5000 });
    await expect(page).toHaveURL(/login/);
  });

  test('Admin paneli korumalı — normal user giremez', async ({ page }) => {
    // Normal user ile login
    await page.goto('/tr/login');
    await page.fill('[placeholder="E-posta"]', process.env.E2E_TEST_EMAIL!);
    await page.fill('[placeholder="Şifre"]', process.env.E2E_TEST_PASSWORD!);
    await page.click('button:has-text("Giriş Yap")');
    await page.waitForURL('**/dashboard**');

    // Admin'e gitmeye çalış
    await page.goto('/tr/admin');
    // Ya login'e yönleniyor ya da 403/404
    await expect(page).not.toHaveURL(/admin\/dashboard/);
  });

});
