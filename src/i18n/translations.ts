export type SupportedLocale = 'pl' | 'uk' | 'en' | 'ru';
export type TranslationKey =
  | 'foundation.title'
  | 'foundation.description'
  | 'foundation.languageLabel'
  | 'language.pl'
  | 'language.uk'
  | 'language.en'
  | 'language.ru'
  | 'auth.loginTitle' | 'auth.signupTitle' | 'auth.email' | 'auth.password' | 'auth.confirmPassword' | 'auth.login' | 'auth.signup' | 'auth.goToLogin' | 'auth.goToSignup' | 'auth.loading' | 'auth.required' | 'auth.invalidEmail' | 'auth.passwordMismatch' | 'auth.confirmEmail' | 'auth.signedUp' | 'auth.error.generic' | 'auth.error.invalidCredentials' | 'auth.error.accountExists' | 'auth.error.rateLimit' | 'auth.error.network' | 'auth.error.weakPassword'
  | 'profile.nickname.title' | 'profile.nickname.description' | 'profile.nickname.label' | 'profile.nickname.save' | 'profile.nickname.saving' | 'profile.nickname.error.required' | 'profile.nickname.error.tooShort' | 'profile.nickname.error.tooLong' | 'profile.nickname.error.invalidCharacters' | 'profile.nickname.error.conflict' | 'profile.nickname.error.network' | 'profile.nickname.error.forbidden' | 'profile.nickname.error.unknown'
  | 'navigation.loading' | 'navigation.profileError.title' | 'navigation.profileError.description' | 'navigation.blocked.title' | 'navigation.blocked.description' | 'navigation.retry' | 'navigation.retrying' | 'app.placeholder.title' | 'app.placeholder.nickname'
  | 'work.loading' | 'work.empty.title' | 'work.empty.description' | 'work.list.title' | 'work.shift.hours' | 'work.shift.km' | 'work.error.title' | 'work.error.description' | 'work.blocked.title' | 'work.blocked.description' | 'work.retry';

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
    'profile.nickname.title': 'Wybierz nazwę użytkownika', 'profile.nickname.description': 'Pomoże ona dokończyć konfigurację profilu.', 'profile.nickname.label': 'Nazwa użytkownika', 'profile.nickname.save': 'Zapisz', 'profile.nickname.saving': 'Zapisywanie…', 'profile.nickname.error.required': 'Wpisz nazwę użytkownika.', 'profile.nickname.error.tooShort': 'Nazwa musi mieć co najmniej 3 znaki.', 'profile.nickname.error.tooLong': 'Nazwa może mieć maksymalnie 15 znaków.', 'profile.nickname.error.invalidCharacters': 'Użyj tylko liter ASCII, cyfr lub podkreślenia.', 'profile.nickname.error.conflict': 'Ta nazwa użytkownika jest już zajęta.', 'profile.nickname.error.network': 'Sieć jest niedostępna. Spróbuj ponownie.', 'profile.nickname.error.forbidden': 'Nie masz uprawnień do zapisania nazwy.', 'profile.nickname.error.unknown': 'Nie udało się zapisać nazwy. Spróbuj ponownie.',
    'navigation.loading': 'Ładowanie…', 'navigation.profileError.title': 'Nie udało się załadować profilu', 'navigation.profileError.description': 'Spróbuj ponownie.', 'navigation.blocked.title': 'Profil jest tymczasowo niedostępny', 'navigation.blocked.description': 'Spróbuj ponownie później.', 'navigation.retry': 'Spróbuj ponownie', 'navigation.retrying': 'Ponawianie…', 'app.placeholder.title': 'Aplikacja kuriera', 'app.placeholder.nickname': 'Witaj.',
    'work.loading': 'Ładowanie zmian…', 'work.empty.title': 'Brak zmian', 'work.empty.description': 'Nie ma jeszcze zapisanych zmian.', 'work.list.title': 'Zmiany', 'work.shift.hours': 'Godziny', 'work.shift.km': 'Kilometry', 'work.error.title': 'Nie udało się załadować zmian', 'work.error.description': 'Spróbuj ponownie.', 'work.blocked.title': 'Zmiany są tymczasowo niedostępne', 'work.blocked.description': 'Spróbuj ponownie później.', 'work.retry': 'Spróbuj ponownie',
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
    'profile.nickname.title': 'Оберіть нікнейм', 'profile.nickname.description': 'Він буде використаний у вашому профілі.', 'profile.nickname.label': 'Нікнейм', 'profile.nickname.save': 'Зберегти', 'profile.nickname.saving': 'Збереження…', 'profile.nickname.error.required': 'Введіть нікнейм.', 'profile.nickname.error.tooShort': 'Нікнейм має містити щонайменше 3 символи.', 'profile.nickname.error.tooLong': 'Нікнейм може містити не більше 15 символів.', 'profile.nickname.error.invalidCharacters': 'Використовуйте лише ASCII-літери, цифри або підкреслення.', 'profile.nickname.error.conflict': 'Цей нікнейм уже зайнятий.', 'profile.nickname.error.network': 'Мережа недоступна. Спробуйте ще раз.', 'profile.nickname.error.forbidden': 'Немає дозволу зберегти нікнейм.', 'profile.nickname.error.unknown': 'Не вдалося зберегти нікнейм. Спробуйте ще раз.',
    'navigation.loading': 'Завантаження…', 'navigation.profileError.title': 'Не вдалося завантажити профіль', 'navigation.profileError.description': 'Спробуйте ще раз.', 'navigation.blocked.title': 'Профіль тимчасово недоступний', 'navigation.blocked.description': 'Спробуйте пізніше.', 'navigation.retry': 'Спробувати ще раз', 'navigation.retrying': 'Повторна спроба…', 'app.placeholder.title': 'Застосунок кур’єра', 'app.placeholder.nickname': 'Вітаємо.',
    'work.loading': 'Завантаження змін…', 'work.empty.title': 'Змін немає', 'work.empty.description': 'Ще немає збережених змін.', 'work.list.title': 'Зміни', 'work.shift.hours': 'Години', 'work.shift.km': 'Кілометри', 'work.error.title': 'Не вдалося завантажити зміни', 'work.error.description': 'Спробуйте ще раз.', 'work.blocked.title': 'Зміни тимчасово недоступні', 'work.blocked.description': 'Спробуйте пізніше.', 'work.retry': 'Спробувати ще раз',
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
    'profile.nickname.title': 'Choose a nickname', 'profile.nickname.description': 'It will be used in your profile.', 'profile.nickname.label': 'Nickname', 'profile.nickname.save': 'Save nickname', 'profile.nickname.saving': 'Saving…', 'profile.nickname.error.required': 'Enter a nickname.', 'profile.nickname.error.tooShort': 'Nickname must contain at least 3 characters.', 'profile.nickname.error.tooLong': 'Nickname can contain at most 15 characters.', 'profile.nickname.error.invalidCharacters': 'Use only ASCII letters, numbers, or underscores.', 'profile.nickname.error.conflict': 'This nickname is already taken.', 'profile.nickname.error.network': 'Network unavailable. Try again.', 'profile.nickname.error.forbidden': 'You are not allowed to save this nickname.', 'profile.nickname.error.unknown': 'Unable to save nickname. Try again.',
    'navigation.loading': 'Loading…', 'navigation.profileError.title': 'Unable to load profile', 'navigation.profileError.description': 'Try again.', 'navigation.blocked.title': 'Profile is temporarily unavailable', 'navigation.blocked.description': 'Try again later.', 'navigation.retry': 'Retry', 'navigation.retrying': 'Retrying…', 'app.placeholder.title': 'Courier application', 'app.placeholder.nickname': 'Welcome.',
    'work.loading': 'Loading shifts…', 'work.empty.title': 'No shifts yet', 'work.empty.description': 'There are no saved shifts yet.', 'work.list.title': 'Shifts', 'work.shift.hours': 'Hours', 'work.shift.km': 'Kilometres', 'work.error.title': 'Unable to load shifts', 'work.error.description': 'Try again.', 'work.blocked.title': 'Shifts are temporarily unavailable', 'work.blocked.description': 'Try again later.', 'work.retry': 'Retry',
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
    'profile.nickname.title': 'Выберите никнейм', 'profile.nickname.description': 'Он будет использоваться в вашем профиле.', 'profile.nickname.label': 'Никнейм', 'profile.nickname.save': 'Сохранить', 'profile.nickname.saving': 'Сохранение…', 'profile.nickname.error.required': 'Введите никнейм.', 'profile.nickname.error.tooShort': 'Никнейм должен содержать не менее 3 символов.', 'profile.nickname.error.tooLong': 'Никнейм может содержать не более 15 символов.', 'profile.nickname.error.invalidCharacters': 'Используйте только ASCII-буквы, цифры или подчёркивание.', 'profile.nickname.error.conflict': 'Этот никнейм уже занят.', 'profile.nickname.error.network': 'Сеть недоступна. Попробуйте ещё раз.', 'profile.nickname.error.forbidden': 'Нет разрешения сохранить никнейм.', 'profile.nickname.error.unknown': 'Не удалось сохранить никнейм. Попробуйте ещё раз.',
    'navigation.loading': 'Загрузка…', 'navigation.profileError.title': 'Не удалось загрузить профиль', 'navigation.profileError.description': 'Попробуйте ещё раз.', 'navigation.blocked.title': 'Профиль временно недоступен', 'navigation.blocked.description': 'Попробуйте позже.', 'navigation.retry': 'Повторить', 'navigation.retrying': 'Повтор…', 'app.placeholder.title': 'Приложение курьера', 'app.placeholder.nickname': 'Добро пожаловать.',
    'work.loading': 'Загрузка смен…', 'work.empty.title': 'Смен пока нет', 'work.empty.description': 'Сохранённых смен пока нет.', 'work.list.title': 'Смены', 'work.shift.hours': 'Часы', 'work.shift.km': 'Километры', 'work.error.title': 'Не удалось загрузить смены', 'work.error.description': 'Попробуйте ещё раз.', 'work.blocked.title': 'Смены временно недоступны', 'work.blocked.description': 'Попробуйте позже.', 'work.retry': 'Повторить',
  },
} as const satisfies Record<SupportedLocale, TranslationDictionary>;
