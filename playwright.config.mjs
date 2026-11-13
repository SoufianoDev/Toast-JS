// @ts-check
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  testMatch: '**/*.spec.mjs',
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
