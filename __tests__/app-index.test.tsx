import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import Index from '@/app/index';
import { LocalizationProvider } from '@/i18n/LocalizationProvider';
import { ThemeProvider } from '@/theme/ThemeProvider';

jest.mock('expo-localization', () => ({
  getLocales: () => [{ languageCode: 'uk' }],
}));

jest.mock('@react-native-async-storage/async-storage', () => {
  const mock = require('@react-native-async-storage/async-storage/jest/async-storage-mock');
  return mock;
});

describe('Index', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(AsyncStorage.getItem).mockResolvedValue(null);
  });

  test('renders the localized foundation screen', async () => {
    await render(
      <ThemeProvider>
        <LocalizationProvider>
          <Index />
        </LocalizationProvider>
      </ThemeProvider>,
    );

    expect(screen.getByText('CourierDash Mobile')).toBeTruthy();
    expect(await screen.findByText('Основу теми та локалізації підготовлено.')).toBeTruthy();
  });
});
