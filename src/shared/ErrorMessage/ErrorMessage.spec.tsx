import { render, screen } from '@testing-library/react';
import { ErrorMessage } from './ErrorMessage';

describe('ErrorMessage', () => {
  it('renders nothing when there is no error', () => {
    const { container } = render(<ErrorMessage error={null} requestId={null} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders the message in role="alert" with aria-live assertive', () => {
    render(<ErrorMessage error="Failed to fetch states." requestId={null} />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Failed to fetch states.');
    expect(alert).toHaveAttribute('aria-live', 'assertive');
  });

  it('shows the reference ID when provided', () => {
    render(<ErrorMessage error="Failed to fetch states." requestId="abc-123" />);

    expect(screen.getByText(/Reference ID: abc-123/)).toBeInTheDocument();
  });

  it('does not show a reference ID when absent', () => {
    render(<ErrorMessage error="Failed to fetch states." requestId={null} />);

    expect(screen.queryByText(/Reference ID/)).not.toBeInTheDocument();
  });
});
