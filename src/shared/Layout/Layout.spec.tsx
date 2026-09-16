import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { render } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './Layout';
import { createQueryClient } from '../../testUtils';
import { setToken, clearToken } from '../../lib/tokenStorage';

function renderLayout(initialEntries = ['/']) {
  const router = createMemoryRouter(
    [
      { path: '/', Component: Layout, children: [{ index: true, element: <p>content</p> }] },
      { path: '/login', element: <p>login page</p> },
    ],
    { initialEntries },
  );

  render(
    <QueryClientProvider client={createQueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

function validToken() {
  const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }));
  return `header.${payload}.signature`;
}

describe('Layout', () => {
  afterEach(() => {
    clearToken();
  });

  it('shows the title bar linking back to home', () => {
    renderLayout();

    expect(screen.getByRole('link', { name: 'State CRUD - React/Java' })).toHaveAttribute(
      'href',
      '/',
    );
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('does not show the logout button when there is no valid token', () => {
    renderLayout();

    expect(screen.queryByRole('button', { name: 'Sair' })).not.toBeInTheDocument();
  });

  it('shows the logout button when authenticated', () => {
    setToken(validToken());

    renderLayout();

    expect(screen.getByRole('button', { name: 'Sair' })).toBeInTheDocument();
  });

  it('clears the token and redirects to /login on logout click', async () => {
    setToken(validToken());
    renderLayout();

    await userEvent.click(screen.getByRole('button', { name: 'Sair' }));

    expect(screen.getByText('login page')).toBeInTheDocument();
    expect(localStorage.getItem('estado_jwt')).toBeNull();
  });
});
