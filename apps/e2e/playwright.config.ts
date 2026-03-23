import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'frontend-chromium',
      testMatch: /.*frontend\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.FRONTEND_URL ?? 'http://localhost:4200',
      },
    },
    {
      name: 'backend-api',
      testMatch: /.*backend\.spec\.ts/,
      use: {
        baseURL: process.env.BACKEND_URL ?? 'http://localhost:3000',
      },
    },
  ],
});
