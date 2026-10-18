import { AxiosError, type AxiosResponse } from 'axios';
import { describe, expect, it } from 'vitest';
import {
  API_UNAVAILABLE_MESSAGE,
  apiErrorMessage,
  isApiUnavailable,
  START_API_URL,
  startApiUrl,
} from './apiErrorMessage';

function axiosErrorWithStatus(status: number) {
  return new AxiosError('failed', undefined, undefined, undefined, {
    status,
  } as AxiosResponse);
}

describe('apiErrorMessage', () => {
  it('treats an error with no response (network/timeout) as unavailable', () => {
    expect(isApiUnavailable(new AxiosError('Network Error'))).toBe(true);
  });

  it.each([502, 503, 504])('treats HTTP %i as unavailable', (status) => {
    expect(apiErrorMessage(axiosErrorWithStatus(status), 'Failed.')).toBe(API_UNAVAILABLE_MESSAGE);
  });

  it.each([400, 401, 404, 500])('keeps the fallback for HTTP %i', (status) => {
    expect(apiErrorMessage(axiosErrorWithStatus(status), 'Failed.')).toBe('Failed.');
  });

  it('keeps the fallback for a non-axios error', () => {
    expect(apiErrorMessage(new Error('boom'), 'Failed.')).toBe('Failed.');
  });

  it('builds the start-api link with language and the page to return to', () => {
    const url = new URL(startApiUrl('https://app.example/state/1?x=1'));

    expect(url.origin + url.pathname).toBe(START_API_URL);
    expect(url.searchParams.get('lang')).toBe('en');
    expect(url.searchParams.get('back')).toBe('https://app.example/state/1?x=1');
  });

  it('omits back when there is no page to return to', () => {
    const url = new URL(startApiUrl());

    expect(url.searchParams.get('lang')).toBe('en');
    expect(url.searchParams.has('back')).toBe(false);
  });
});
