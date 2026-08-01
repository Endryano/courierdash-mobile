# Auth Contract

Status: `partially_verified`

## Required semantics

- Login and signup use email plus password.
- Reported Staging behavior enables email confirmation, permits signup, disables anonymous signup, and has no OAuth providers enabled.
- Web recovery requests a reset link and completes password update only after a recovery session is established.
- Logout ends the Supabase session; client-specific cache cleanup is not a shared Auth guarantee.
- Mobile deep-link and recovery redirect configuration is unresolved.

Every Staging-specific statement is `reported_pending_snapshot` because target identity could not be verified. Local development config differs by disabling email confirmation and cannot override the reported Staging contract.

## Mobile review evidence

Mobile HEAD `4ecfb48d99951539c7f5db73fb748667478ffb85` confirmed a typed Supabase singleton, AsyncStorage session persistence, refresh lifecycle handling, and no secret or session logging. Email/password and local session behavior are compatible, but Staging confirmation, deep links, and recovery redirects remain unverified.

## Unsupported or unverified

Magic links, phone OTP, anonymous accounts, and OAuth are not implemented in inspected Web source. They are not part of contract version `0.2.0-draft`. Adding a provider or changing confirmation semantics is Class C.

## Client security

Clients may use only public anonymous-client credentials and must rely on RLS. Elevated server credentials, admin Auth operations, and privileged bypass are prohibited in Web and Mobile bundles.

Evidence: `app/login/page.tsx`, `app/forgot-password/page.tsx`, `app/reset-password/page.tsx`, `lib/auth-route-policy.ts`, `supabase/config.toml`, and reported Staging settings.
