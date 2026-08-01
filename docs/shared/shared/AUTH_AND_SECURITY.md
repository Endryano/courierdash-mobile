# Authentication and Security Contract

Contract version: `0.2.0-draft`  
Status: `partially_verified`

UI and navigation may differ between Web and Mobile, but authentication meaning, session lifecycle, ownership, and authorization outcomes must remain compatible.

## Reported Staging Auth settings

These supplied Staging claims could not be checked because the approved evidence does not identify the linked project as Staging. They remain reported facts, not verified metadata.

| Field | Value | Environment | verificationStatus | verifiedAt | verifiedBy | evidenceRefs |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Email/password | enabled | staging | `reported_pending_snapshot` | null | null | `reported:auth-settings` |
| Email confirmation | enabled | staging | `reported_pending_snapshot` | null | null | `reported:auth-settings` |
| Signup | allowed | staging | `reported_pending_snapshot` | null | null | `reported:auth-settings` |
| Anonymous signup | disabled | staging | `reported_pending_snapshot` | null | null | `reported:auth-settings` |
| OAuth providers | disabled | staging | `reported_pending_snapshot` | null | null | `reported:auth-settings` |
| Mobile deep links | unresolved | staging | `unresolved` | null | null | `reported:mobile-auth` |

Local `supabase/config.toml` enables email/password signup, disables anonymous signup, has no enabled OAuth provider, and disables email confirmation. It is local development evidence only. The confirmation mismatch must be resolved against Staging before Mobile auth acceptance.

## Supported Web flows

- Login uses email and password.
- Signup exists on both the landing surface and `/login`.
- Password recovery sends a redirect to `/reset-password`; the reset page requires a password-recovery session, updates the password, signs out, and returns to login.
- Password validation requires at least six characters and matching confirmation in the Web recovery helper.
- Logout calls Supabase sign-out. The additional removal of a literal local-storage key is implementation-specific and not canonical session behavior.
- Magic link, phone OTP, anonymous access, and OAuth are not implemented in the inspected Web source.

## Mobile review evidence

The review of Mobile HEAD `4ecfb48d99951539c7f5db73fb748667478ffb85` against snapshot `0.2.0-draft.2` confirmed a typed Supabase singleton, AsyncStorage session persistence, refresh lifecycle handling, and no secret or session logging. It also confirmed explicit authenticated ownership in Work inserts and owner-scoped Work reads, updates, and deletes.

These are `partially_verified` client-compatibility facts. Individual Staging settings in the table above remain `reported_pending_snapshot`; email confirmation, Mobile deep links, and recovery redirect behavior were not promoted to verified.

## Canonical profile invariant

Target invariant: every Auth user that enters an authenticated product flow has exactly one `profiles` row whose primary key equals the Auth user identifier. Nickname is unique and is the only observed profile attribute.

Current mechanism status: `blocked`.

Observed Web mechanisms are:

1. Landing signup sends nickname in Auth metadata and upserts a profile only when signup immediately returns a session.
2. Work-page bootstrap reads the profile, uses Auth metadata when available, otherwise opens a nickname prompt, then upserts.
3. Login-page signup sends only email and password, so a confirmed user may initially have neither nickname metadata nor a profile.

These parallel mechanisms are a high-severity mismatch. There is no verified database trigger or RPC creating profiles. Mobile must not claim profile-flow parity until the canonical bootstrap point, uniqueness race handling, confirmation flow, and retry semantics are defined.

## Session contract

- The Supabase client is created in the browser from public URL and anonymous-client environment variables.
- Protected Web pages inspect the current session and redirect unauthenticated users to login.
- Public/login route redirection is implemented in client code; no server middleware authorization layer was found.
- Refresh rotation is enabled in local config with a one-hour local token lifetime; Staging values are unknown.
- Mobile deep-link and recovery URL configuration is unresolved.
- Client bundles must contain no elevated server key. The inspected Web client uses only public client credentials by variable name; secret values were not read or exported.

## RLS semantic summary

Local snapshot evidence reports RLS enabled on all five public tables:

- `work_shifts`: authenticated users may operate only where `auth.uid()` equals `user_id`.
- `garage_rules` and `garage_history`: owner equality is used for reads and writes.
- `tax_settings`: owner equality is used for select, insert, and update; no delete policy is reported.
- `profiles`: insert and update are owner-bound, but select is reported as universally visible. No delete policy is reported.

This is `partially_verified` repository evidence. Runtime two-account isolation testing is `not_performed_read_only_metadata_audit`. The broad profile-select policy is a privacy risk even if nickname uniqueness checks currently depend on it. Nullable ownership fields and the redacted concrete default reported for work ownership are security blockers that require migration review.

Client owner filters are defense in depth only. They do not replace RLS, ownership constraints, verified Staging policy metadata, or two-account isolation tests. The Mobile owner-scoped profile upsert is useful evidence but does not resolve the blocked canonical profile bootstrap mechanism.

## Security constraints

- Never export passwords, tokens, session data, user emails, user identifiers, project references, database URLs, or credential values.
- Never use Production to fill an evidence gap.
- Never bypass RLS from Web or Mobile.
- Any Auth or RLS semantic change is Class C; emergency containment is Class D.
