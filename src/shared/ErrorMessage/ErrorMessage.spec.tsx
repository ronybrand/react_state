import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { API_UNAVAILABLE_MESSAGE, startApiUrl } from '../../lib/apiErrorMessage';
import { ErrorMessage } from './ErrorMessage';
import enMessages from '../../messages/en.json';
import ptMessages from '../../messages/pt.json';

function errorMessage(
  message: string | null,
  requestId: string | null,
  locale: 'en' | 'pt' = 'en',
) {
  const messages = locale === 'pt' ? ptMessages : enMessages;
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ErrorMessage error={message} requestId={requestId} />
    </NextIntlClientProvider>
  );
}

describe('ErrorMessage', () => {
  it('renders nothing when there is no error', () => {
    const { container } = render(errorMessage(null, null));

    expect(container).toBeEmptyDOMElement();
  });

  it('renders the message in role="alert" with aria-live assertive', () => {
    render(errorMessage('Failed to fetch states.', null));

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Failed to fetch states.');
    expect(alert).toHaveAttribute('aria-live', 'assertive');
  });

  it('shows the reference ID when provided', () => {
    render(errorMessage('Failed to fetch states.', 'abc-123'));

    expect(screen.getByText(/Reference ID: abc-123/)).toBeInTheDocument();
  });

  it('does not show a reference ID when absent', () => {
    render(errorMessage('Failed to fetch states.', null));

    expect(screen.queryByText(/Reference ID/)).not.toBeInTheDocument();
  });

  it('offers the turn-on link only when the API is unavailable', () => {
    const { rerender } = render(errorMessage(API_UNAVAILABLE_MESSAGE, null));

    const link = screen.getByRole('link', { name: 'Turn on the API' });
    expect(link).toHaveAttribute('href', startApiUrl(window.location.href));
    expect(link.getAttribute('href')).toContain(
      'lang=en&back=' + encodeURIComponent(window.location.href),
    );
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');

    rerender(errorMessage('Failed to fetch states.', null));

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('localizes the API startup message and link using the route locale', () => {
    render(errorMessage(API_UNAVAILABLE_MESSAGE, null, 'pt'));

    const link = screen.getByRole('link', { name: 'Ativar a API' });
    expect(link).toHaveAttribute('href', startApiUrl(window.location.href, 'pt'));
    expect(link).toHaveTextContent('Ativar a API');
  });
});
