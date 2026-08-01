# CourierDash Mobile Contract Snapshot

Snapshot ID: `courierdash-0.2.0-draft-c4a67d5-20260801t130748z`  
Snapshot version: `0.2.0-draft.3`  
Contract version: `0.2.0-draft`  
Source Web commit: `c4a67d58997b36dc6d4913c226d9cf489c816b2e`  
Generated at: `2026-08-01T13:07:48Z`  
Generated from intended environment: `staging`  
Verification status: `partially_verified`  
Handoff readiness: **READY WITH RISKS**

This package is a sanitized, versioned Mobile handoff. It contains no credentials, database URL, project reference, user data, concrete user identifier, or Production assertion. The Staging identity gate failed: the locally linked target could not be proven to be Staging, so no remote metadata command was run. `schemaRevision` and `latestMigration` are therefore null.

The copied `database/database.types.ts` is byte-for-byte repository evidence, not a fresh Staging generation. Treat it as `partially_verified` and `reported_pending_snapshot` until a verified target can regenerate it.

## Mobile review result

Snapshot `0.2.0-draft.2` received `PASS WITH NON-BLOCKING MISMATCHES` at Mobile HEAD `4ecfb48d99951539c7f5db73fb748667478ffb85`. The reviewed archive SHA-256 is `04b159598a1a7c7137417dfc1b1ea40a05c4082ef2fa3ce6d64ec7fbb7880508`.

Work and Statistics calculation compatibility were confirmed, including all seven supplied calculation cases. Profile parity and Mobile Annual Report remain blocked. Staging schema, Auth/RLS, ownership, timezone, and rounding remain partially verified or unresolved.

Use this snapshot only as a local compatibility reference. It is not Staging-verified and not Production-approved.

## Recommended reading order

1. `manifest.json`
2. `shared/SHARED_ARCHITECTURE.md`
3. `shared/AUTH_AND_SECURITY.md`
4. `database/schema-summary.md`
5. `security/rls-contract.md`
6. `shared/BUSINESS_RULES.md`
7. `shared/fixtures/`
8. `flows/`
9. `risks/known-mismatches.md`

## Consumption rules

- Use only relative paths inside this package.
- Do not infer Staging or Production state from local snapshots.
- Do not implement Expenses or Vehicle Rental from prose alone; their schema and calculation fixtures are not ready.
- Stop Mobile acceptance on blockers marked `mobileStop: yes`.
- Verify every checksum in `manifest.json` before review.
