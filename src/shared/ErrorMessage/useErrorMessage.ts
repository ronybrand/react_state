'use client';

import { useCallback, useRef, useState } from 'react';
import { API_UNAVAILABLE_MESSAGE } from '../../lib/apiErrorMessage';

const DEFAULT_DURATION_MS = 5000;
// The error only arrives after the timeout and retries (~45s) with an empty
// screen, so the usual 5s would vanish before being read.
const API_UNAVAILABLE_DURATION_MS = 60000;

export function useErrorMessage() {
  const [error, setErrorState] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const clearTimeoutId = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const setError = useCallback(
    (
      message: string,
      id: string | null = null,
      durationMs = message === API_UNAVAILABLE_MESSAGE
        ? API_UNAVAILABLE_DURATION_MS
        : DEFAULT_DURATION_MS,
    ) => {
      clearTimeout(clearTimeoutId.current);

      setErrorState(message);
      setRequestId(id);
      clearTimeoutId.current = setTimeout(() => {
        setErrorState(null);
        setRequestId(null);
      }, durationMs);
    },
    [],
  );

  const clearError = useCallback(() => {
    clearTimeout(clearTimeoutId.current);
    setErrorState(null);
    setRequestId(null);
  }, []);

  return { error, requestId, setError, clearError };
}
