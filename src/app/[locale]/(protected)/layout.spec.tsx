import { screen } from '@testing-library/react';
import ProtectedLayout from './layout';
import { clearToken, setToken } from '@/lib/tokenStorage';
import { renderWithProviders } from '@/testUtils';

const replace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  redirect: vi.fn(),
  permanentRedirect: vi.fn(),
}));

function tokenWithExpiration(exp: number): string {
  const payload = btoa(JSON.stringify({ exp })).replace(/\+/g, '-').replace(/\//g, '_');
  return `header.${payload}.signature`;
}

describe('(protected)/layout (route group wrapping /state/new and /state/[id]/edit)', () => {
  afterEach(() => {
    clearToken();
    replace.mockClear();
  });

  it('renders children when the token is valid', () => {
    setToken(tokenWithExpiration(Math.floor(Date.now() / 1000) + 3600));

    renderWithProviders(
      <ProtectedLayout>
        <div>Protected page</div>
      </ProtectedLayout>,
    );

    expect(screen.getByText('Protected page')).toBeInTheDocument();
  });

  it('redirects to /login and renders nothing without a valid token', () => {
    renderWithProviders(
      <ProtectedLayout>
        <div>Protected page</div>
      </ProtectedLayout>,
    );

    expect(replace).toHaveBeenCalledWith('/en/login');
    expect(screen.queryByText('Protected page')).not.toBeInTheDocument();
  });
});
