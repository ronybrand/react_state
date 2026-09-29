import { render, screen } from '@testing-library/react';
import ProtectedLayout from './layout';
import { clearToken, setToken } from '../../lib/tokenStorage';

const replace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
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

    render(
      <ProtectedLayout>
        <div>Protected page</div>
      </ProtectedLayout>,
    );

    expect(screen.getByText('Protected page')).toBeInTheDocument();
  });

  it('redirects to /login and renders nothing without a valid token', () => {
    render(
      <ProtectedLayout>
        <div>Protected page</div>
      </ProtectedLayout>,
    );

    expect(replace).toHaveBeenCalledWith('/login');
    expect(screen.queryByText('Protected page')).not.toBeInTheDocument();
  });
});
