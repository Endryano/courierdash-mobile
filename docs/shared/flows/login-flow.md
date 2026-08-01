# Login Flow

Status: `reported_pending_snapshot`

1. Submit email and password to Supabase Auth.
2. On success, establish the client session.
3. Check the required profile invariant before entering dependent flows.
4. Navigate to Work or the platform-equivalent authenticated home.

Invalid credentials, unconfirmed accounts, rate limits, and network failure must remain distinguishable where Supabase exposes them. UI copy may differ, but the account must never be reported as authenticated without a valid session.

Observed Web source performs password login and client-side session redirects. Staging email-confirmation behavior and Mobile deep-link configuration are not verified.

Evidence: `app/login/page.tsx`, `app/page.tsx`, `lib/auth-route-policy.ts`.

