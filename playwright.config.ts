import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  reporter: process.env['CI'] ? [['github'], ['html', { open: 'never' }]] : 'html',
  use: {
    // Next's dev/start server default (Vite's was 5173).
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
  webServer: {
    // A production build, not `next dev`: Turbopack's dev server compiles
    // each route on-demand on its first request, which can take several
    // seconds under the CPU contention of two browser projects' workers
    // running in parallel - enough to make e2e assertions with a 5s
    // timeout (e.g. the auth-redirect specs hitting a cold dynamic route)
    // flake or fail outright. A prebuilt app serves every route instantly.
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env['CI'],
    timeout: 120_000,
  },
});
