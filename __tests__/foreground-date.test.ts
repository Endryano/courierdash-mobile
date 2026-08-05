import { describe, expect, jest, test } from '@jest/globals';
import type { AppStateStatus } from 'react-native';

import { createForegroundDateStore } from '@/lib/lifecycle/foregroundDate';

function createAppStateSource() {
  let listener: ((nextAppState: AppStateStatus) => void) | undefined;
  const remove = jest.fn();

  return {
    source: {
      addEventListener: jest.fn((_type: 'change', nextListener: (nextAppState: AppStateStatus) => void) => {
        listener = nextListener;
        return { remove };
      }),
    },
    emit(nextAppState: AppStateStatus) {
      listener?.(nextAppState);
    },
    remove,
  };
}

describe('createForegroundDateStore', () => {
  test('initializes from the current local date and ignores same-date foreground events', () => {
    let currentDate = new Date(2026, 6, 29, 12);
    const appState = createAppStateSource();
    const store = createForegroundDateStore(() => currentDate, appState.source);
    const listener = jest.fn();
    const cleanup = store.subscribe(listener);

    expect(store.getSnapshot()).toBe(currentDate);
    currentDate = new Date(2026, 6, 29, 23, 59);
    appState.emit('active');

    expect(listener).not.toHaveBeenCalled();
    expect(store.getSnapshot().getHours()).toBe(12);
    cleanup();
    expect(appState.remove).toHaveBeenCalledTimes(1);
  });

  test.each([
    [new Date(2026, 6, 31, 23, 59), new Date(2026, 7, 1, 0, 1)],
    [new Date(2026, 11, 31, 23, 59), new Date(2027, 0, 1, 0, 1)],
    [new Date(2028, 1, 28, 23, 59), new Date(2028, 1, 29, 0, 1)],
  ])('updates on a local calendar boundary', (initialDate, nextDate) => {
    let currentDate = initialDate;
    const appState = createAppStateSource();
    const store = createForegroundDateStore(() => currentDate, appState.source);
    const listener = jest.fn();
    const cleanup = store.subscribe(listener);

    currentDate = nextDate;
    appState.emit('active');

    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.getSnapshot()).toBe(nextDate);
    cleanup();
  });

  test('uses local calendar identity rather than timestamp equality', () => {
    const firstDate = {
      getFullYear: () => 2026,
      getMonth: () => 6,
      getDate: () => 29,
      getTime: () => 1,
    } as unknown as Date;
    const sameLocalDate = {
      getFullYear: () => 2026,
      getMonth: () => 6,
      getDate: () => 29,
      getTime: () => 2,
    } as unknown as Date;
    let currentDate = firstDate;
    const appState = createAppStateSource();
    const store = createForegroundDateStore(() => currentDate, appState.source);
    const listener = jest.fn();
    const cleanup = store.subscribe(listener);

    currentDate = sameLocalDate;
    appState.emit('active');

    expect(listener).not.toHaveBeenCalled();
    expect(store.getSnapshot()).toBe(firstDate);
    cleanup();
  });

  test('shares one AppState subscription and cleans it up after the final listener', () => {
    const appState = createAppStateSource();
    const store = createForegroundDateStore(() => new Date(2026, 6, 29, 12), appState.source);
    const firstCleanup = store.subscribe(jest.fn());
    const secondCleanup = store.subscribe(jest.fn());

    expect(appState.source.addEventListener).toHaveBeenCalledTimes(1);
    firstCleanup();
    expect(appState.remove).not.toHaveBeenCalled();
    secondCleanup();
    expect(appState.remove).toHaveBeenCalledTimes(1);
  });
});
