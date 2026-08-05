import { useSyncExternalStore } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

type AppStateSource = {
  addEventListener: (
    type: 'change',
    listener: (nextAppState: AppStateStatus) => void,
  ) => { remove: () => void };
};

type ForegroundDateStore = {
  getSnapshot: () => Date;
  subscribe: (listener: () => void) => () => void;
};

function localDateIdentity(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function createForegroundDateStore(
  getCurrentDate: () => Date = () => new Date(),
  appState: AppStateSource = AppState,
): ForegroundDateStore {
  let referenceDate = getCurrentDate();
  let referenceDateIdentity = localDateIdentity(referenceDate);
  let subscription: { remove: () => void } | null = null;
  const listeners = new Set<() => void>();

  function refreshIfDateChanged() {
    const nextDate = getCurrentDate();
    const nextDateIdentity = localDateIdentity(nextDate);

    if (nextDateIdentity === referenceDateIdentity) return;

    referenceDate = nextDate;
    referenceDateIdentity = nextDateIdentity;
    listeners.forEach((listener) => listener());
  }

  function subscribe(listener: () => void): () => void {
    listeners.add(listener);

    if (subscription === null) {
      refreshIfDateChanged();
      subscription = appState.addEventListener('change', (nextAppState) => {
        if (nextAppState === 'active') refreshIfDateChanged();
      });
    }

    return () => {
      listeners.delete(listener);

      if (listeners.size === 0) {
        subscription?.remove();
        subscription = null;
      }
    };
  }

  return { getSnapshot: () => referenceDate, subscribe };
}

const foregroundDateStore = createForegroundDateStore();

export function useForegroundDate(): Date {
  return useSyncExternalStore(
    foregroundDateStore.subscribe,
    foregroundDateStore.getSnapshot,
    foregroundDateStore.getSnapshot,
  );
}
