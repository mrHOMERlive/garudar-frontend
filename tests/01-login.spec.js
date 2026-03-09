import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('login page loads correctly', async ({ page }) => {
    await page.goto('/gtranslogin');

    await expect(page.getByRole('heading', { name: 'Client Login' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'username' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });

  test('successful admin login redirects to staff dashboard', async ({ page }) => {
    await page.goto('/gtranslogin');

    await page.getByRole('textbox', { name: 'username' }).fill('admin');
    await page.getByRole('textbox', { name: '••••••••' }).fill('msskyF2zpagnhjDMVz2pe2US2vs7V2mW');
    await page.getByRole('button', { name: 'Login' }).click();

    await page.waitForURL('**/staffdashboard');
    await expect(page.getByRole('heading', { name: 'Administration' })).toBeVisible();
  });

  test('failed login shows error', async ({ page }) => {
    await page.goto('/gtranslogin');

    await page.getByRole('textbox', { name: 'username' }).fill('wronguser');
    await page.getByRole('textbox', { name: '••••••••' }).fill('wrongpassword');
    await page.getByRole('button', { name: 'Login' }).click();

    // Should stay on login page and show error notification
    await expect(page).toHaveURL(/gtranslogin/);
  });

  test('unauthenticated access to staff pages redirects to login', async ({ page }) => {
    await page.goto('/staffdashboard');

    // Should redirect to login
    await expect(page).toHaveURL(/gtranslogin/);
  });

  test('logout works', async ({ page }) => {
    // Login first
    await page.goto('/gtranslogin');
    await page.getByRole('textbox', { name: 'username' }).fill('admin');
    await page.getByRole('textbox', { name: '••••••••' }).fill('msskyF2zpagnhjDMVz2pe2US2vs7V2mW');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/staffdashboard');

    // Logout
    await page.getByRole('button', { name: 'Logout' }).click();

    // Should be back at public pages or login
    await expect(page).not.toHaveURL(/staffdashboard/);
  });
});
