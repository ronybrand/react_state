import { useCallback, useRef, useState } from 'react';

const DEFAULT_DURATION_MS = 5000;

export function useErrorMessage() {
  const [error, setErrorState] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const clearTimeoutId = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const setError = useCallback(
    (message: string, id: string | null = null, durationMs = DEFAULT_DURATION_MS) => {
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
