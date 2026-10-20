'use client';

import { useFrontendVersion } from '../../hooks/useFrontendVersion';
import { useBackendInfo } from '../../hooks/useBackendInfo';
import { formatDate } from '../../lib/formatDate';
import { useLocale, useTranslations } from 'next-intl';

export function Footer() {
  const locale = useLocale();
  const t = useTranslations();
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
          {formatDate(frontendVersion.buildDate, locale)}
        </span>
      )}
      {frontendVersion && backendInfo && <span className="mx-2">|</span>}
      {backendInfo && (
        <span>
          {t('backendVersion')} {backendInfo.build.commit} ·{' '}
          {formatDate(backendInfo.build.time, locale)}
        </span>
      )}
    </footer>
  );
}
