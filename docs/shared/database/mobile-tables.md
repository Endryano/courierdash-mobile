# Mobile Table Scope

Status: `partially_verified`

## Required now

### `profiles`

Needed for the current nickname model. Mobile reads and writes only its own profile under the intended contract, but the current local RLS evidence allows broad reads. Profile bootstrap is blocked until one creation mechanism and uniqueness strategy is accepted.

### `work_shifts`

Needed for Work, Statistics, and Reports. Mobile uses the six platform mappings documented in `shared/BUSINESS_RULES.md`. It must send authenticated ownership explicitly, preserve date-only meaning, and avoid relying on the redacted database default.

The Mobile type artifact requires `work_shifts.user_id`, while this snapshot's generated type permits it to be omitted or null. Mobile also contains `graphql_public` declarations absent from the snapshot type artifact. This medium, non-blocking mismatch does not change current Work behavior because Mobile sends the authenticated owner explicitly, but the generated types are not one verified canonical Staging artifact and must never be merged manually.

## Deferred

### `tax_settings`

Web uses this table for tax display calculations. It is not needed for the accepted Statistics Brutto formula, and Mobile support is deferred unless tax calculations become a shared flow.

## Not shared as Expenses

### `garage_rules` and `garage_history`

These tables implement maintenance interval/history behavior. They are not the canonical fuel/rental Expenses model. The two-write maintenance update can partially fail and would need an RPC review before becoming a shared operation.

## Missing

No repository table models fuel expenses or vehicle-rental periods. Mobile must keep these flows disabled until migrations, RLS, API semantics, and fixtures are accepted.
