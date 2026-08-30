import { QueryClient } from '@tanstack/react-query';

// httpClient já reenvia GETs que falham (RETRY_COUNT, ver src/lib/httpClient.ts) -
// desabilita o retry próprio do React Query para não duplicar tentativas por
// cima do que o interceptor já faz.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});
