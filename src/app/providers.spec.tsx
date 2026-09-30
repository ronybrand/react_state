import { render, screen } from '@testing-library/react';
import { Providers } from './providers';
import { notifySessionExpired } from '../lib/sessionExpired';

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: React.ComponentProps<'a'>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const replace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
}));

describe('Providers (app/providers.tsx)', () => {
  beforeEach(() => {
    replace.mockClear();
  });

  it('renders its children inside the app chrome', () => {
    render(
      <Providers>
        <p>page content</p>
      </Providers>,
    );

    expect(screen.getByText('page content')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'State CRUD - React/Java' })).toBeInTheDocument();
  });

  it('wires up the session-expired listener, navigating to /login on a 401', () => {
    render(
      <Providers>
        <p>page content</p>
      </Providers>,
    );

    notifySessionExpired();

    expect(replace).toHaveBeenCalledWith('/login');
  });
});
