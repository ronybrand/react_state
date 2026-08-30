import { screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { render } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './Layout';
import { createQueryClient } from '../../testUtils';

describe('Layout', () => {
  it('shows the title bar linking back to home', () => {
    const router = createMemoryRouter(
      [{ path: '/', Component: Layout, children: [{ index: true, element: <p>content</p> }] }],
      { initialEntries: ['/'] },
    );

    render(
      <QueryClientProvider client={createQueryClient()}>
        <RouterProvider router={router} />
      </QueryClientProvider>,
    );

    expect(screen.getByRole('link', { name: 'State CRUD - React/Java' })).toHaveAttribute(
      'href',
      '/',
    );
    expect(screen.getByText('content')).toBeInTheDocument();
  });
});
