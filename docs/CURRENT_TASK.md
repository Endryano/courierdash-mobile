# Current Task — Read-only Production Supabase Audit Plan

_Дата: 2026-07-29_

## Мета

Підготувати короткий план read-only production Supabase audit для окремого погодження, без виконання audit.

## Scope

- Read-only перевірити прийняту документацію та фактичний mobile foundation, щоб визначити безпечний scope remote audit.
- Показати план read-only production Supabase audit максимум із п'яти пунктів.
- Не виконувати audit до окремого повідомлення власника `ЗАТВЕРДЖУЮ`.

## Inputs

- Прийняті `PROJECT_CONTEXT.md`, `ROADMAP.md` і `DECISIONS.md`, а також Theme and Localization foundation commit `28bb517ad7b1e2d3999a9e3ac2b08767688109c3`.
- Пріоритетні MVP рішення власника.
- Фактичний стан мобільного репозиторію.

## Constraints

- Не встановлювати залежності, не створювати продуктовий код чи змінювати конфігурацію до окремого погодження.
- Не виконувати remote audit до окремого погодження; план не авторизує changes, migrations, remote writes, RLS/policy/Auth changes або показ секретів.
- Не змінювати `README.md`; не робити branch, commit, merge або push без окремої команди.

## Acceptance criteria

- План містить не більше п'яти пунктів.
- План узгоджений із прийнятою документацією та не розширює MVP scope.
- До окремого `ЗАТВЕРДЖУЮ` не виконано жодної implementation-дії.

## Статус

**Активна документаційна задача:** підготовка плану read-only production Supabase audit. Audit не активний і не починається до окремого `ЗАТВЕРДЖУЮ`; changes, migrations і remote writes заборонені.
