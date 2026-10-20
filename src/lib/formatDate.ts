import type { Locale } from '../i18n/routing';

const options: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
};

export function formatDate(iso: string | null | undefined, locale: Locale = 'en'): string {
  if (!iso) {
    return '-';
  }
  return new Intl.DateTimeFormat(locale === 'pt' ? 'pt-BR' : 'en-US', options).format(
    new Date(iso),
  );
}
