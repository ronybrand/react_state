import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { ProtectedRoute } from './ProtectedRoute';
import { clearToken, setToken } from '../../lib/tokenStorage';

function tokenWithExpiration(exp: number): string {
  const payload = btoa(JSON.stringify({ exp })).replace(/\+/g, '-').replace(/\//g, '_');
  return `header.${payload}.signature`;
}

function renderAt(initialEntry: string) {
  const router = createMemoryRouter(
    [
      { path: '/login', element: <div>Login page</div> },
      {
        Component: ProtectedRoute,
        children: [{ path: '/protected', element: <div>Protected content</div> }],
      },
    ],
    { initialEntries: [initialEntry] },
  );

  return render(<RouterProvider router={router} />);
}

describe('ProtectedRoute', () => {
  afterEach(() => {
    clearToken();
  });

  it('redirects to /login when there is no valid token', () => {
    renderAt('/protected');

    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  it('renders the protected route when the token is valid', () => {
    setToken(tokenWithExpiration(Math.floor(Date.now() / 1000) + 3600));

    renderAt('/protected');

    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });
});
