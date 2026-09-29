import type { Locator, Page } from '@playwright/test';

// The App Router renders its own `role="alert"` route announcer
// (#__next-route-announcer__) for a11y on every page, which also matches
// getByRole('alert') and turns it into a Playwright strict-mode violation
// once the app's own error banner (ErrorMessage.tsx) is showing too. This
// scopes to that banner specifically.
export function errorAlert(page: Page): Locator {
  return page.locator('[role="alert"]:not(#__next-route-announcer__)');
}
