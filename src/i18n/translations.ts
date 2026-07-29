export type SupportedLocale = 'pl' | 'uk' | 'en' | 'ru';
export type TranslationKey =
  | 'foundation.title'
  | 'foundation.description'
  | 'foundation.languageLabel'
  | 'language.pl'
  | 'language.uk'
  | 'language.en'
  | 'language.ru'
  | 'auth.loginTitle' | 'auth.signupTitle' | 'auth.email' | 'auth.password' | 'auth.confirmPassword' | 'auth.login' | 'auth.signup' | 'auth.goToLogin' | 'auth.goToSignup' | 'auth.loading' | 'auth.required' | 'auth.invalidEmail' | 'auth.passwordMismatch' | 'auth.confirmEmail' | 'auth.signedUp' | 'auth.error.generic' | 'auth.error.invalidCredentials' | 'auth.error.accountExists' | 'auth.error.rateLimit' | 'auth.error.network' | 'auth.error.weakPassword';

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
    'auth.loginTitle': 'Zaloguj się', 'auth.signupTitle': 'Utwórz konto', 'auth.email': 'Email', 'auth.password': 'Hasło', 'auth.confirmPassword': 'Potwierdź hasło', 'auth.login': 'Zaloguj się', 'auth.signup': 'Zarejestruj się', 'auth.goToLogin': 'Masz konto? Zaloguj się', 'auth.goToSignup': 'Nie masz konta? Zarejestruj się', 'auth.loading': 'Ładowanie…', 'auth.required': 'To pole jest wymagane.', 'auth.invalidEmail': 'Wprowadź prawidłowy email.', 'auth.passwordMismatch': 'Hasła nie są takie same.', 'auth.confirmEmail': 'Sprawdź email, aby dokończyć rejestrację.', 'auth.signedUp': 'Rejestracja zakończona.', 'auth.error.generic': 'Nie udało się wykonać operacji. Spróbuj ponownie.', 'auth.error.invalidCredentials': 'Nieprawidłowy email lub hasło.', 'auth.error.accountExists': 'Konto już istnieje.', 'auth.error.rateLimit': 'Zbyt wiele prób. Spróbuj później.', 'auth.error.network': 'Sieć jest niedostępna. Spróbuj ponownie.', 'auth.error.weakPassword': 'Hasło nie spełnia wymagań.',
  },
  uk: {
    'foundation.title': 'CourierDash Mobile',
    'foundation.description': 'Основу теми та локалізації підготовлено.',
    'foundation.languageLabel': 'Мова',
    'language.pl': 'Polski',
    'language.uk': 'Українська',
    'language.en': 'English',
    'language.ru': 'Русский',
    'auth.loginTitle': 'Вхід', 'auth.signupTitle': 'Створити акаунт', 'auth.email': 'Електронна пошта', 'auth.password': 'Пароль', 'auth.confirmPassword': 'Підтвердьте пароль', 'auth.login': 'Увійти', 'auth.signup': 'Зареєструватися', 'auth.goToLogin': 'Вже маєте акаунт? Увійдіть', 'auth.goToSignup': 'Немає акаунта? Зареєструйтеся', 'auth.loading': 'Завантаження…', 'auth.required': 'Поле обов’язкове.', 'auth.invalidEmail': 'Введіть коректну пошту.', 'auth.passwordMismatch': 'Паролі не збігаються.', 'auth.confirmEmail': 'Перевірте пошту, щоб завершити реєстрацію.', 'auth.signedUp': 'Реєстрацію завершено.', 'auth.error.generic': 'Не вдалося виконати операцію. Спробуйте ще раз.', 'auth.error.invalidCredentials': 'Неправильна пошта або пароль.', 'auth.error.accountExists': 'Акаунт уже існує.', 'auth.error.rateLimit': 'Забагато спроб. Спробуйте пізніше.', 'auth.error.network': 'Мережа недоступна. Спробуйте ще раз.', 'auth.error.weakPassword': 'Пароль не відповідає вимогам.',
  },
  en: {
    'foundation.title': 'CourierDash Mobile',
    'foundation.description': 'Theme and localization foundation is ready.',
    'foundation.languageLabel': 'Language',
    'language.pl': 'Polski',
    'language.uk': 'Українська',
    'language.en': 'English',
    'language.ru': 'Русский',
    'auth.loginTitle': 'Sign in', 'auth.signupTitle': 'Create account', 'auth.email': 'Email', 'auth.password': 'Password', 'auth.confirmPassword': 'Confirm password', 'auth.login': 'Sign in', 'auth.signup': 'Sign up', 'auth.goToLogin': 'Have an account? Sign in', 'auth.goToSignup': 'Need an account? Sign up', 'auth.loading': 'Loading…', 'auth.required': 'This field is required.', 'auth.invalidEmail': 'Enter a valid email.', 'auth.passwordMismatch': 'Passwords do not match.', 'auth.confirmEmail': 'Check your email to complete registration.', 'auth.signedUp': 'Registration completed.', 'auth.error.generic': 'Unable to complete the operation. Try again.', 'auth.error.invalidCredentials': 'Invalid email or password.', 'auth.error.accountExists': 'An account already exists.', 'auth.error.rateLimit': 'Too many attempts. Try later.', 'auth.error.network': 'Network unavailable. Try again.', 'auth.error.weakPassword': 'Password does not meet requirements.',
  },
  ru: {
    'foundation.title': 'CourierDash Mobile',
    'foundation.description': 'Основа темы и локализации готова.',
    'foundation.languageLabel': 'Язык',
    'language.pl': 'Polski',
    'language.uk': 'Українська',
    'language.en': 'English',
    'language.ru': 'Русский',
    'auth.loginTitle': 'Вход', 'auth.signupTitle': 'Создать аккаунт', 'auth.email': 'Электронная почта', 'auth.password': 'Пароль', 'auth.confirmPassword': 'Подтвердите пароль', 'auth.login': 'Войти', 'auth.signup': 'Зарегистрироваться', 'auth.goToLogin': 'Уже есть аккаунт? Войдите', 'auth.goToSignup': 'Нет аккаунта? Зарегистрируйтесь', 'auth.loading': 'Загрузка…', 'auth.required': 'Поле обязательно.', 'auth.invalidEmail': 'Введите корректную почту.', 'auth.passwordMismatch': 'Пароли не совпадают.', 'auth.confirmEmail': 'Проверьте почту, чтобы завершить регистрацию.', 'auth.signedUp': 'Регистрация завершена.', 'auth.error.generic': 'Не удалось выполнить операцию. Попробуйте ещё раз.', 'auth.error.invalidCredentials': 'Неверная почта или пароль.', 'auth.error.accountExists': 'Аккаунт уже существует.', 'auth.error.rateLimit': 'Слишком много попыток. Попробуйте позже.', 'auth.error.network': 'Сеть недоступна. Попробуйте ещё раз.', 'auth.error.weakPassword': 'Пароль не соответствует требованиям.',
  },
} as const satisfies Record<SupportedLocale, TranslationDictionary>;
