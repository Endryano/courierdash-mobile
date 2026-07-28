# CourierDash Mobile — Project Context

_Оновлено: 2026-07-28_

## Призначення

CourierDash Mobile — нативний застосунок для кур'єрів у Польщі. Він має працювати з тим самим обліковим записом і Supabase backend, що й вебверсія, та дозволяти вносити завершені робочі зміни і переглядати статистику. Валюта MVP — PLN.

## Стан репозиторію

- **Фактично реалізоване:** Expo foundation у commit `d01058621745b2c3a0d6468c065ff29c380da955`: Expo `57.0.8`, React Native `0.86.0`, React `19.2.3`, Expo Router `57.0.8` і TypeScript `6.0.3`.
- **Структура foundation:** `src/app/` містить лише мінімальні routes `_layout.tsx` та `index.tsx`; tabs, auth, Supabase, theme, localization, tests і бізнес-логіка не реалізовані.
- **Перевірено:** `expo-doctor`, lint, Android export та iOS export успішні.
- **Не виконувалось:** реальний Android/iOS device test, remote Supabase audit, міграції та підключення до зовнішніх сервісів.

## Погоджений MVP

- Expo + React Native + TypeScript для Android та iOS.
- Email/password Sign Up і Sign In, захищені маршрути, безпечне збереження та оновлення сесії, logout.
- Email confirmation є обов'язковою, але її реалізація починається лише після окремого read-only аудиту production Supabase Auth.
- Onboarding входить у MVP, але не блокує foundation.
- Work: шість платформ — Uber, Wolt, Bolt, Glovo, Stuart, Other; дохід, orders, km, час, перерви, app tips, cash tips, bonuses; створення, редагування, видалення, історія та місячний перегляд.
- Brutto-only: місячні підсумки та графіки відображають погоджені Brutto показники.
- Annual Report входить у MVP і має виправити відомі проблеми вебагрегацій, а не відтворювати їх.
- Локалізації: `pl`, `uk`, `en`, `ru`; fallback — `pl`.
- Лише Dark Theme.

## Відкладено або поза MVP

- Garage.
- Expenses і transport rental.
- Netto, Tax та податкові формули.
- Password Recovery, Google Sign-In, Apple Sign-In.
- Light/system theme, push, GPS, offline queue/writes, subscriptions, account deletion, analytics/crash reporting — до окремого рішення.

## Технологічний напрям і принципи

- Native UX замість прямого перенесення Next.js, DOM, Tailwind чи browser API.
- Strict TypeScript; чисті domain calculations без React/Supabase залежностей; тести для критичних правил.
- UI-тексти та screen-reader labels локалізуються; dark design зберігає візуальну ідентичність вебпродукту.
- Навігація має бути native; остаточний bottom tabs layout ще не погоджений.
- Кожна велика функція виконується окремим перевірюваним етапом.

## Shared Supabase constraints

- Mobile використовує наявний shared backend і сумісну з вебом модель даних.
- Заборонені schema changes, migrations та remote-операції без окремого дозволу.
- Локальні schema snapshots не є доказом production state: до підключення потрібен read-only remote audit schema, RLS і Auth.
- Ніколи не використовувати `service_role`, серверні ключі або секрети в mobile client.
- Дані належать поточному користувачу; owner isolation та точне column mapping обов'язкові.

## Work rules, підтверджені для MVP

- Користувач вносить результат завершеної зміни; live shift, GPS і таймер не створюються.
- Усі від'ємні Work-значення заборонені.
- `start time = end time` означає `0` годин.
- Перерви, що перетинаються або лежать поза зміною, блокуються валідацією, без тихої нормалізації.
- Перерва повинна мати обидва значення start/end; напівзаповнену перерву не можна зберегти.
- Розрахована тривалість роботи не може бути від'ємною.
- Дата зміни — локальний календарний рядок `YYYY-MM-DD`, без UTC-конвертації.
- Тиждень: понеділок–неділя.

## Annual Report correctness

Перед UI необхідно зафіксувати й протестувати коректні агрегації: усі шість платформ, окремі назви Other, cash tips, всі orders, нульові значення без `NaN`/`Infinity`, динамічні роки та calendar-safe дати. Погоджені correctness fixes є canonical для mobile MVP. Якщо виправлений mobile result відрізняється від поточного вебрезультату на реальних даних, спосіб синхронізації або виправлення вебверсії погоджується окремо.

## Безпека та Git

- Не змінювати вебрепозиторій, вебдеплой або remote Supabase без окремої авторизації.
- Не комітити секрети; environment values не показувати і не фіксувати в документації.
- Працювати не в `main`; одна задача — один обмежений scope; commit, merge і push лише за явною командою.
- Рекомендована назва commit у roadmap або звіті не є дозволом виконувати commit.

## Ризики, залежності та відкриті рішення

- Read-only production Supabase audit дозволений, але ще не виконаний. До його завершення фактичні remote schema, RLS та Auth settings залишаються непідтвердженими.
- Потрібно погодити bottom tabs, launch flow після onboarding, Expo identifiers, мінімальні OS версії, assets/screenshot source of truth, chart library після Expo spike та beta/release policy.
- До calculation core слід зафіксувати повний перелік nullable/validation правил, якщо він відрізняється від технічного контракту вебверсії.
- Offline, legal/support, privacy/account deletion і diagnostics не входять у поточний scope та не повинні додаватися неявно.
