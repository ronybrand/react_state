import { isAxiosError } from 'axios';

// O backend só ecoa UUID válido - mas o front não deveria confiar cegamente
// nisso: um proxy no meio pode devolver outra coisa num erro de gateway
// antes de chegar na app. Validar formato aqui evita exibir pro usuário
// algo que não é realmente um ID de correlação.
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function extraiRequestIdErro(error: unknown): string | null {
  if (!isAxiosError(error)) {
    return null;
  }

  const body: unknown = error.response?.data;
  const requestId =
    body && typeof body === 'object' && 'requestId' in body ? body.requestId : undefined;

  if (typeof requestId === 'string' && UUID_REGEX.test(requestId.trim())) {
    return requestId.trim();
  }

  return null;
}
