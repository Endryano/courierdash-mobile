# Session Contract

Status: `partially_verified`

The Web creates a browser Supabase client from public environment variables. Protected routes query the current session in client code and redirect unauthenticated users. Login/public routes also use client-side session checks. No server middleware authorization layer was found.

The Mobile review confirmed a typed singleton backed by AsyncStorage, refresh lifecycle handling, and no secret or session logging. This is compatible client evidence, not verification of Staging Auth settings.

Local configuration enables refresh-token rotation and a one-hour access-token lifetime. Staging values were not verified and are not canonicalized by this snapshot.

Password recovery requires a recovery-session event before accepting a new password. The Web then updates the password, signs out, and returns to login. Mobile must preserve the same security outcome while using platform-appropriate deep links. Deep-link routes and redirect allow-lists are unresolved.

Logout success is the completion of Supabase sign-out. Removing a Web-specific literal storage key is not portable session semantics and must not be copied into Mobile.

Evidence: `lib/supabase.ts`, `lib/auth-route-policy.ts`, `app/reset-password/page.tsx`, `app/work/page.tsx`, `supabase/config.toml`.
