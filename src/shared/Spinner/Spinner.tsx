'use client';

import { useTranslation } from '../../i18n/TranslationProvider';

export function Spinner() {
  const { t } = useTranslation();
  return (
    <div role="status" className="flex justify-center py-4">
      <div className="border-brand h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
      <span className="sr-only">{t('loading')}</span>
    </div>
  );
}
