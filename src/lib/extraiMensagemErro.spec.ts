import { AxiosError, AxiosHeaders } from 'axios';
import { extraiMensagemErro } from './extraiMensagemErro';

function criaAxiosError(data: unknown): AxiosError {
  return new AxiosError('erro', undefined, undefined, undefined, {
    data,
    status: 500,
    statusText: 'Internal Server Error',
    headers: new AxiosHeaders(),
    config: { headers: new AxiosHeaders() },
  });
}

describe('extraiMensagemErro', () => {
  it('retorna a mensagem do corpo da resposta quando presente', () => {
    const error = criaAxiosError({ message: 'Estado não encontrado.' });

    expect(extraiMensagemErro(error, 'fallback')).toBe('Estado não encontrado.');
  });

  it('retorna o fallback quando o corpo não tem message', () => {
    const error = criaAxiosError({});

    expect(extraiMensagemErro(error, 'Falha ao buscar estados.')).toBe('Falha ao buscar estados.');
  });

  it('retorna o fallback quando message é uma string vazia', () => {
    const error = criaAxiosError({ message: '   ' });

    expect(extraiMensagemErro(error, 'fallback')).toBe('fallback');
  });

  it('retorna o fallback para um erro que não é do axios', () => {
    expect(extraiMensagemErro(new Error('boom'), 'fallback')).toBe('fallback');
  });
});
