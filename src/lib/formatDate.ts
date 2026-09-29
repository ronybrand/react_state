const formatter = new Intl.DateTimeFormat('en-US', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: true,
});

export function formatDate(iso: string | null | undefined): string {
  if (!iso) {
    return '-';
  }
  return formatter.format(new Date(iso));
}
