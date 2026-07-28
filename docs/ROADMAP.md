# CourierDash Mobile — Roadmap

_Оновлено: 2026-07-28. Статуси implementation-етапів не означають виконання._

| Етап | Статус | Результат |
| --- | --- | --- |
| 0. Documentation baseline | Завершено | Контекст, roadmap, рішення та поточна задача прийняті власником. |
| 1. Expo foundation | Заплановано | Ініціалізація TypeScript Expo у погодженому scope; без backend. |
| 2. Quality baseline | Заплановано | Strict TypeScript, ESLint, test runner і базові команди перевірки; formatter лише після окремого погодження. |
| 3. Theme and localization foundation | Заплановано | Dark tokens, доступні базові компоненти, `pl`/`uk`/`en`/`ru`, persisted locale. |
| 4. Supabase read-only audit | Заплановано | Перевірка production schema, RLS, Auth і contracts без жодної зміни remote state. |
| 5. Typed Supabase client | Заплановано | Типи, public client та безпечна конфігурація після audit. |
| 6. Auth foundation | Заплановано | Session lifecycle, secure persistence, protected navigation і logout. |
| 7. Sign In, Sign Up, email confirmation | Заплановано | Email/password flow та confirmation лише після Auth audit. |
| 8. Calculation core | Заплановано | Pure tested calculations: платформи, час, перерви, Brutto, averages, calendar rules. |
| 9. Work read-only dashboard | Заплановано | Місячні дані, історія, summaries, loading/error/empty, refresh. |
| 10. Work create/edit/delete | Заплановано | Валідовані форми, безпечні CRUD-операції й confirmation delete. |
| 11. Monthly Brutto summaries and charts | Заплановано | Brutto-only підсумки й chart UI після окремого compatibility spike. |
| 12. Annual Report correctness | Заплановано | Тести та коректні агрегації до створення mobile UI. |
| 13. Annual Report mobile UI | Заплановано | Summary, monthly records, platform breakdown, chart/text alternative. |
| 14. Onboarding | Заплановано | Короткий skip-able flow у погодженому launch UX. |
| 15. Hardening | Заплановано | Accessibility, loading/retry, session expiry, security, performance, error behavior. |
| 16. Android/iOS testing | Заплановано | Реальні пристрої, safe areas, keyboard, small/large screens, orientation policy. |
| 17. Beta readiness | Заплановано | Release checklist, privacy/legal inputs, assets, manual critical scenarios; без publish без дозволу. |

## Deferred scope

- Garage.
- Expenses, fuel expenses і transport rental.
- Netto, Tax і будь-які tax calculations/UI.
- Password Recovery, Google Sign-In, Apple Sign-In.
- Light/system theme.
- Offline cache/writes, sync queue, push, GPS, subscriptions, analytics/crash reporting, account deletion, store deployment.

## Gates before dependent work

- Етап 4 має бути завершений до typed client та email-confirmation implementation.
- Read-only Supabase audit уже дозволений і може виконуватися паралельно з foundation-етапами, але обов'язково має завершитися до typed Supabase client та email-confirmation implementation.
- Bottom tabs, app identifiers, assets, chart library і release policy не є вирішеними; вони потребують окремого погодження до відповідних етапів.
- Будь-які schema/RLS/migration зміни мають бути окремою задачею після read-only audit і явного дозволу.
