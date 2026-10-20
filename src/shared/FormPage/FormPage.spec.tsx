import { screen } from '@testing-library/react';
import { FormPage } from './FormPage';
import { renderWithProviders } from '../../testUtils';

describe('FormPage', () => {
  it('renders the title, error message and children', () => {
    renderWithProviders(
      <FormPage title="New state" error="Failed to create state." requestId="req-1">
        <p>form goes here</p>
      </FormPage>,
    );

    expect(screen.getByRole('heading', { name: 'New state' })).toBeInTheDocument();
    expect(screen.getByText('Failed to create state.')).toBeInTheDocument();
    expect(screen.getByText('form goes here')).toBeInTheDocument();
  });

  it('renders no error message when there is none', () => {
    renderWithProviders(
      <FormPage title="New state" error={null} requestId={null}>
        <p>form goes here</p>
      </FormPage>,
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
