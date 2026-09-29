import { LOGIN_PATH } from './apiPaths';

describe('apiPaths', () => {
  it('exposes a single source of truth for the login path', () => {
    expect(LOGIN_PATH).toBe('/auth/login');
  });
});
