import { render, screen } from '@testing-library/react';
import { API_UNAVAILABLE_MESSAGE, startApiUrl } from '../../lib/apiErrorMessage';
import { ErrorMessage } from './ErrorMessage';
import { TranslationProvider } from '../../i18n/TranslationProvider';

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

  it('offers the turn-on link only when the API is unavailable', () => {
    const { rerender } = render(<ErrorMessage error={API_UNAVAILABLE_MESSAGE} requestId={null} />);

    const link = screen.getByRole('link', { name: 'Turn on the API' });
    expect(link).toHaveAttribute('href', startApiUrl(window.location.href));
    expect(link.getAttribute('href')).toContain(
      'lang=en&back=' + encodeURIComponent(window.location.href),
    );
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');

    rerender(<ErrorMessage error="Failed to fetch states." requestId={null} />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('translates known errors and the API link using the selected language', async () => {
    localStorage.setItem('app_lang', 'pt');

    render(
      <TranslationProvider>
        <ErrorMessage error="Failed to fetch states." requestId="abc-123" />
      </TranslationProvider>,
    );

    expect(await screen.findByRole('alert')).toHaveTextContent('Falha ao buscar estados.');
    expect(screen.getByText('ID de referência: abc-123')).toBeInTheDocument();
  });

  it('opens the API startup page in the selected language', async () => {
    localStorage.setItem('app_lang', 'pt');

    render(
      <TranslationProvider>
        <ErrorMessage error={API_UNAVAILABLE_MESSAGE} requestId={null} />
      </TranslationProvider>,
    );

    const link = await screen.findByRole('link', { name: 'Ativar a API' });
    expect(link).toHaveAttribute('href', startApiUrl(window.location.href, 'pt'));
    expect(link).toHaveTextContent('Ativar a API');
  });
});
