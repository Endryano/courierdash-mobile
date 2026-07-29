import { AppState, type AppStateStatus } from 'react-native';

type AutoRefreshAuth = {
  startAutoRefresh: () => void;
  stopAutoRefresh: () => void;
};

type AppStateSource = {
  currentState: AppStateStatus;
  addEventListener: (
    type: 'change',
    listener: (nextAppState: AppStateStatus) => void,
  ) => { remove: () => void };
};

export function subscribeToAppStateAutoRefresh(
  auth: AutoRefreshAuth,
  appState: AppStateSource = AppState,
): () => void {
  function handleAppStateChange(nextAppState: AppStateStatus) {
    if (nextAppState === 'active') {
      auth.startAutoRefresh();
      return;
    }

    auth.stopAutoRefresh();
  }

  if (appState.currentState === 'active') {
    auth.startAutoRefresh();
  } else {
    auth.stopAutoRefresh();
  }

  const subscription = appState.addEventListener('change', handleAppStateChange);

  return () => {
    subscription.remove();
  };
}
