# Project State

## Current baseline

- Expo Router mobile app on `codex/project-foundation`.
- `AGENTS.md` holds short rules; `docs/ai/` holds detailed AI context.
- Quality baseline: strict TypeScript, Expo ESLint, Jest, `jest-expo`, React Native Testing Library.

## Completed milestones

- Expo, quality, dark theme, localization, typed Supabase client, Auth/session UI, profile bootstrap, nickname onboarding, protected navigation.
- Work shifts read/create/edit/delete foundations with canonical refresh/reconciliation.
- Canonical Work analytics, Dashboard metrics/period filtering, protected Dashboard/Work/More navigation.

## Current architecture status

- Ready authenticated users land on Dashboard; Work history and CRUD are protected routes.
- More is a minimal shell, not Settings or Reports.
- Dashboard derives from `WorkShiftsProvider`.

## Known technical debt

- Legacy `docs/*.md` are historical; use `docs/ai/` plus source for current work.
- No root not-found route or intended deep-link restoration after login/onboarding.
- Real Android/iOS device testing and dependency security review remain separate work.

## Next planned milestone

- Separately approved Statistics and Annual Report discovery/implementation; this document does not authorize it.

## Repository conventions

- Use `npm.cmd`/`npx.cmd` on Windows.
- For implementation, run typecheck, lint, tests, and diff check.
- Read only task-relevant `docs/ai/` material and inspect source for implementation-sensitive contracts.
