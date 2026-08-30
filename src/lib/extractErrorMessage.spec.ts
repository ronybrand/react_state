import { AxiosError, AxiosHeaders } from 'axios';
import { extractErrorMessage } from './extractErrorMessage';

function createAxiosError(data: unknown): AxiosError {
  return new AxiosError('error', undefined, undefined, undefined, {
    data,
    status: 500,
    statusText: 'Internal Server Error',
    headers: new AxiosHeaders(),
    config: { headers: new AxiosHeaders() },
  });
}

describe('extractErrorMessage', () => {
  it('returns the message from the response body when present', () => {
    const error = createAxiosError({ message: 'State not found.' });

    expect(extractErrorMessage(error, 'fallback')).toBe('State not found.');
  });

  it('returns the fallback when the body has no message', () => {
    const error = createAxiosError({});

    expect(extractErrorMessage(error, 'Failed to fetch states.')).toBe('Failed to fetch states.');
  });

  it('returns the fallback when message is an empty string', () => {
    const error = createAxiosError({ message: '   ' });

    expect(extractErrorMessage(error, 'fallback')).toBe('fallback');
  });

  it('returns the fallback for an error that is not from axios', () => {
    expect(extractErrorMessage(new Error('boom'), 'fallback')).toBe('fallback');
  });
});
