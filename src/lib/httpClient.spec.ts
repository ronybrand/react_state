import MockAdapter from 'axios-mock-adapter';
import { httpClient, REQUEST_ID_HEADER, RETRY_DELAY_MS } from './httpClient';
import { clearToken, getToken, setToken } from './tokenStorage';
import { router } from '../router';

vi.mock('../router', () => ({
  router: { navigate: vi.fn() },
}));

describe('httpClient', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(httpClient);
    clearToken();
    vi.mocked(router.navigate).mockClear();
  });

  afterEach(() => {
    mock.restore();
    clearToken();
  });

  it('sends an X-Request-Id (UUID) on every request', async () => {
    mock.onGet('/state/').reply((config) => {
      expect(config.headers?.[REQUEST_ID_HEADER]).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
      return [200, []];
    });

    await httpClient.get('/state/');
  });

  it('keeps the same X-Request-Id across retry attempts of a GET', async () => {
    const requestIds: unknown[] = [];
    mock.onGet('/state/').reply((config) => {
      requestIds.push(config.headers?.[REQUEST_ID_HEADER]);
      return [500];
    });

    await expect(httpClient.get('/state/')).rejects.toThrow();

    expect(requestIds).toHaveLength(3);
    expect(new Set(requestIds).size).toBe(1);
  });

  it('resends a failing GET up to RETRY_COUNT times', async () => {
    let attempts = 0;
    mock.onGet('/state/').reply(() => {
      attempts++;
      return attempts <= 2 ? [500] : [200, []];
    });

    const response = await httpClient.get('/state/');

    expect(response.status).toBe(200);
    expect(attempts).toBe(3);
  });

  it('waits longer between each retry attempt (exponential backoff)', async () => {
    const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');
    let attempts = 0;
    mock.onGet('/state/').reply(() => {
      attempts++;
      return attempts <= 2 ? [500] : [200, []];
    });

    await httpClient.get('/state/');

    const delays = setTimeoutSpy.mock.calls.map(([, ms]) => ms);
    expect(delays).toEqual([RETRY_DELAY_MS, RETRY_DELAY_MS * 2]);
    setTimeoutSpy.mockRestore();
  });

  it('does not resend a GET that failed with a 4xx status', async () => {
    let attempts = 0;
    mock.onGet('/state/999').reply(() => {
      attempts++;
      return [404];
    });

    await expect(httpClient.get('/state/999')).rejects.toThrow();

    expect(attempts).toBe(1);
  });

  it('does not resend a failing POST', async () => {
    let attempts = 0;
    mock.onPost('/state/').reply(() => {
      attempts++;
      return [500];
    });

    await expect(httpClient.post('/state/', {})).rejects.toThrow();

    expect(attempts).toBe(1);
  });

  it('attaches Authorization when a token is stored', async () => {
    setToken('token-armazenado');
    mock.onPost('/state/').reply((config) => {
      expect(config.headers?.['Authorization']).toBe('Bearer token-armazenado');
      return [201, {}];
    });

    await httpClient.post('/state/', {});
  });

  it('does not attach Authorization when there is no token', async () => {
    mock.onPost('/state/').reply((config) => {
      expect(config.headers?.['Authorization']).toBeUndefined();
      return [201, {}];
    });

    await httpClient.post('/state/', {});
  });

  it('clears the token and navigates to /login on a 401, without retrying', async () => {
    setToken('token-existente');
    let attempts = 0;
    mock.onPost('/state/').reply(() => {
      attempts++;
      return [401, { message: 'Nao autenticado' }];
    });

    await expect(httpClient.post('/state/', {})).rejects.toThrow();

    expect(attempts).toBe(1);
    expect(getToken()).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith('/login', { replace: true });
  });

  it('only navigates once when concurrent requests all 401', async () => {
    setToken('token-existente');
    mock.onGet('/state/a').reply(() => [401, { message: 'Nao autenticado' }]);
    mock.onGet('/state/b').reply(() => [401, { message: 'Nao autenticado' }]);

    await Promise.allSettled([httpClient.get('/state/a'), httpClient.get('/state/b')]);

    expect(getToken()).toBeNull();
    expect(router.navigate).toHaveBeenCalledTimes(1);
    expect(router.navigate).toHaveBeenCalledWith('/login', { replace: true });
  });

  it('does not clear the token or navigate on a 401 from the login request itself', async () => {
    setToken('token-existente');
    let attempts = 0;
    mock.onPost('/auth/login').reply(() => {
      attempts++;
      return [401, { message: 'Invalid credentials' }];
    });

    await expect(httpClient.post('/auth/login', {})).rejects.toThrow();

    expect(attempts).toBe(1);
    expect(getToken()).toBe('token-existente');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('does not clear the token on a non-401 error', async () => {
    setToken('token-existente');
    mock.onPost('/state/999').reply(() => [404]);

    await expect(httpClient.post('/state/999', {})).rejects.toThrow();

    expect(getToken()).toBe('token-existente');
  });
});
