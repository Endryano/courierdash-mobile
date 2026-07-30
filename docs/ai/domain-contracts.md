# Domain Contracts

## Work

- A shift is completed work; no active session, timer, GPS, or background tracking.
- Canonical summary: positive integer `id`, local `YYYY-MM-DD` date, non-negative hours and km.
- Platforms: Uber, Wolt, Bolt, Glovo, Stuart, Other; metrics are income, orders, app tips, cash tips, bonuses.
- Other may have a name. Do not introduce `online tips`.
- Negative values are invalid. Equal start/end is zero hours.
- Breaks require both times and may not overlap or leave shift bounds; never silently normalize invalid input.
- Week: Monday–Sunday. Read state: idle, loading, empty, ready, recoverable error, blocked.
- Owner-scoped mutations refresh/reconcile through the canonical list.

## Dashboard, Statistics, Reports

- Dashboard derives from Work shifts; it does not fetch separately.
- Periods: today, week, month, all time. Metrics include totals and safe income rates.
- Income includes income, app tips, cash tips, bonuses. Null contributions and zero denominators produce zero, never `NaN`/`Infinity`.
- Statistics is future derived-read work; never add a second Work cache.
- Annual Report is MVP correctness-first work. It must cover all platforms, Other names, cash tips, orders, zero values, dynamic years, and calendar-safe dates.
- Brutto only. Netto, Tax, expenses, transport rental, and Garage are out of current MVP implementation.

## Localization and backend

- Locales: `pl`, `uk`, `en`, `ru`; fallback `pl`; keys and accessibility text are typed in all locales.
- Persisted `courierdash.locale.v1` overrides device locale. Read failures fall back; write failures do not undo in-session change.
- Dark-only semantic theme and system font.
- `src/lib/supabase/database.types.ts` is generated contract: do not hand-edit; change only from authorized sanitized contract/audit work.
- API modules map typed database data into domain types and safe errors.
- Remote schema, RLS, Auth, Storage, Functions, or migrations require explicit authorization. Never use privileged credentials in mobile.
