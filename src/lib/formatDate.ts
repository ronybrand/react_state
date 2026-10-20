import type { Lang } from '../i18n/TranslationProvider';

const options: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: true,
};

export function formatDate(iso: string | null | undefined, lang: Lang = 'en'): string {
  if (!iso) {
    return '-';
  }
  return new Intl.DateTimeFormat(lang === 'pt' ? 'pt-BR' : 'en-US', options).format(new Date(iso));
}
