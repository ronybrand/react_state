import { screen } from '@testing-library/react';
import GlobalError from './error';
import { renderWithProviders } from '@/testUtils';

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: React.ComponentProps<'a'>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe('GlobalError (app/error.tsx)', () => {
  it('renders RouteError with the caught error', () => {
    renderWithProviders(
      <GlobalError error={Object.assign(new Error('boom'), { digest: 'abc123' })} />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
    expect(screen.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/en');
  });
});
