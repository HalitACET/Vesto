import { Page } from '@playwright/test';

export const TEST_USER = {
  email: process.env.E2E_TEST_EMAIL ?? 'test@vesto.app',
  password: process.env.E2E_TEST_PASSWORD ?? 'test123456',
};

export const TEST_ADMIN = {
  email: process.env.E2E_ADMIN_EMAIL ?? 'admin@vesto.app',
  password: process.env.E2E_ADMIN_PASSWORD ?? 'admin123456',
};

// Login helper
export async function loginAs(page: Page, role: 'user' | 'admin') {
  const credentials = role === 'admin' ? TEST_ADMIN : TEST_USER;

  await page.goto('/tr/login');
  await page.fill('[placeholder="E-posta"]', credentials.email);
  await page.fill('[placeholder="Şifre"]', credentials.password);
  await page.click('button:has-text("Giriş Yap")');

  // Dashboard'a yönlenmeyi bekle
  await page.waitForURL('**/dashboard**', { timeout: 10000 });
}

// Logout helper
export async function logout(page: Page) {
  await page.click('[data-testid="user-menu"]');
  await page.click('text=Çıkış Yap');
  await page.waitForURL('**/login**');
}

// Storage state helper (session'ı kaydet)
export async function saveAuthState(page: Page, path: string) {
  await page.context().storageState({ path });
}
