const TOKEN_KEY = 'estado_jwt';

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
