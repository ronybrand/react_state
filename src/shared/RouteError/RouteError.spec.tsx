import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { RouteError } from './RouteError';

function ComponentThatThrows(): never {
  throw new Error('render failure');
}

describe('RouteError', () => {
  it('shows an error message and a link back to home when the route throws', async () => {
    const router = createMemoryRouter(
      [{ path: '/', element: <ComponentThatThrows />, errorElement: <RouteError /> }],
      { initialEntries: ['/'] },
    );

    render(<RouterProvider router={router} />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Something went wrong');
    expect(screen.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/');
  });
});
