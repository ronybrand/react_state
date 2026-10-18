import { isAxiosError } from 'axios';

export const API_UNAVAILABLE_MESSAGE =
  'The API is temporarily offline (paused to save cost). Please try again in a few minutes.';

const GATEWAY_STATUSES = [502, 503, 504];

// No usable backend answer: no response at all (network, or axios' own
// timeout) or the BFF proxy's 502/504 when it can't reach the backend (see
// app/api/[...path]/route.ts). With the EC2 turned off (deploy/aws-power.ps1
// in the backend repo) this is exactly what the user sees.
export function isApiUnavailable(error: unknown): boolean {
  if (!isAxiosError(error)) {
    return false;
  }
  return !error.response || GATEWAY_STATUSES.includes(error.response.status);
}

export function apiErrorMessage(error: unknown, fallback: string): string {
  return isApiUnavailable(error) ? API_UNAVAILABLE_MESSAGE : fallback;
}
