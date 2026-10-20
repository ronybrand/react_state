import type { Lang } from '../i18n/TranslationProvider';
import { httpClient } from '../lib/httpClient';

export const ASK_TIMEOUT_MS = 55_000;

export interface AskResponse {
  answer: string;
}

export const askService = {
  ask: (question: string, lang: Lang) =>
    httpClient
      .post<AskResponse>('/ask', { question }, { params: { lang }, timeout: ASK_TIMEOUT_MS })
      .then((response) => response.data),
};
