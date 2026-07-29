import { describe, expect, jest, test } from '@jest/globals';
import type { AppStateStatus } from 'react-native';

import { subscribeToAppStateAutoRefresh } from '@/features/auth/sessionLifecycle';

function createAppStateSource(initialState: AppStateStatus) {
  let listener: ((nextAppState: AppStateStatus) => void) | undefined;
  const remove = jest.fn();

  return {
    source: {
      currentState: initialState,
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

describe('subscribeToAppStateAutoRefresh', () => {
  test('starts on active and stops on background or inactive', () => {
    const auth = { startAutoRefresh: jest.fn(), stopAutoRefresh: jest.fn() };
    const appState = createAppStateSource('active');

    const cleanup = subscribeToAppStateAutoRefresh(auth, appState.source);

    expect(auth.startAutoRefresh).toHaveBeenCalledTimes(1);
    appState.emit('background');
    appState.emit('inactive');
    appState.emit('active');

    expect(auth.stopAutoRefresh).toHaveBeenCalledTimes(2);
    expect(auth.startAutoRefresh).toHaveBeenCalledTimes(2);

    cleanup();
    expect(appState.remove).toHaveBeenCalledTimes(1);
  });

  test('stops auto refresh when the initial AppState is background', () => {
    const auth = { startAutoRefresh: jest.fn(), stopAutoRefresh: jest.fn() };
    const appState = createAppStateSource('background');

    const cleanup = subscribeToAppStateAutoRefresh(auth, appState.source);

    expect(auth.startAutoRefresh).not.toHaveBeenCalled();
    expect(auth.stopAutoRefresh).toHaveBeenCalledTimes(1);

    cleanup();
  });
});
