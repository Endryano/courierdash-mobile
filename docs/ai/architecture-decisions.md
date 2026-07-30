# Architecture Decision Records

This file records only decisions evidenced by the current repository. Status is
`Accepted` when the decision is implemented in the active architecture.

## ADR-001 — Expo Router owns application routing

**Status:** Accepted

**Context:** The application needs native route groups, tabs, nested Work flows,
and a single routing entry point.

**Decision:** Use Expo Router with routes under `src/app/`. Use route groups for
auth, onboarding, and protected app boundaries; use layouts for navigators and
provider boundaries.

**Consequences:** Group names do not appear in URLs. Dashboard, Work, and More
are tab destinations; Work create and edit are nested Stack routes. Route files
remain composition layers rather than domain/data layers.

**Repository evidence:** `package.json` uses `expo-router/entry`; `app.json`
registers `expo-router`; `src/app/` contains layouts, `(tabs)`, and Work routes.

## ADR-002 — NavigationGate owns session and profile routing

**Status:** Accepted

**Context:** Authentication, profile bootstrap, nickname onboarding, logout,
and protected deep links must yield one consistent route decision.

**Decision:** Keep `NavigationGate` as the single authority that derives the
allowed route group from Auth and Profile state.

**Consequences:** Screens do not add their own auth guards. Unready or
disallowed routes render a safe boundary and redirect through one mechanism.
Intended deep-link restoration is not part of this decision.

**Repository evidence:** `src/app/_layout.tsx` mounts `NavigationGate` below
Auth/Profile providers; `src/features/navigation/NavigationGate.tsx` resolves
and replaces route groups; navigation gate tests cover those transitions.

## ADR-003 — WorkShiftsProvider is the canonical Work collection

**Status:** Accepted

**Context:** Work history, Dashboard, and Work mutations require one
owner-scoped view of shifts with safe loading, retry, and user-switch behavior.

**Decision:** `WorkShiftsProvider` owns the canonical shift collection and its
read state. Create, edit, and delete providers reconcile through that collection.

**Consequences:** Routes and UI do not retain copied shift collections. The
provider is mounted above protected tabs and Work mutation routes, preventing
unnecessary remounts during navigation.

**Repository evidence:** `src/app/(app)/_layout.tsx` places all Work providers
above its Stack; `WorkShiftsProvider.tsx` owns read states/retry; mutation
providers consume its retry mechanism.

## ADR-004 — Dashboard derives from Work instead of owning a data cache

**Status:** Accepted

**Context:** Dashboard metrics need the same Work data as history and must not
create competing fetch, cache, or error semantics.

**Decision:** Compute Dashboard period filtering and metrics from
`WorkShiftsProvider` through `useDashboardMetrics` and pure domain functions.

**Consequences:** Dashboard has no provider or direct backend access. Work
loading, empty, blocked, recoverable-error, and retry behavior remain canonical.
Calculations stay testable without React or Supabase.

**Repository evidence:** `useDashboardMetrics.ts` consumes `useWorkShifts` and
uses `filterWorkShiftsByPeriod`/`calculateDashboardMetrics`; no Dashboard
provider exists in `src/`.

## ADR-005 — Localization uses typed dictionaries with persisted preference

**Status:** Accepted

**Context:** The application supports four locales while keeping UI and
accessibility strings consistent without a separate i18n framework.

**Decision:** Use typed translation keys/dictionaries in `src/i18n`, resolve the
initial locale from persisted preference and device locale, and expose `t()`
through `LocalizationProvider`.

**Consequences:** New user-visible strings require typed entries for `pl`, `uk`,
`en`, and `ru`. Persisted choice wins over device locale; storage failure does
not prevent a current-session language change.

**Repository evidence:** `translations.ts` defines `TranslationKey` and all
locale dictionaries; `LocalizationProvider.tsx` calls device locale resolution,
storage helpers, and exposes typed `t`/`setLocale`.

## ADR-006 — Feature-oriented boundaries separate UI, domain, and API

**Status:** Accepted

**Context:** Auth, Profile, Work, Dashboard, and Navigation need independent
ownership while sharing only deliberate UI and infrastructure primitives.

**Decision:** Organize product code by feature under `src/features`, with
feature-local API, domain, provider, hook, and component modules as needed.
Keep shared UI in `src/components/ui` and shared infrastructure in `src/lib`.

**Consequences:** Feature changes remain locally reviewable. Data mapping and
business rules do not move into routes or shared presentation modules. Shared
abstractions require a cross-feature need rather than convenience alone.

**Repository evidence:** `src/features/` contains separate auth, profile, work,
dashboard, and navigation directories; Work contains API/domain/provider/hooks/
components; `src/components/ui` and `src/lib/supabase` remain shared boundaries.

Only add ADRs when an accepted decision has equivalent repository evidence.
Do not use ADRs for task scope, temporary blockers, or future proposals.
Supersede an ADR only with new accepted evidence.
