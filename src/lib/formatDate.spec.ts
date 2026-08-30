import { formatDate } from './formatDate';

describe('formatDate', () => {
  it('formats an ISO string as mm/dd/yyyy hh:mm:ss in en-US', () => {
    expect(formatDate('2024-01-05T13:04:09Z')).toMatch(/^\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}:\d{2}$/);
  });

  it('respects the given date', () => {
    const result = formatDate('2024-03-20T00:00:00Z');

    expect(result.startsWith('03/20/2024') || result.startsWith('03/19/2024')).toBe(true);
  });

  it('returns a dash for a null or undefined date instead of the epoch', () => {
    expect(formatDate(null)).toBe('-');
    expect(formatDate(undefined)).toBe('-');
  });
});
