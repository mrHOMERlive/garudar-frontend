import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: {
    timeout: 10000,
  },
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    // 1. Public pages — no auth needed
    {
      name: 'public',
      testMatch: /00-public-pages\.spec\.js/,
    },
    // 2. Login tests — no stored auth (tests login flow itself)
    {
      name: 'login',
      testMatch: /01-login\.spec\.js/,
    },
    // 3. Setup — login once, save cookies for authenticated tests
    {
      name: 'setup',
      testMatch: /auth\.setup\.js/,
      dependencies: ['login'],
    },
    // 4. Authenticated tests — reuse stored session
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        storageState: './tests/.auth/admin.json',
      },
      dependencies: ['setup'],
      testIgnore: [/auth\.setup\.js/, /00-public-pages\.spec\.js/, /01-login\.spec\.js/],
    },
  ],
});
