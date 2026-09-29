import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  reporter: process.env['CI'] ? [['github'], ['html', { open: 'never' }]] : 'html',
  // Default is 5s. Client-side navigations (router.push()/replace() after a
  // mutation or auth redirect) occasionally take a bit longer than that
  // under this suite's parallel workers without being wrong - just slow.
  // Bumped once globally instead of patching every `toHaveURL` assertion.
  expect: { timeout: 8_000 },
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
    // `next start` against an already-built app, not `next dev`:
    // Turbopack's dev server compiles each route on-demand on its first
    // request, which can take several seconds under parallel browser
    // workers - enough to make e2e assertions with a 5s timeout (e.g. the
    // auth-redirect specs hitting a cold dynamic route) flake or fail
    // outright. Locally, `npm run e2e` still needs a build to exist first
    // (`npm run build`, once) - CI's e2e job runs that as its own prior
    // step, not chained into this command: building and starting in the
    // same webServer invocation was unreliable in that job's container
    // specifically (script chunk requests 404'd against the built HTML's
    // references, something about the container's overlay filesystem
    // racing the build's own output with `next start` picking it up).
    command: 'npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env['CI'],
    timeout: 120_000,
  },
});
