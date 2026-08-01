# CourierDash Mobile — Repository Instructions

## Detailed repository knowledge

- Read only task-relevant `docs/ai/` material; do not load the whole knowledge base by default.
- Architecture/providers: `docs/ai/architecture.md`; accepted decisions: `docs/ai/architecture-decisions.md`; domain/backend: `docs/ai/domain-contracts.md`.
- Workflow: `docs/ai/workflow.md`; Git: `docs/ai/commit-policy.md`; evolving state: `docs/ai/project-state.md`.
- For cross-side, backend, schema, Auth, business-rule, date, financial-formula, migration, or compatibility work, read only the relevant files in `docs/shared/`. It is a derivative, read-only Mobile import: versioned packages come from the shared-contract process, Mobile must not edit them or independently author shared schema, generated backend contracts, or migrations. Canonical ownership follows the imported contract; approved cross-side updates are required for a new shared version or shared/backend change. Local presentation-only work need not load this package.

## Scope and workflow

- Work in small, independently verifiable milestones.
- Treat discovery, implementation, validation, and checkpoint commits as separate tasks.
- Discovery is read-only unless the task explicitly authorizes changes.
- Before implementation, inspect the relevant code, contracts, tests, and Git state.
- Do not infer approval for a broader feature from an adjacent task.
- Report blockers with the smallest safe remediation; do not work around them by broad refactors.

## Project architecture

- Stack: Expo SDK, React Native, Expo Router, TypeScript, Jest, React Native Testing Library.
- Use the `src/` alias (`@/*`) for application imports.
- Keep routes thin: compose providers, feature components, and navigation callbacks only.
- Keep feature domain logic, API mapping, and provider state outside route files.
- Place feature code under `src/features/<feature>/` using `api`, `domain`, `hooks`, `provider`, and `components` where applicable.
- Keep shared visual primitives under `src/components/ui/`; do not fork them per feature without a reusable need.
- Keep cross-feature infrastructure under `src/lib/`; do not make a feature API a global utility.
- Keep route-specific validation and route-param parsing in the route wrapper, not the domain layer.
- Keep local UI state local only when it is not canonical domain, session, or navigation state.
- Prefer existing primitives: `Screen`, `AppText`, `AppButton`, `AppInput`.
- Preserve the dark-only semantic theme; do not add light/system theme without approval.
- User-visible strings and accessibility labels must use typed localization keys.
- Supported locales are `pl`, `uk`, `en`, `ru`; every new key requires all four entries.

## Expo Router

- Keep Expo Router files under `src/app/`; route groups must not leak into URLs.
- Use layouts for navigation structure and provider boundaries; use stacks for secondary flows.
- Keep primary destinations in native tabs when approved; do not build custom tab bars without need.
- Validate dynamic route params before using them; malformed params must not trigger data loads.
- Use `router.push` for forward flows and deliberate `router.replace` for state-boundary returns.
- Preserve native Android back and iOS swipe-back behavior.
- Do not activate typed routes or change Expo config/identifiers without explicit approval.

## Provider ownership and navigation

- Root ownership remains: SafeArea → Theme → Localization → Auth → Profile → NavigationGate.
- `NavigationGate` is the sole authority for auth readiness, profile readiness, onboarding, logout, and user-switch routing.
- Do not add per-screen auth guards or duplicate redirect logic.
- Keep authenticated feature providers inside the protected `(app)` layout and above its routes.
- `WorkShiftsProvider` is the canonical Work source for Dashboard and Work screens.
- Keep Work create/edit/delete providers above all Work routes; do not duplicate shift state in routes.
- Do not introduce a Dashboard provider unless separately designed and approved.
- Avoid provider remounts or duplicate fetches during tab switching.

## Backend and data boundaries

- UI and route files must not import Supabase, call `fetch`, issue queries, or map raw database rows.
- API modules own typed Supabase access and error categorization; domain modules own pure mapping and calculations.
- Do not expose raw Supabase, Postgres, SQL, RLS, token, or backend messages to users.
- Preserve owner scoping and existing canonical mutation/reconciliation behavior.
- Do not change schema, migrations, RLS, policies, Auth, Storage, Edge Functions, or remote services without explicit authorization.
- Never use or commit service-role keys, database passwords, connection strings, tokens, or real environment values.
- Keep `.env.example` limited to public placeholder variable names; never add real values.
- Treat local schema snapshots and generated artifacts as contracts, not proof of remote production state.

## React and TypeScript

- Keep `strict` TypeScript; do not weaken compiler settings or use broad `any`/suppression escapes.
- Preserve generated Expo type inputs in `tsconfig.json` unless explicitly changing the configuration contract.
- Use stable effect dependencies and cleanup subscriptions, listeners, and asynchronous lifecycle work.
- Guard asynchronous state updates against unmount, stale requests, user switches, and duplicate submissions.
- Keep event subscriptions and AppState listeners registered once per owning provider and remove them on cleanup.
- Do not navigate during render.
- Keep calculations pure and independently testable; do not synchronize derived state through effects without need.
- Do not add dependencies, polyfills, or configuration flags merely because an example uses them.

## Product and UI safety

- Follow accepted product contracts; do not invent business rules or expand deferred scope.
- Keep dates and numeric semantics in the domain contract; do not silently normalize invalid user input.
- Use safe loading, empty, recoverable-error, and blocked states where the feature contract requires them.
- Use semantic theme tokens rather than hardcoded visual colors in new UI.
- Keep touch targets practical (existing controls use at least 48 px) and give icon-only controls accessible labels.
- Respect safe areas, keyboard behavior, and localized screen titles.

## Tests and validation

- Add focused tests for new behavior; update route tests when a route moves.
- Tests must be deterministic, offline, and use mocks for backend/network boundaries.
- Clear mocks between tests and restore the behavior needed by each case explicitly.
- Verify race conditions, cleanup, malformed params, safe errors, and navigation callbacks when applicable.
- Do not add snapshots, coverage, E2E, CI, formatter, or test infrastructure changes without approval.
- Standard validation commands:

  ```powershell
  npm.cmd run typecheck
  npm.cmd run lint
  npm.cmd run test
  git diff --check
  ```

- Use `npm.cmd` and `npx.cmd` consistently on Windows.
- Do not run `npm audit fix`, `npm update`, dependency upgrades, or mass formatting unless explicitly authorized.

## Git and repository safety

- Inspect `git status --short`, branch, and HEAD before changes and before commits.
- Never overwrite or delete a user-owned change to obtain a clean tree; stop and report the conflict.
- Preserve unrelated user changes; never reset, clean, amend, rebase, merge, or squash without explicit approval.
- Stage explicit files only; never use `git add .` or `git add -A`.
- Inspect staged diff, staged stat, and `git diff --cached --check` before committing.
- Commit only after explicit authorization or when the task explicitly requests a commit.
- A commit subject mentioned in a plan is not authorization by itself.
- Do not create empty commits merely to record a no-op cleanup.
- Do not push by default. Push, remote changes, branches, and releases require explicit instruction.
- Do not commit `.env`, local credentials, caches, build output, logs, or temporary bootstrap files.

## Report format

- Lead with verdict/result, then changed files, behavior, validation, risks, and Git status.
- State exact command outcomes, test suite/test counts, and any warnings or failures.
- Explicitly list deviations, blockers, unverified behavior, and out-of-scope work.
- For checkpoints, state staged scope, commit hash/message, working-tree status, and push status.
- Do not print secrets, environment values, user data, or unnecessary full-file dumps.
