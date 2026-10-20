import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { NextIntlClientProvider } from 'next-intl';
import { Layout } from './Layout';
import { createQueryClient } from '../../testUtils';
import { setToken, clearToken } from '../../lib/tokenStorage';
import enMessages from '../../messages/en.json';

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
const { mockPush, mockReplace } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockReplace: vi.fn(),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
  usePathname: () => '/state/new',
  redirect: vi.fn(),
  permanentRedirect: vi.fn(),
}));

function renderLayout() {
  render(
    <NextIntlClientProvider locale="en" messages={enMessages}>
      <QueryClientProvider client={createQueryClient()}>
        <Layout>
          <p>content</p>
        </Layout>
      </QueryClientProvider>
    </NextIntlClientProvider>,
  );
}

function validToken() {
  const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }));
  return `header.${payload}.signature`;
}

describe('Layout', () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockReplace.mockReset();
  });

  afterEach(() => {
    clearToken();
  });

  it('shows the title bar linking back to home', () => {
    renderLayout();

    expect(screen.getByRole('link', { name: 'State CRUD - React/Java' })).toHaveAttribute(
      'href',
      '/en',
    );
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('does not show the logout button when there is no valid token', () => {
    renderLayout();

    expect(screen.queryByRole('button', { name: 'Log out' })).not.toBeInTheDocument();
  });

  it('shows the logout button when authenticated', () => {
    setToken(validToken());

    renderLayout();

    expect(screen.getByRole('button', { name: 'Log out' })).toBeInTheDocument();
  });

  it('clears the token and redirects to /login on logout click', async () => {
    setToken(validToken());
    renderLayout();

    await userEvent.click(screen.getByRole('button', { name: 'Log out' }));

    expect(mockPush).toHaveBeenCalledWith('/en/login');
    expect(localStorage.getItem('estado_jwt')).toBeNull();
  });
});
