import MockAdapter from 'axios-mock-adapter';
import { httpClient, REQUEST_ID_HEADER } from './httpClient';
import { clearToken, getToken, setToken } from './tokenStorage';

describe('httpClient', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(httpClient);
    clearToken();
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

  it('clears the token and redirects to /login on a 401, without retrying', async () => {
    const originalLocation = window.location;
    // window.location isn't reassignable directly in jsdom - replacing the
    // whole property (and restoring it after) is the standard workaround.
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, href: '' },
    });
    setToken('token-existente');
    let attempts = 0;
    mock.onPost('/state/').reply(() => {
      attempts++;
      return [401, { message: 'Nao autenticado' }];
    });

    await expect(httpClient.post('/state/', {})).rejects.toThrow();

    expect(attempts).toBe(1);
    expect(getToken()).toBeNull();
    expect(window.location.href).toBe('/login');

    Object.defineProperty(window, 'location', { configurable: true, value: originalLocation });
  });

  it('does not clear the token on a non-401 error', async () => {
    setToken('token-existente');
    mock.onPost('/state/999').reply(() => [404]);

    await expect(httpClient.post('/state/999', {})).rejects.toThrow();

    expect(getToken()).toBe('token-existente');
  });
});
