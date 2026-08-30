import MockAdapter from 'axios-mock-adapter';
import { httpClient, REQUEST_ID_HEADER } from './httpClient';

describe('httpClient', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(httpClient);
  });

  afterEach(() => {
    mock.restore();
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

  it('does not resend a failing POST', async () => {
    let attempts = 0;
    mock.onPost('/state/').reply(() => {
      attempts++;
      return [500];
    });

    await expect(httpClient.post('/state/', {})).rejects.toThrow();

    expect(attempts).toBe(1);
  });
});
