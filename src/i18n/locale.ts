import { defaultLocale, supportedLocales, type SupportedLocale } from './translations';

export const localeStorageKey = 'courierdash.locale.v1';

export function isSupportedLocale(value: unknown): value is SupportedLocale {
  return typeof value === 'string' && supportedLocales.includes(value as SupportedLocale);
}

export function resolveLocale(
  persistedLocale: unknown,
  deviceLocaleCodes: readonly (string | null | undefined)[],
): SupportedLocale {
  if (isSupportedLocale(persistedLocale)) {
    return persistedLocale;
  }

  const deviceLocale = deviceLocaleCodes.find(isSupportedLocale);

  return deviceLocale ?? defaultLocale;
}

export async function resolveInitialLocale(
  readPersistedLocale: () => Promise<string | null>,
  deviceLocaleCodes: readonly (string | null | undefined)[],
): Promise<SupportedLocale> {
  try {
    return resolveLocale(await readPersistedLocale(), deviceLocaleCodes);
  } catch {
    return resolveLocale(null, deviceLocaleCodes);
  }
}
