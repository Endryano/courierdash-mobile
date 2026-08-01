import { getLocales } from 'expo-localization';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { resolveSupportedLocale } from './locale';
import { translations, type SupportedLocale, type TranslationKey } from './translations';

type LocalizationContextValue = {
  isReady: boolean;
  locale: SupportedLocale;
  t: (key: TranslationKey) => string;
};

const LocalizationContext = createContext<LocalizationContextValue | null>(null);

export function LocalizationProvider({ children }: PropsWithChildren) {
  const [locale, setCurrentLocale] = useState<SupportedLocale>(() => resolveSupportedLocale(getLocales()));
  const localeRef = useRef(locale);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        const nextLocale = resolveSupportedLocale(getLocales());

        if (localeRef.current !== nextLocale) {
          localeRef.current = nextLocale;
          setCurrentLocale(nextLocale);
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const value = useMemo<LocalizationContextValue>(
    () => ({
      isReady: true,
      locale,
      t(key) {
        return translations[locale][key];
      },
    }),
    [locale],
  );

  return <LocalizationContext.Provider value={value}>{children}</LocalizationContext.Provider>;
}

export function useLocalization(): LocalizationContextValue {
  const localization = useContext(LocalizationContext);

  if (localization === null) {
    throw new Error('useLocalization must be used within LocalizationProvider');
  }

  return localization;
}
