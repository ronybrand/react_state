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

  it('envia um X-Request-Id (UUID) em toda requisição', async () => {
    mock.onGet('/estado/').reply((config) => {
      expect(config.headers?.[REQUEST_ID_HEADER]).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
      return [200, []];
    });

    await httpClient.get('/estado/');
  });

  it('mantém o mesmo X-Request-Id entre as tentativas de retry de um GET', async () => {
    const requestIds: unknown[] = [];
    mock.onGet('/estado/').reply((config) => {
      requestIds.push(config.headers?.[REQUEST_ID_HEADER]);
      return [500];
    });

    await expect(httpClient.get('/estado/')).rejects.toThrow();

    expect(requestIds).toHaveLength(3);
    expect(new Set(requestIds).size).toBe(1);
  });

  it('reenvia um GET que falha até RETRY_COUNT vezes', async () => {
    let tentativas = 0;
    mock.onGet('/estado/').reply(() => {
      tentativas++;
      return tentativas <= 2 ? [500] : [200, []];
    });

    const response = await httpClient.get('/estado/');

    expect(response.status).toBe(200);
    expect(tentativas).toBe(3);
  });

  it('não reenvia um POST que falha', async () => {
    let tentativas = 0;
    mock.onPost('/estado/').reply(() => {
      tentativas++;
      return [500];
    });

    await expect(httpClient.post('/estado/', {})).rejects.toThrow();

    expect(tentativas).toBe(1);
  });
});
