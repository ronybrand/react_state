import axios, { type AxiosRequestConfig } from 'axios';

export const REQUEST_ID_HEADER = 'X-Request-Id';
export const TIMEOUT_MS = 15000;
export const RETRY_COUNT = 2;
export const RETRY_DELAY_MS = 500;

interface RetryConfig extends AxiosRequestConfig {
  _retryCount?: number;
}

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  timeout: TIMEOUT_MS,
});

// Gerado uma vez por ação lógica do usuário, não por tentativa de rede - o
// interceptor de retry reenvia o mesmo config pelo client, o que passa de
// novo por este interceptor; só gera um id novo se ainda não houver um,
// para que as até RETRY_COUNT tentativas de um mesmo GET correlacionem como
// uma única ação nos logs do backend, não eventos desconexos.
httpClient.interceptors.request.use((config) => {
  if (!config.headers.has(REQUEST_ID_HEADER)) {
    config.headers.set(REQUEST_ID_HEADER, crypto.randomUUID());
  }
  return config;
});

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

httpClient.interceptors.response.use(undefined, async (error) => {
  const config: RetryConfig | undefined = error.config;

  if (!config || config.method?.toLowerCase() !== 'get') {
    throw error;
  }

  config._retryCount = (config._retryCount ?? 0) + 1;
  if (config._retryCount > RETRY_COUNT) {
    throw error;
  }

  await delay(RETRY_DELAY_MS);
  return httpClient(config);
});
