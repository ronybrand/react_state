import type { Page } from '@playwright/test';

// Footer renders only once both version.json (static file) and
// /api/actuator/info resolve - mocked together so a11y specs exercise the
// footer's actual markup instead of silently skipping it (it returns null
// while either request is unmocked/pending).
export async function mockInfo(page: Page): Promise<void> {
  await Promise.all([
    page.route('**/version.json', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ commit: 'abc1234', buildDate: '2026-01-01T00:00:00Z' }),
      }),
    ),
    page.route('**/api/actuator/info', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ build: { commit: 'def5678', time: '2026-01-01T00:00:00Z' } }),
      }),
    ),
  ]);
}
