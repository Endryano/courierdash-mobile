import { defaultLocale, supportedLocales, type SupportedLocale } from './translations';

export type LocaleLike = {
  languageCode?: string | null;
  languageTag?: string | null;
};

function toLanguageCode(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null;

  const languageCode = value.trim().split(/[-_]/)[0]?.toLowerCase();
  return languageCode === undefined || languageCode === '' ? null : languageCode;
}

export function resolveSupportedLocale(locales: readonly LocaleLike[]): SupportedLocale {
  for (const locale of locales) {
    const languageCode = toLanguageCode(locale.languageCode) ?? toLanguageCode(locale.languageTag);

    if (languageCode !== null && supportedLocales.includes(languageCode as SupportedLocale)) {
      return languageCode as SupportedLocale;
    }
  }

  return defaultLocale;
}
