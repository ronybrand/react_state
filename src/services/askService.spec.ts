import MockAdapter from 'axios-mock-adapter';
import { httpClient } from '../lib/httpClient';
import { askService, ASK_TIMEOUT_MS } from './askService';

describe('askService', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(httpClient);
  });

  afterEach(() => {
    mock.restore();
  });

  it('posts the question to the same-origin ask endpoint with locale and long AI timeout', async () => {
    mock.onPost('/ask', { question: 'Quantos estados existem?' }).reply(200, {
      answer: 'Existem 26 estados e o Distrito Federal.',
    });

    await expect(askService.ask('Quantos estados existem?', 'pt')).resolves.toEqual({
      answer: 'Existem 26 estados e o Distrito Federal.',
    });

    expect(mock.history.post[0]?.url).toBe('/ask');
    expect(mock.history.post[0]?.timeout).toBe(ASK_TIMEOUT_MS);
    expect(mock.history.post[0]?.params).toEqual({ lang: 'pt' });
    expect(ASK_TIMEOUT_MS).toBeGreaterThan(45_000);
  });
});
