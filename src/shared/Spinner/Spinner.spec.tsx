import { screen } from '@testing-library/react';
import { Spinner } from './Spinner';
import { renderWithProviders } from '../../testUtils';

describe('Spinner', () => {
  it('exposes role="status" for screen readers', () => {
    renderWithProviders(<Spinner />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('includes "Loading..." text visible only to screen readers', () => {
    renderWithProviders(<Spinner />);

    expect(screen.getByText('Loading...')).toHaveClass('sr-only');
  });
});
