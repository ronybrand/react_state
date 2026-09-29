import { render, screen } from '@testing-library/react';
import { RouteError } from './RouteError';

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: React.ComponentProps<'a'>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

// Deviation from the Vite original: that version rendered a component that
// throws inside a react-router route with errorElement={<RouteError/>} and
// asserted useRouteError() picked it up. Next's App Router convention is a
// dedicated app/error.tsx boundary that receives `error` as a prop directly
// (see src/app/error.tsx) - so this spec renders RouteError directly with
// an `error` prop instead of relying on a router to catch a throw.
describe('RouteError', () => {
  it('shows an error message and a link back to home', () => {
    render(<RouteError error={new Error('render failure')} />);

    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
    expect(screen.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/');
  });
});
