import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './Layout';
import { createQueryClient } from '../../testUtils';
import { setToken, clearToken } from '../../lib/tokenStorage';

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: React.ComponentProps<'a'>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

// Deviation from the Vite original: that version mounted Layout inside a
// react-router createMemoryRouter with a real '/login' route and asserted
// the redirect by checking for the login route's rendered content. Next's
// App Router has no in-test router - useRouter() is mocked instead, and the
// logout behavior is asserted via router.push('/login') having been called.
const mockPush = vi.hoisted(() => vi.fn());
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

function renderLayout() {
  render(
    <QueryClientProvider client={createQueryClient()}>
      <Layout>
        <p>content</p>
      </Layout>
    </QueryClientProvider>,
  );
}

function validToken() {
  const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }));
  return `header.${payload}.signature`;
}

describe('Layout', () => {
  beforeEach(() => {
    mockPush.mockReset();
  });

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

    expect(mockPush).toHaveBeenCalledWith('/login');
    expect(localStorage.getItem('estado_jwt')).toBeNull();
  });
});
