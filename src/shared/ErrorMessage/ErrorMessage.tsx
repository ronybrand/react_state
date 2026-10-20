'use client';

import { API_UNAVAILABLE_MESSAGE, startApiUrl } from '../../lib/apiErrorMessage';
import { translateKnownError, useTranslation } from '../../i18n/TranslationProvider';

interface ErrorMessageProps {
  error: string | null;
  requestId: string | null;
}

export function ErrorMessage({ error, requestId }: ErrorMessageProps) {
  const { lang, t } = useTranslation();
  if (!error) {
    return null;
  }

  const message =
    error === API_UNAVAILABLE_MESSAGE ? t('apiUnavailableMessage') : translateKnownError(error, t);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="border-danger bg-danger/10 text-danger mb-4 rounded border px-4 py-3"
    >
      {message}
      {error === API_UNAVAILABLE_MESSAGE && (
        <a
          href={startApiUrl(window.location.href, lang)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 block underline"
        >
          {t('startApiLink')}
        </a>
      )}
      {requestId && (
        <small className="mt-1 block text-gray-500">{t('referenceId', { id: requestId })}</small>
      )}
    </div>
  );
}
