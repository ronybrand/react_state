import { AxiosError, AxiosHeaders } from 'axios';
import { extractRequestId } from './extractRequestId';

function createAxiosError(data: unknown): AxiosError {
  return new AxiosError('error', undefined, undefined, undefined, {
    data,
    status: 500,
    statusText: 'Internal Server Error',
    headers: new AxiosHeaders(),
    config: { headers: new AxiosHeaders() },
  });
}

describe('extractRequestId', () => {
  it('returns the requestId when it is a valid UUID', () => {
    const error = createAxiosError({ requestId: '550e8400-e29b-41d4-a716-446655440000' });

    expect(extractRequestId(error)).toBe('550e8400-e29b-41d4-a716-446655440000');
  });

  it('returns null when requestId is not a valid UUID', () => {
    const error = createAxiosError({ requestId: 'not-a-uuid' });

    expect(extractRequestId(error)).toBeNull();
  });

  it('returns null when there is no requestId in the body', () => {
    const error = createAxiosError({});

    expect(extractRequestId(error)).toBeNull();
  });

  it('returns null for an error that is not from axios', () => {
    expect(extractRequestId(new Error('boom'))).toBeNull();
  });
});
