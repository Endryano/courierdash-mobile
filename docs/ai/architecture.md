# Architecture

## Layers

```text
routes → feature components/hooks → providers → API → Supabase client
                         ↓
                    domain (pure types, mapping, calculations)
```

- Routes in `src/app/` compose screens and navigation only.
- Features live in `src/features/<feature>/`; shared UI in `src/components/ui/`; infrastructure in `src/lib/`.
- Domain modules have no React or Supabase dependency.
- UI/routes never map raw rows or issue backend requests.

## Router and providers

- Route groups: `(auth)`, `(onboarding)`, `(app)`; group names are not URLs.
- `(app)` owns a Stack. `(tabs)` owns Dashboard, Work, More. Secondary routes: `/work/create`, `/work/:id/edit`.
- Validate dynamic route params before provider loads.

```text
SafeArea → Theme → Localization → Auth → Profile → NavigationGate → Slot
```

- `NavigationGate` alone resolves auth/profile loading, login, onboarding, ready-app, logout, and user-switch routing.
- Do not add route-level auth guards or duplicate redirects. It does not restore intended deep links.

```text
(app) → WorkShiftsProvider → Create → Edit → Delete → Stack
```

- These providers stay above tabs and mutation routes.
- `WorkShiftsProvider` is canonical for Dashboard and Work; mutations own their reconciliation state.
- Dashboard derives from canonical Work state; no Dashboard provider or route-local shift cache.

## State and lifecycle

- Providers own canonical remote/session state; component state is presentation-only.
- Use stable effects, cleanup listeners, and stale/unmount/user-switch guards.
- Navigate in effects or handlers, never during render.
