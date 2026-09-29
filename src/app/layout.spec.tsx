import { render, screen } from '@testing-library/react';
import RootLayout, { metadata } from './layout';

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: React.ComponentProps<'a'>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

// RootLayout returns <html>/<body> - not something a real app ever renders
// standalone (Next always mounts it around the document), but React can
// still render it into jsdom's body for a smoke test of what it wires up
// (Providers -> Layout chrome -> children).
describe('RootLayout (app/layout.tsx)', () => {
  it('sets the page title via metadata', () => {
    expect(metadata.title).toBe('State CRUD - React/Java');
  });

  it('renders the app chrome around its children', () => {
    render(
      <RootLayout>
        <p>page content</p>
      </RootLayout>,
    );

    expect(screen.getByText('page content')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'State CRUD - React/Java' })).toBeInTheDocument();
  });
});
