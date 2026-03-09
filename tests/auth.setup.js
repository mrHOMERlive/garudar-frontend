import { test as setup, expect } from '@playwright/test';

const AUTH_FILE = './tests/.auth/admin.json';

/**
 * Global setup: login once, save storageState (cookies + localStorage).
 * All other tests reuse the session — no repeated /auth/login calls.
 */
setup('authenticate as admin', async ({ page }) => {
  await page.goto('/gtranslogin');
  await page.getByRole('textbox', { name: 'username' }).fill('admin');
  await page.getByRole('textbox', { name: '••••••••' }).fill('msskyF2zpagnhjDMVz2pe2US2vs7V2mW');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.waitForURL('**/staffdashboard');
  await expect(page.getByRole('heading', { name: 'Administration' })).toBeVisible();

  await page.context().storageState({ path: AUTH_FILE });
});

/**
 * Shared login helper — kept for tests that explicitly need a fresh login
 * (e.g., testing the login flow itself).
 */
export async function login(page, username = 'admin', password = 'msskyF2zpagnhjDMVz2pe2US2vs7V2mW') {
  await page.goto('/gtranslogin');
  await page.getByRole('textbox', { name: 'username' }).fill(username);
  await page.getByRole('textbox', { name: '••••••••' }).fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL('**/staffdashboard');
}
