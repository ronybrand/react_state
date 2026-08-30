import { AxiosError, AxiosHeaders } from 'axios';
import { extraiRequestIdErro } from './extraiRequestIdErro';

function criaAxiosError(data: unknown): AxiosError {
  return new AxiosError('erro', undefined, undefined, undefined, {
    data,
    status: 500,
    statusText: 'Internal Server Error',
    headers: new AxiosHeaders(),
    config: { headers: new AxiosHeaders() },
  });
}

describe('extraiRequestIdErro', () => {
  it('retorna o requestId quando é um UUID válido', () => {
    const error = criaAxiosError({ requestId: '550e8400-e29b-41d4-a716-446655440000' });

    expect(extraiRequestIdErro(error)).toBe('550e8400-e29b-41d4-a716-446655440000');
  });

  it('retorna null quando requestId não é um UUID válido', () => {
    const error = criaAxiosError({ requestId: 'nao-e-um-uuid' });

    expect(extraiRequestIdErro(error)).toBeNull();
  });

  it('retorna null quando não há requestId no corpo', () => {
    const error = criaAxiosError({});

    expect(extraiRequestIdErro(error)).toBeNull();
  });

  it('retorna null para um erro que não é do axios', () => {
    expect(extraiRequestIdErro(new Error('boom'))).toBeNull();
  });
});
