export type SupportedLocale = 'pl' | 'uk' | 'en' | 'ru';
export type TranslationKey =
  | 'foundation.title'
  | 'foundation.description'
  | 'foundation.languageLabel'
  | 'language.pl'
  | 'language.uk'
  | 'language.en'
  | 'language.ru';

type TranslationDictionary = Record<TranslationKey, string>;

export const supportedLocales: readonly SupportedLocale[] = ['pl', 'uk', 'en', 'ru'];
export const defaultLocale: SupportedLocale = 'pl';

export const translations = {
  pl: {
    'foundation.title': 'CourierDash Mobile',
    'foundation.description': 'Podstawa motywu i lokalizacji jest gotowa.',
    'foundation.languageLabel': 'Język',
    'language.pl': 'Polski',
    'language.uk': 'Українська',
    'language.en': 'English',
    'language.ru': 'Русский',
  },
  uk: {
    'foundation.title': 'CourierDash Mobile',
    'foundation.description': 'Основу теми та локалізації підготовлено.',
    'foundation.languageLabel': 'Мова',
    'language.pl': 'Polski',
    'language.uk': 'Українська',
    'language.en': 'English',
    'language.ru': 'Русский',
  },
  en: {
    'foundation.title': 'CourierDash Mobile',
    'foundation.description': 'Theme and localization foundation is ready.',
    'foundation.languageLabel': 'Language',
    'language.pl': 'Polski',
    'language.uk': 'Українська',
    'language.en': 'English',
    'language.ru': 'Русский',
  },
  ru: {
    'foundation.title': 'CourierDash Mobile',
    'foundation.description': 'Основа темы и локализации готова.',
    'foundation.languageLabel': 'Язык',
    'language.pl': 'Polski',
    'language.uk': 'Українська',
    'language.en': 'English',
    'language.ru': 'Русский',
  },
} as const satisfies Record<SupportedLocale, TranslationDictionary>;
