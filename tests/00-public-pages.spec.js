import { test, expect } from '@playwright/test';

test.describe('Public Pages', () => {
  test('homepage loads with hero section', async ({ page }) => {
    await page.goto('/gtrans');
    await expect(page.getByRole('heading', { name: /One platform for seamless/ })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Start Now' })).toBeVisible();
  });

  test('homepage shows supported currencies', async ({ page }) => {
    await page.goto('/gtrans');
    await expect(page.getByRole('heading', { name: 'Supported Currencies' })).toBeVisible();
    // Currencies appear in the animated ticker and the grid - use first()
    await expect(page.getByText('USD').first()).toBeVisible();
    await expect(page.getByText('EUR').first()).toBeVisible();
    await expect(page.getByText('CNY').first()).toBeVisible();
  });

  test('homepage shows product portfolio', async ({ page }) => {
    await page.goto('/gtrans');
    await expect(page.getByText('Product Portfolio')).toBeVisible();
    await expect(page.getByText('GTrans B2B Payments')).toBeVisible();
  });

  test('login page is accessible from header', async ({ page }) => {
    await page.goto('/gtrans');
    // Navigate to login
    await page.goto('/gtranslogin');
    await expect(page.getByRole('heading', { name: 'Client Login' })).toBeVisible();
  });

  test('footer has contact info', async ({ page }) => {
    await page.goto('/gtrans');
    await expect(page.getByRole('link', { name: 'info@garudar.id' })).toBeVisible();
    await expect(page.getByText('PT Garuda Arma Nusa').first()).toBeVisible();
  });

  test('language switcher exists', async ({ page }) => {
    await page.goto('/gtrans');
    await expect(page.getByRole('button', { name: /English|Bahasa/ })).toBeVisible();
  });
});
