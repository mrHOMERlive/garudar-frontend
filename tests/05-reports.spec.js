import { test, expect } from '@playwright/test';

test.describe('Transaction Report', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/stafftransactionreport');
  });

  test('transaction report page loads', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Transaction Data Report' })).toBeVisible();
  });

  test('table displays transaction columns', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: 'Transaction ID' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Currency' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Amount' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Sender Name' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Recipient Name' })).toBeVisible();
  });

  test('search box exists', async ({ page }) => {
    await expect(page.getByRole('textbox', { name: /search/i })).toBeVisible();
  });

  test('filter dropdowns exist', async ({ page }) => {
    await expect(page.getByText('All Types')).toBeVisible();
    await expect(page.getByText('All Currencies')).toBeVisible();
    await expect(page.getByText('All Risk')).toBeVisible();
  });

  test('Download Excel button is visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Download Excel' })).toBeVisible();
  });

  test('Add Record button is visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Add Record' })).toBeVisible();
  });

  test('Clear filter button exists', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Clear' })).toBeVisible();
  });

  test('pagination info is displayed', async ({ page }) => {
    await expect(page.getByText(/Page \d+ of \d+/)).toBeVisible();
  });

  test('Dashboard link navigates back', async ({ page }) => {
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await page.waitForURL('**/staffdashboard');
  });
});

test.describe('Customer Report', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/staffcustomerreport');
  });

  test('customer report page loads', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Customer Data Report' })).toBeVisible();
  });
});
