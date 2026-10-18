'use client';

import { API_UNAVAILABLE_MESSAGE, startApiUrl } from '../../lib/apiErrorMessage';

interface ErrorMessageProps {
  error: string | null;
  requestId: string | null;
}

export function ErrorMessage({ error, requestId }: ErrorMessageProps) {
  if (!error) {
    return null;
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="border-danger bg-danger/10 text-danger mb-4 rounded border px-4 py-3"
    >
      {error}
      {error === API_UNAVAILABLE_MESSAGE && (
        <a
          href={startApiUrl(window.location.href)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 block underline"
        >
          Turn on the API
        </a>
      )}
      {requestId && <small className="mt-1 block text-gray-500">Reference ID: {requestId}</small>}
    </div>
  );
}
