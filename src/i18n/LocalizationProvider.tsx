import { getLocales } from 'expo-localization';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

import { resolveInitialLocale } from './locale';
import { persistLocale, readPersistedLocale } from './localeStorage';
import { translations, type SupportedLocale, type TranslationKey } from './translations';

type LocalizationContextValue = {
  isReady: boolean;
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => Promise<void>;
  t: (key: TranslationKey) => string;
};

const LocalizationContext = createContext<LocalizationContextValue | null>(null);

export function LocalizationProvider({ children }: PropsWithChildren) {
  const [locale, setCurrentLocale] = useState<SupportedLocale>('pl');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      const deviceLocaleCodes = getLocales().map(({ languageCode }) => languageCode);
      const initialLocale = await resolveInitialLocale(readPersistedLocale, deviceLocaleCodes);

      if (isMounted) {
        setCurrentLocale(initialLocale);
        setIsReady(true);
      }
    }

    void bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo<LocalizationContextValue>(
    () => ({
      isReady,
      locale,
      async setLocale(nextLocale) {
        setCurrentLocale(nextLocale);

        try {
          await persistLocale(nextLocale);
        } catch {
          // Persistence failure must not prevent using the selected locale in this session.
        }
      },
      t(key) {
        return translations[locale][key];
      },
    }),
    [isReady, locale],
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
