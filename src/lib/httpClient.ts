import axios, { type AxiosRequestConfig } from 'axios';
import { clearToken, getToken } from './tokenStorage';
import { router } from '../router';

const LOGIN_URL = '/auth/login';

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

// Generated once per logical user action, not per network attempt - the
// retry interceptor resends the same config through the client, which goes
// through this interceptor again; only generate a new id when there isn't
// one yet, so that up to RETRY_COUNT attempts of the same GET correlate as
// a single action in the backend logs, not disconnected events.
httpClient.interceptors.request.use((config) => {
  if (!config.headers.has(REQUEST_ID_HEADER)) {
    config.headers.set(REQUEST_ID_HEADER, crypto.randomUUID());
  }

  const token = getToken();
  if (token && !config.headers.has('Authorization')) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }

  return config;
});

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

httpClient.interceptors.response.use(undefined, async (error) => {
  const config: RetryConfig | undefined = error.config;
  const status: number | undefined = error.response?.status;

  // Checked before the retry branch below so a 401 is never retried, and
  // handled here (not left to page-level onError) because it's a global
  // concern - any request can lose auth mid-session, not just the one the
  // user happens to be looking at. The login request itself is excluded:
  // a wrong-password attempt also answers 401, and that's a normal form
  // error for Login.tsx to show, not a session loss to react to globally.
  if (status === 401 && !config?.url?.endsWith(LOGIN_URL)) {
    clearToken();
    router.navigate('/login', { replace: true });
    throw error;
  }

  const retryable = !status || status >= 500;

  if (!config || config.method?.toLowerCase() !== 'get' || !retryable) {
    throw error;
  }

  config._retryCount = (config._retryCount ?? 0) + 1;
  if (config._retryCount > RETRY_COUNT) {
    throw error;
  }

  await delay(RETRY_DELAY_MS);
  return httpClient(config);
});
