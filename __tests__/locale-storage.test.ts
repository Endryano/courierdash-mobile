import { beforeEach, describe, expect, jest, test } from '@jest/globals';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import AsyncStorage from '@react-native-async-storage/async-storage';

import { localeStorageKey } from '@/i18n/locale';
import { persistLocale } from '@/i18n/localeStorage';

describe('persistLocale', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(AsyncStorage.setItem).mockResolvedValue();
  });

  test('saves the changed locale using the versioned storage key', async () => {
    const setItem = jest.mocked(AsyncStorage.setItem);

    await persistLocale('en');

    expect(setItem).toHaveBeenCalledWith(localeStorageKey, 'en');
  });
});
