import { clearToken, getToken, isTokenValid, setToken } from './tokenStorage';

function tokenWithExpiration(exp: number): string {
  const payload = btoa(JSON.stringify({ exp })).replace(/\+/g, '-').replace(/\//g, '_');
  return `header.${payload}.signature`;
}

describe('tokenStorage', () => {
  afterEach(() => {
    clearToken();
  });

  it('returns null when there is no stored token', () => {
    expect(getToken()).toBeNull();
  });

  it('setToken followed by getToken returns the same value', () => {
    setToken('meu-token');

    expect(getToken()).toBe('meu-token');
  });

  it('clearToken removes the stored token', () => {
    setToken('meu-token');

    clearToken();

    expect(getToken()).toBeNull();
  });

  it('isTokenValid is false when there is no token', () => {
    expect(isTokenValid()).toBe(false);
  });

  it('isTokenValid is true for a token whose exp is in the future', () => {
    setToken(tokenWithExpiration(Math.floor(Date.now() / 1000) + 3600));

    expect(isTokenValid()).toBe(true);
  });

  it('isTokenValid is false for an expired token', () => {
    setToken(tokenWithExpiration(Math.floor(Date.now() / 1000) - 3600));

    expect(isTokenValid()).toBe(false);
  });

  it('isTokenValid is false for a malformed token', () => {
    setToken('not-a-jwt');

    expect(isTokenValid()).toBe(false);
  });
});
