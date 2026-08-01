import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import { act, render, screen } from '@testing-library/react-native';
import { AppState, Text } from 'react-native';

const mockGetLocales = jest.fn();
const mockStorageGetItem = jest.fn();
const mockStorageSetItem = jest.fn();
const mockRemove = jest.fn();
const mockAddEventListener = jest.fn();
let appStateListener: ((state: string) => void) | undefined;
let renderCount = 0;
let contextValue: Record<string, unknown> | undefined;

jest.mock('expo-localization', () => ({ getLocales: mockGetLocales }));
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: mockStorageGetItem,
  setItem: mockStorageSetItem,
}));

const { LocalizationProvider, useLocalization } = require('@/i18n/LocalizationProvider') as typeof import('@/i18n/LocalizationProvider');

function Probe() {
  const localization = useLocalization();
  renderCount += 1;
  contextValue = localization;

  return <Text testID="locale-probe">{`${localization.locale}:${localization.t('work.create.title')}`}</Text>;
}

describe('LocalizationProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    renderCount = 0;
    contextValue = undefined;
    appStateListener = undefined;
    mockGetLocales.mockReturnValue([{ languageCode: 'en-US' }]);
    mockAddEventListener.mockImplementation((...args: unknown[]) => {
      appStateListener = args[1] as (state: string) => void;
      return { remove: mockRemove };
    });
    jest.spyOn(AppState, 'addEventListener').mockImplementation(mockAddEventListener as typeof AppState.addEventListener);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('initializes from the system locale and does not expose a production locale setter', async () => {
    await render(<LocalizationProvider><Probe /></LocalizationProvider>);

    expect(screen.getByTestId('locale-probe').children[0]).toMatch(/^en:/);
    expect(contextValue).not.toHaveProperty('setLocale');
    expect(mockGetLocales).toHaveBeenCalledTimes(1);
    expect(mockStorageGetItem).not.toHaveBeenCalled();
    expect(mockStorageSetItem).not.toHaveBeenCalled();
  });

  test('synchronizes a changed system locale on active', async () => {
    await render(<LocalizationProvider><Probe /></LocalizationProvider>);
    mockGetLocales.mockReturnValue([{ languageCode: 'uk-UA' }]);

    await act(async () => { appStateListener?.('active'); });

    expect(screen.getByTestId('locale-probe').children[0]).toMatch(/^uk:/);
    expect(mockGetLocales).toHaveBeenCalledTimes(2);
  });

  test('does not update context when the system locale is unchanged', async () => {
    await render(<LocalizationProvider><Probe /></LocalizationProvider>);
    const initialRenderCount = renderCount;

    await act(async () => { appStateListener?.('active'); });

    expect(renderCount).toBe(initialRenderCount);
    expect(mockGetLocales).toHaveBeenCalledTimes(2);
  });

  test('cleans up the single AppState subscription', async () => {
    const view = await render(<LocalizationProvider><Probe /></LocalizationProvider>);

    await act(async () => { view.unmount(); });

    expect(mockAddEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    expect(mockAddEventListener).toHaveBeenCalledTimes(1);
    expect(mockRemove).toHaveBeenCalledTimes(1);
  });
});
