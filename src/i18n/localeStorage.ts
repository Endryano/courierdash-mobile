import AsyncStorage from '@react-native-async-storage/async-storage';

import { localeStorageKey } from './locale';
import type { SupportedLocale } from './translations';

export function readPersistedLocale(): Promise<string | null> {
  return AsyncStorage.getItem(localeStorageKey);
}

export function persistLocale(locale: SupportedLocale): Promise<void> {
  return AsyncStorage.setItem(localeStorageKey, locale);
}
