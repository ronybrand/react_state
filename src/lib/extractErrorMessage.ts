import { isAxiosError } from 'axios';

export function extractErrorMessage(error: unknown, fallback: string): string {
  if (!isAxiosError(error)) {
    return fallback;
  }

  const body: unknown = error.response?.data;
  const message = body && typeof body === 'object' && 'message' in body ? body.message : undefined;

  if (typeof message === 'string' && message.trim().length > 0) {
    return message;
  }

  return fallback;
}
