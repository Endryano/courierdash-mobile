# Logout Flow

Status: `partially_verified`

1. Invoke Supabase Auth sign-out.
2. Clear user-scoped in-memory or local caches that can expose data after account switching.
3. Return to the public/login surface.
4. Reopening a protected flow must require a valid session.

The Web additionally removes a literal local-storage key. That key is implementation-specific and not a shared requirement. Mobile should clear its own secure session/cache state through the platform SDK, not imitate Web storage internals.

If sign-out reports an error, the client must avoid claiming successful logout while protected cached data remains visible.

Evidence: `app/work/page.tsx`, Supabase browser client usage.

