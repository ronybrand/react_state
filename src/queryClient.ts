import { QueryClient } from '@tanstack/react-query';

// httpClient already resends failing GETs (RETRY_COUNT, see
// src/lib/httpClient.ts) - disable React Query's own retry so it doesn't
// duplicate attempts on top of what the interceptor already does.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});
