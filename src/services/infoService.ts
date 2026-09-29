import { httpClient } from '../lib/httpClient';
import type { FrontendVersion } from '../interfaces/frontendVersion';
import type { BackendInfo } from '../interfaces/backendInfo';

export const infoService = {
  // Static file written at build time (see scripts/generate-version.mjs), not part of the API.
  getFrontendVersion: () =>
    fetch('/version.json').then((r) => {
      if (!r.ok) {
        throw new Error(`Failed to load version.json: ${r.status}`);
      }
      return r.json() as Promise<FrontendVersion>;
    }),

  getBackendInfo: () => httpClient.get<BackendInfo>('/actuator/info').then((r) => r.data),
};
