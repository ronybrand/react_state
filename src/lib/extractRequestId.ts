import { isAxiosError } from 'axios';

// The backend only ever echoes a valid UUID - but the client shouldn't blindly
// trust that either: a proxy in between could return something else on a
// gateway error before it reaches the app. Validating the format here avoids
// showing the user something that isn't really a correlation id.
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function extractRequestId(error: unknown): string | null {
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
