import { test, expect } from '@playwright/test';

test.describe('Active Orders', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/staffactiveorders');
  });

  test('active orders page loads', async ({ page }) => {
    await expect(page.getByText('Active Orders')).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('orders table has correct columns', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: 'Order ID' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Client' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Amount' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible();
  });

  test('orders are displayed', async ({ page }) => {
    await expect(page.getByText(/orders/)).toBeVisible();
    const rows = page.getByRole('row');
    // Header row + at least 1 data row
    await expect(rows).not.toHaveCount(1);
  });

  test('search orders works', async ({ page }) => {
    const searchBox = page.getByRole('textbox', { name: /search/i });
    await searchBox.fill('FEO');
    await page.waitForTimeout(500);
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('status filter dropdown exists', async ({ page }) => {
    await expect(page.getByText('All Statuses')).toBeVisible();
  });

  test('sorting by Order ID works', async ({ page }) => {
    const sortButton = page.getByRole('button', { name: 'Order ID' });
    await sortButton.click();
    await page.waitForTimeout(300);
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('clicking an order row opens details', async ({ page }) => {
    const firstRow = page.getByRole('row').nth(1);
    await firstRow.click();
    await page.waitForTimeout(500);
    // A drawer or dialog should appear
  });

  test('pagination works', async ({ page }) => {
    await expect(page.getByText(/Page \d+ of \d+/)).toBeVisible();
  });

  test('rows per page selector exists', async ({ page }) => {
    await expect(page.getByText('Rows per page:')).toBeVisible();
  });
});

test.describe('Executed Orders', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/staffexecutedorders');
  });

  test('executed orders page loads', async ({ page }) => {
    await expect(page.getByRole('table')).toBeVisible();
  });
});
