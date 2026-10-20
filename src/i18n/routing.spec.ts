import { routing } from './routing';
import enMessages from '../messages/en.json';
import ptMessages from '../messages/pt.json';

function messagePaths(value: object, prefix = ''): string[] {
  return Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof child === 'object' && child !== null ? messagePaths(child, path) : [path];
  });
}

describe('locale routing', () => {
  it('requires a locale prefix and defaults unprefixed routes to English', () => {
    expect(routing.locales).toEqual(['en', 'pt']);
    expect(routing.defaultLocale).toBe('en');
    expect(routing.localePrefix).toBe('always');
    expect(routing.localeDetection).toBe(false);
  });

  it('keeps the supported message catalogs structurally aligned', () => {
    expect(messagePaths(ptMessages).sort()).toEqual(messagePaths(enMessages).sort());
  });
});
