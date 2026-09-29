import type { ReactElement, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

// Deviation from the Vite original: that version wrapped rendered
// components in react-router's <MemoryRouter initialEntries={[route]}>.
// Next.js's App Router has no router provider component to mount in tests
// - routing (useRouter/useParams/Link) is mocked per-spec instead via
// vi.mock('next/navigation') and vi.mock('next/link'), so this wrapper only
// needs to provide the QueryClientProvider. The `route` option is dropped;
// specs that need a param now mock useParams() directly.
export function renderWithProviders(
  ui: ReactElement,
  { queryClient = createQueryClient() }: { queryClient?: QueryClient } = {},
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return render(ui, { wrapper: Wrapper });
}
