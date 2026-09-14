import MockAdapter from 'axios-mock-adapter';
import { httpClient } from '../lib/httpClient';
import { infoService } from './infoService';
import type { BackendInfo } from '../interfaces/backendInfo';

describe('infoService', () => {
  describe('getFrontendVersion', () => {
    const originalFetch = global.fetch;

    afterEach(() => {
      global.fetch = originalFetch;
    });

    it('resolves with the parsed version.json when the fetch succeeds', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ commit: 'abc1234', buildDate: '2026-01-01T00:00:00Z' }),
      } as Response);

      const result = await infoService.getFrontendVersion();

      expect(global.fetch).toHaveBeenCalledWith('/version.json');
      expect(result).toEqual({ commit: 'abc1234', buildDate: '2026-01-01T00:00:00Z' });
    });

    it('throws when the response is not ok', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 } as Response);

      await expect(infoService.getFrontendVersion()).rejects.toThrow(
        'Failed to load version.json: 404',
      );
    });
  });

  describe('getBackendInfo', () => {
    let mock: MockAdapter;

    beforeEach(() => {
      mock = new MockAdapter(httpClient);
    });

    afterEach(() => {
      mock.restore();
    });

    it('GETs /actuator/info and returns the response body', async () => {
      const backendInfo: BackendInfo = {
        build: { commit: 'def5678', time: '2026-01-02T00:00:00Z' },
      };
      mock.onGet('/actuator/info').reply(200, backendInfo);

      const result = await infoService.getBackendInfo();

      expect(result).toEqual(backendInfo);
    });
  });
});
