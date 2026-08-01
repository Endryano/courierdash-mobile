# Schema Policy

Contract version: `0.2.0-draft`  
Status: `draft_pending_schema_snapshot`

## Status vocabulary

Only these evidence statuses are used by this contract:

`verified`, `reported_pending_snapshot`, `inferred`, `proposed`, `unresolved`, `deferred_for_mobile`, `not_implemented_on_mobile`, `blocked`, `draft_pending_schema_snapshot`, `partially_verified`, `not_used`.

`verified` requires direct evidence against the named target. `partially_verified` means repository evidence is internally consistent but the target environment is not independently verified. `reported_pending_snapshot` preserves a supplied fact without upgrading it to verification.

## Source-of-truth rules

- Every schema, data, function, trigger, or RLS change starts as a versioned SQL migration.
- A generated database type file is a client artifact, not a migration and not proof that Staging matches.
- A local schema snapshot is evidence only. It must record capture context and must not contain project references, credentials, database URLs, user data, or concrete ownership defaults in exported documentation.
- `schemaRevision` and `latestMigration` stay `null` until an unambiguous Staging target is checked read-only.
- Production metadata is not used to fill Staging gaps.

## Observed local public schema

Repository evidence describes five RLS-enabled public tables: `profiles`, `work_shifts`, `tax_settings`, `garage_rules`, and `garage_history`. It describes no public views, RPC functions, triggers, or Postgres enums. This is `partially_verified`, not a Staging inventory.

The generated types in `lib/database.types.ts` match those five table names and expose no public Functions, Views, or Enums. Nullable database fields must stay nullable in clients unless a verified migration makes them required.

## Migration discipline

The repository migration directory currently contains only:

- `202607230001_add_stuart_and_other_platform.sql`
- `202607240001_add_cash_tips_per_platform.sql`

They add platform and cash-tip fields and related checks. They do not create the base tables, base RLS policies, profile model, or the complete set of earlier constraints. Consequently a clean database cannot be reconstructed from the checked-in migrations alone. This is a blocker for a verified mobile schema snapshot.

Migration rollout must follow expand, migrate clients, verify, deprecate, remove. Applying a migration remotely always requires separate explicit approval and is outside this contract-generation task.

## Ownership and nullability

User-owned rows use Auth identity as the ownership boundary. The intended invariant is that ownership is present and immutable after insert. Local evidence currently conflicts with that invariant:

- `work_shifts.user_id`, `garage_rules.user_id`, and `garage_history.user_id` are reported nullable.
- `work_shifts.user_id` is reported to have a concrete default value. The value is redacted because it is not contract data.
- Application models sometimes treat nullable garage fields as required.

Mobile must not depend on the reported default. It must send the authenticated user identifier where the current direct-CRUD contract requires it and rely on RLS as defense in depth. Schema remediation is Class C and requires a migration plus two-account Staging verification.

## Naming and numeric policy

- Canonical term: `app_tips`.
- Mobile property: `appTips`.
- Current database mapping: platform-specific `tips_uber`, `tips_wolt`, `tips_bolt`, `tips_glovo`, `tips_stuart`, and `tips_other`.
- Cash tips use corresponding `cash_tips_*` fields.
- Currency is reported as PLN and is supported by Web labels, but no verified currency column or shared money type exists.
- Numeric precision and rounding are unresolved. Clients must not introduce silent shared rounding rules. Fixtures compare exact supplied decimal values; presentation formatting is not a persistence rule.

## Compatibility classes

- Class A: documentation and evidence metadata only.
- Class B: additive optional field or capability with safe defaults.
- Class C: schema/Auth/RLS/formula/currency/timezone/rounding or required-field change.
- Class D: emergency security change.

Any Class C or D change must update the manifest, schema summary, affected flow, business rule, fixtures, compatibility declaration, and changelog before client acceptance.

