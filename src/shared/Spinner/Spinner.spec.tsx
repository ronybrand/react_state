import { render, screen } from '@testing-library/react';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('exposes role="status" for screen readers', () => {
    render(<Spinner />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('includes "Loading..." text visible only to screen readers', () => {
    render(<Spinner />);

    expect(screen.getByText('Loading...')).toHaveClass('sr-only');
  });
});
