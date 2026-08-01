# Web Source Map

All paths are relative to the Web repository source commit recorded in `manifest.json`.

| Contract area | Primary source evidence | What it proves | Verification |
| --- | --- | --- | --- |
| Supabase client | `lib/supabase.ts` | Browser client and public environment-variable names | `partially_verified` |
| Route/session policy | `lib/auth-route-policy.ts`, `lib/landing-session-check.ts` | Client-side session redirects and landing timeout | `partially_verified` |
| Landing signup/profile | `app/page.tsx` | Nickname metadata and immediate-session profile upsert | `partially_verified` |
| Login/signup | `app/login/page.tsx` | Password login; signup without nickname metadata | `partially_verified` |
| Recovery | `app/forgot-password/page.tsx`, `app/reset-password/page.tsx`, `lib/password-recovery.ts` | Reset request, recovery-session gate, validation, sign-out | `partially_verified` |
| Work CRUD/profile bootstrap | `app/work/page.tsx` | Direct CRUD, owner filter, lazy profile/tax creation, UTC date defaults | `partially_verified` |
| Platform model | `lib/work-platforms.ts` | Six keys, database mapping, null normalization, app/cash tips | `verified` by local tests/source |
| Work duration | `lib/work-hours.ts` | Hours, breaks, cross-midnight calculation | `verified` by local tests/source |
| Annual report | `app/work/year/annual-report-calculations.ts`, `app/work/year/page.tsx` | Six-platform aggregation, toggles, safe averages, formatting | `verified` locally; Staging pending |
| Garage | `app/garage/page.tsx` | Direct maintenance CRUD, dependent two-write update, unscoped odometer cache | `partially_verified` |
| Generated schema types | `lib/database.types.ts` | Five tables; no public Views/Functions/Enums in generated artifact | `partially_verified` |
| Local schema metadata | `supabase/schema.snapshot.json` | Tables, columns, constraints, RLS, local project capture | `partially_verified`; sanitized summaries only |
| Local Auth config | `supabase/config.toml` | Development Auth defaults | `inferred` for local only |
| Mobile Statistics | reported Mobile commits in canonical manifest | Implementation/review/acceptance claims | `reported_pending_snapshot` |

No application RPC, Edge Function, Storage, server action, route handler, or middleware authorization implementation was found in repository search.

