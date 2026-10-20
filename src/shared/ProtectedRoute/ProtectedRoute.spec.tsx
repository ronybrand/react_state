import { act, screen } from '@testing-library/react';
import { ProtectedRoute } from './ProtectedRoute';
import { clearToken, setToken } from '../../lib/tokenStorage';
import { renderWithProviders } from '../../testUtils';

// Deviation from the Vite original: that version rendered ProtectedRoute
// inside a react-router createMemoryRouter with a real '/login' route, and
// asserted the redirect by checking which route's content appeared. Next's
// App Router has no in-test router to mount - useRouter() is mocked
// instead, and the redirect is asserted via router.replace('/login') having
// been called, plus the guard rendering nothing once invalid.
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

describe('ProtectedRoute', () => {
  beforeEach(() => {
    replace.mockClear();
  });

  afterEach(() => {
    clearToken();
    vi.useRealTimers();
  });

  it('redirects to /login once the token expires while the route stays mounted', () => {
    vi.useFakeTimers();
    setToken(tokenWithExpiration(Math.floor(Date.now() / 1000) + 1));

    renderWithProviders(
      <ProtectedRoute>
        <div>Protected content</div>
      </ProtectedRoute>,
    );
    expect(screen.getByText('Protected content')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(6000);
    });

    expect(replace).toHaveBeenCalledWith('/en/login');
  });

  it('redirects to /login when there is no valid token', () => {
    renderWithProviders(
      <ProtectedRoute>
        <div>Protected content</div>
      </ProtectedRoute>,
    );

    expect(replace).toHaveBeenCalledWith('/en/login');
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });

  it('renders the protected route when the token is valid', () => {
    setToken(tokenWithExpiration(Math.floor(Date.now() / 1000) + 3600));

    renderWithProviders(
      <ProtectedRoute>
        <div>Protected content</div>
      </ProtectedRoute>,
    );

    expect(screen.getByText('Protected content')).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
});
