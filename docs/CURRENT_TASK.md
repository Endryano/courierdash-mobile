# Current Task — Review shared-contract revision 0.2.0-draft

_Дата: 2026-07-30_

## Мета

Перевірити incoming shared-contract revision `0.2.0-draft` і sanitized snapshot для Annual Report.

## Scope

- Перевірити, чи artifacts підтверджують або явно задають provisional annual timezone і date-boundary semantics, rounding status та canonical numeric fixtures.
- Не реалізовувати Annual Report у межах цього review.
- Після успішного review наступною задачею є Annual Report correctness foundation; вона не починається без окремого погодження.

## Constraints

- Review є read-only, доки окрема задача явно не дозволить зміни.
- Не виконувати remote changes, migrations, staging, commit або push без відповідного окремого дозволу.

## Статус

**Активна review-задача:** Review incoming shared-contract revision `0.2.0-draft` and sanitized snapshot. Annual Report correctness foundation є наступним рекомендованим milestone, але implementation ще не активний.
