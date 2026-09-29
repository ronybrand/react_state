import MockAdapter from 'axios-mock-adapter';
import { httpClient } from '../lib/httpClient';
import { authService } from './authService';
import { clearToken, getToken } from '../lib/tokenStorage';

describe('authService', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(httpClient);
    clearToken();
  });

  afterEach(() => {
    mock.restore();
    clearToken();
  });

  it('login posts credentials and stores the returned token', async () => {
    mock.onPost('/auth/login', { username: 'admin', password: 'senha' }).reply(200, {
      token: 'token-emitido',
      expiresInSeconds: 3600,
    });

    const result = await authService.login({ username: 'admin', password: 'senha' });

    expect(result).toEqual({ token: 'token-emitido', expiresInSeconds: 3600 });
    expect(getToken()).toBe('token-emitido');
  });

  it('login does not store a token when the request fails', async () => {
    mock.onPost('/auth/login').reply(401, { message: 'Usuario ou senha invalidos' });

    await expect(authService.login({ username: 'admin', password: 'errada' })).rejects.toThrow();

    expect(getToken()).toBeNull();
  });
});
