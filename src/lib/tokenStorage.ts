const TOKEN_KEY = 'estado_jwt';

// localStorage over an httpOnly cookie: accepted XSS exposure in exchange for
// a stateless SPA client and no CSRF surface, consistent with the short
// expiration and single-admin scope of the backend's ADR 0017 (see
// isTokenValid below).
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// Decodes the JWT's exp claim client-side, no round trip to the backend -
// the token is opaque beyond that (see the backend's ADR 0017: no refresh
// token, a short expiration plus re-login is acceptable for a single admin).
// This is a UI routing hint only (should the login screen show?), not an
// authorization check: the signature is never verified, so a tampered
// localStorage token with a forged future exp would pass. Every real
// request is still authorized by the backend. Do not reuse this decode to
// read claims (e.g. role) for access decisions - if that's ever needed,
// revisit ADR 0017 instead.
export function isTokenValid(): boolean {
  const token = getToken();
  if (!token) {
    return false;
  }

  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return typeof decoded.exp === 'number' && decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}
