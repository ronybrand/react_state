'use client';

import { useFrontendVersion } from '../../hooks/useFrontendVersion';
import { useBackendInfo } from '../../hooks/useBackendInfo';
import { formatDate } from '../../lib/formatDate';
import { useTranslation } from '../../i18n/TranslationProvider';

export function Footer() {
  const { lang, t } = useTranslation();
  const { data: frontendVersion } = useFrontendVersion();
  const { data: backendInfo } = useBackendInfo();

  if (!frontendVersion && !backendInfo) {
    return null;
  }

  return (
    <footer className="mt-4 py-3 text-center text-xs text-gray-600">
      {frontendVersion && (
        <span>
          {t('frontendVersion')} {frontendVersion.commit} ·{' '}
          {formatDate(frontendVersion.buildDate, lang)}
        </span>
      )}
      {frontendVersion && backendInfo && <span className="mx-2">|</span>}
      {backendInfo && (
        <span>
          {t('backendVersion')} {backendInfo.build.commit} ·{' '}
          {formatDate(backendInfo.build.time, lang)}
        </span>
      )}
    </footer>
  );
}
