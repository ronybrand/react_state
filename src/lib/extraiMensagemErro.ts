import { isAxiosError } from 'axios';

export function extraiMensagemErro(error: unknown, fallback: string): string {
  if (!isAxiosError(error)) {
    return fallback;
  }

  const body: unknown = error.response?.data;
  const mensagem = body && typeof body === 'object' && 'message' in body ? body.message : undefined;

  if (typeof mensagem === 'string' && mensagem.trim().length > 0) {
    return mensagem;
  }

  return fallback;
}
