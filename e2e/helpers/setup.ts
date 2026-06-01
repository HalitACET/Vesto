import { chromium, FullConfig } from '@playwright/test';
import { loginAs, saveAuthState } from './auth';

// Global setup — test'lerden önce bir kez çalışır
async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Normal user session'ını kaydet
  await loginAs(page, 'user');
  await saveAuthState(page, 'e2e/.auth/user.json');

  // Admin session'ını kaydet
  await loginAs(page, 'admin');
  await saveAuthState(page, 'e2e/.auth/admin.json');

  await browser.close();
}

export default globalSetup;
