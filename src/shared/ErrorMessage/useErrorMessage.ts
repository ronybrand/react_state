import { useCallback, useRef, useState } from 'react';

const DURACAO_PADRAO_MS = 5000;

export function useErrorMsg() {
  const [error, setErrorState] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const limpezaTimeoutId = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const setError = useCallback(
    (mensagem: string, id: string | null = null, duracaoMs = DURACAO_PADRAO_MS) => {
      clearTimeout(limpezaTimeoutId.current);

      setErrorState(mensagem);
      setRequestId(id);
      limpezaTimeoutId.current = setTimeout(() => {
        setErrorState(null);
        setRequestId(null);
      }, duracaoMs);
    },
    [],
  );

  return { error, requestId, setError };
}
