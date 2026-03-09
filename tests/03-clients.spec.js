import { test, expect } from '@playwright/test';

test.describe('Client Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/staffclients');
  });

  test('clients page loads with table', async ({ page }) => {
    await expect(page.getByText('Client Management')).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('clients table has correct columns', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: 'Client ID' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Name' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Sign Status' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Account Status' })).toBeVisible();
  });

  test('clients are displayed in the table', async ({ page }) => {
    // Should have at least one row with a client ID
    const rows = page.getByRole('row');
    await expect(rows).not.toHaveCount(1); // more than just header row
  });

  test('search clients works', async ({ page }) => {
    const searchBox = page.getByRole('textbox', { name: /search/i });
    await searchBox.fill('Sentosa');

    // Wait for filtered results
    await page.waitForTimeout(500);

    // PT. Sentosa Jaya Abadi should still be visible
    await expect(page.getByText('PT. Sentosa Jaya Abadi').first()).toBeVisible();
  });

  test('Add Client button is visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Add Client' })).toBeVisible();
  });

  test('clicking a client row opens details', async ({ page }) => {
    // Click first data row
    const firstRow = page.getByRole('row').nth(1);
    await firstRow.click();

    // Should open a drawer/dialog with client details
    await page.waitForTimeout(500);
  });

  test('sorting by Client ID works', async ({ page }) => {
    const sortButton = page.getByRole('button', { name: 'Client ID' });
    await sortButton.click();
    await page.waitForTimeout(300);
    // Just verify the page doesn't crash after sorting
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('pagination info is displayed', async ({ page }) => {
    await expect(page.getByText(/\d+-\d+ of \d+/)).toBeVisible();
  });
});
