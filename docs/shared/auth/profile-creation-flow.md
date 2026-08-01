# Profile Creation Flow

Status: `blocked`  
Severity: high

## Target invariant

An authenticated user entering the product has exactly one profile row. Its key equals the Auth user identifier, and its nickname is unique.

## Observed Web mechanisms

1. Landing signup submits nickname as Auth metadata and upserts a profile only if a session is returned immediately.
2. Work bootstrap reads the profile; if absent, it uses Auth nickname metadata or asks the user, then upserts.
3. Login-page signup submits email and password only, leaving no nickname metadata for a confirmation-delayed account.

No verified trigger or RPC creates the profile. Nickname availability is checked by a broad profile query before upsert, which can race with another signup.

The Mobile review confirmed an owner-scoped profile read/upsert flow. This does not select or validate a canonical cross-client bootstrap mechanism, so Profile status remains `blocked`.

## Mobile stop condition

Do not mark signup/profile parity accepted until the team selects one canonical creation point, defines behavior when confirmation delays the first session, maps uniqueness conflicts to a stable user error, and proves retry idempotency. A server-side transaction or trigger may be appropriate, but this snapshot does not prescribe an unverified implementation.

Evidence: `app/page.tsx`, `app/login/page.tsx`, `app/work/page.tsx`, `lib/database.types.ts`, local RLS snapshot evidence.
