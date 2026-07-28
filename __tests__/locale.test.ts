import { describe, expect, test } from '@jest/globals';

import { resolveInitialLocale, resolveLocale } from '@/i18n/locale';
import { translations } from '@/i18n/translations';

describe('resolveLocale', () => {
  test('uses a persisted supported locale before device locales', () => {
    expect(resolveLocale('uk', ['en', 'pl'])).toBe('uk');
  });

  test('ignores an invalid persisted locale', () => {
    expect(resolveLocale('de', ['ru'])).toBe('ru');
  });

  test('finds a supported locale after an unsupported device locale', () => {
    expect(resolveLocale(null, ['de', 'en'])).toBe('en');
  });

  test('falls back to Polish for unsupported device locales', () => {
    expect(resolveLocale(null, ['de', 'fr'])).toBe('pl');
  });

  test('falls back when reading persisted locale fails', async () => {
    await expect(resolveInitialLocale(async () => Promise.reject(new Error('storage unavailable')), ['en'])).resolves.toBe(
      'en',
    );
  });
});

describe('translations', () => {
  test('uses the same keys for every supported locale', () => {
    const expectedKeys = Object.keys(translations.pl).sort();

    for (const dictionary of Object.values(translations)) {
      expect(Object.keys(dictionary).sort()).toEqual(expectedKeys);
    }
  });
});
