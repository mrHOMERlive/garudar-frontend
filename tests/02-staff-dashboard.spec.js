import { test, expect } from '@playwright/test';

test.describe('Staff Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/staffdashboard');
  });

  test('dashboard displays all navigation sections', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Administration' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Orders' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'KYC' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Reports' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Requests' })).toBeVisible();
  });

  test('navigate to Clients page', async ({ page }) => {
    await page.getByRole('link', { name: /Clients.*Manage client accounts/ }).click();
    await page.waitForURL('**/staffclients');
    await expect(page.getByText('Client Management')).toBeVisible();
  });

  test('navigate to Active Orders page', async ({ page }) => {
    await page.getByRole('link', { name: /Active Orders.*View and process/ }).click();
    await page.waitForURL('**/staffactiveorders');
    await expect(page.getByText('Active Orders').first()).toBeVisible();
  });

  test('navigate to Executed Orders page', async ({ page }) => {
    await page.getByRole('link', { name: /Executed Orders.*View completed/ }).click();
    await page.waitForURL('**/staffexecutedorders');
  });

  test('navigate to KYC Database page', async ({ page }) => {
    await page.getByRole('link', { name: /KYC Database/ }).click();
    await page.waitForURL('**/staffkyc');
  });

  test('navigate to Transaction Data page', async ({ page }) => {
    await page.getByRole('link', { name: /Transaction Data/ }).click();
    await page.waitForURL('**/stafftransactionreport');
    await expect(page.getByRole('heading', { name: 'Transaction Data Report' })).toBeVisible();
  });

  test('navigate to Customer Data page', async ({ page }) => {
    await page.getByRole('link', { name: /Customer Data/ }).click();
    await page.waitForURL('**/staffcustomerreport');
  });

  test('navigate to KYC Onboarding Queue', async ({ page }) => {
    await page.getByRole('link', { name: /KYC Onboarding Queue/ }).click();
    await page.waitForURL('**/staffkycqueue');
  });

  test('navigate to Service Agreement', async ({ page }) => {
    await page.getByRole('link', { name: /Service Agreement.*Manage master/ }).click();
    await page.waitForURL('**/staffserviceagreement');
  });

  test('navigate to Payeer Accounts', async ({ page }) => {
    await page.getByRole('link', { name: /Payeer Accounts/ }).click();
    await page.waitForURL('**/staffpayeeraccounts');
  });

  test('Public Site link is visible', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Public Site' })).toBeVisible();
  });

  test('user info shows admin username', async ({ page }) => {
    await expect(page.getByText('admin').first()).toBeVisible();
  });
});
