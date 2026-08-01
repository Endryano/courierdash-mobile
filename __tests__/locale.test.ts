import { describe, expect, test } from '@jest/globals';

import { resolveSupportedLocale } from '@/i18n/locale';
import { translations } from '@/i18n/translations';

describe('resolveSupportedLocale', () => {
  test.each([
    [{ languageCode: 'pl' }, 'pl'],
    [{ languageCode: 'pl-PL' }, 'pl'],
    [{ languageCode: 'uk' }, 'uk'],
    [{ languageCode: 'uk-UA' }, 'uk'],
    [{ languageCode: 'en-US' }, 'en'],
    [{ languageCode: 'en-GB' }, 'en'],
    [{ languageCode: 'ru-RU' }, 'ru'],
  ])('resolves %o to %s', (locale, expected) => {
    expect(resolveSupportedLocale([locale])).toBe(expected);
  });

  test('selects the first supported locale after unsupported entries', () => {
    expect(resolveSupportedLocale([{ languageCode: 'de-DE' }, { languageCode: 'en-US' }])).toBe('en');
  });

  test('uses the language tag when language code is unavailable', () => {
    expect(resolveSupportedLocale([{ languageCode: null, languageTag: 'uk-UA' }])).toBe('uk');
  });

  test('skips missing language codes and falls back to Polish', () => {
    expect(resolveSupportedLocale([{ languageCode: null }, {}, { languageCode: 'fr-FR' }])).toBe('pl');
    expect(resolveSupportedLocale([])).toBe('pl');
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
