import 'dotenv/config';
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  retries: 1,
  timeout: 30_000,
  workers: '50%',

  globalSetup: require.resolve('./global-setup'),

  reporter: [
    ['html'],
    ['list'],
    ['junit', { outputFile: 'reports/junit.xml' }],
    ['json',  { outputFile: 'reports/results.json' }],
  ],

  use: {
    baseURL: process.env.API_BASE || 'https://dummyjson.com',
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
      'Accept':       'application/json',
      // token is now handled per-request inside ApiClient
    },
  },
});
