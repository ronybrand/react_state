import type { Page } from '@playwright/test';

const TOKEN_KEY = 'estado_jwt';

// Seeds a fake-but-well-shaped JWT (future exp, no real signature) into
// localStorage before the page's own scripts run, so ProtectedRoute's
// isTokenValid() check passes without a real backend login. Safe for e2e:
// these specs mock every network call already (see fixtures/states.ts), and
// isTokenValid only decodes the exp claim client-side - it never verifies
// the signature (the backend, not this route, is what actually enforces
// auth on real requests).
export async function authenticated(page: Page): Promise<void> {
  const exp = Math.floor(Date.now() / 1000) + 3600;
  const payload = Buffer.from(JSON.stringify({ exp })).toString('base64url');
  const token = `header.${payload}.signature`;

  await page.addInitScript(
    ([key, value]) => {
      localStorage.setItem(key, value);
    },
    [TOKEN_KEY, token],
  );
}
