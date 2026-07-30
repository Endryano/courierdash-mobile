# Project State

## Current baseline

- Expo Router mobile app on `codex/project-foundation`.
- `AGENTS.md` holds short rules; `docs/ai/` holds detailed AI context.
- Quality baseline: strict TypeScript, Expo ESLint, Jest, `jest-expo`, React Native Testing Library.

## Completed milestones

- Expo, quality, dark theme, localization, typed Supabase client, Auth/session UI, profile bootstrap, nickname onboarding, protected navigation.
- Work shifts read/create/edit/delete foundations with canonical refresh/reconciliation.
- Canonical Work analytics, Dashboard metrics/period filtering, protected Dashboard/Work/More navigation.
- Statistics overview accepted in `3332409f7b549a255235eb30aa182ada3302c519`: protected secondary route from More, derived from `WorkShiftsProvider`, PLN summary and six-platform breakdown for Today, Week, Month, and All time; 43 suites / 234 tests passed.

## Current architecture status

- Ready authenticated users land on Dashboard; Work history and CRUD are protected routes.
- More links to Statistics as a secondary route; Statistics is not a bottom tab, Settings, or Reports.
- Dashboard and Statistics derive from `WorkShiftsProvider`; Work-domain utilities own canonical period filtering and Brutto calculation.

## Known technical debt

- Legacy `docs/*.md` are historical; use `docs/ai/` plus source for current work.
- No root not-found route or intended deep-link restoration after login/onboarding.
- Real Android/iOS device testing and dependency security review remain separate work.
- `workPlatformKeys` has a second declaration in the create flow; centralize platform keys in a future narrow cleanup without reopening Statistics.

## Next planned milestone

- Annual Report correctness foundation is the preferred next milestone, but is not started. Implementation intentionally waits for shared-contract revision `0.2.0-draft` and a sanitized snapshot that verify or explicitly set provisional annual timezone/date-boundary semantics, rounding status, and canonical numeric fixtures.
- Dynamic available years and grouping Other by individual names are proposed Mobile behavior only; the shared contract must verify them before implementation.

## Repository conventions

- Use `npm.cmd`/`npx.cmd` on Windows.
- For implementation, run typecheck, lint, tests, and diff check.
- Read only task-relevant `docs/ai/` material and inspect source for implementation-sensitive contracts.
