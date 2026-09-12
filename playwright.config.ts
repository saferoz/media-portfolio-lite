import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './qa',
  testMatch: '*.spec.ts',
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  expect: { timeout: 8_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: process.env.TEST_URL || 'http://127.0.0.1:3000', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: process.env.TEST_URL ? undefined : { command: 'npm run start', url: 'http://127.0.0.1:3000', reuseExistingServer: !process.env.CI },
});
