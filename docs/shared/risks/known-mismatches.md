# Known Mismatches and Risks

| ID | Severity | Status | Evidence | Impact | Mobile stop | Recommendation | Flows |
| --- | --- | --- | --- | --- | --- | --- | --- |
| RISK-001 | blocker | open | Unverified linked target; no approved Staging credential source | Remote schema/Auth/RLS cannot be asserted | yes | Provide unambiguous Staging identity, then run read-only metadata audit | all shared flows |
| RISK-002 | blocker | open | Only two additive migrations vs five-table local snapshot | Schema is not reproducible | yes | Reconcile a migration baseline and verify applied history | profile, work, reports, expenses |
| RISK-003 | blocker | open | Local work ownership has a redacted concrete default and is nullable | Omitted owner can be misattributed | yes | Remove default, require ownership, test isolation | work, statistics, reports |
| RISK-004 | high | open | Work and garage owner columns nullable | Orphan/inconsistent rows possible | yes for accessed tables | Migrate nullability after reconciliation | work |
| RISK-005 | high | open | Three Web profile bootstrap behaviors | Auth user may lack profile; races differ | yes | Select one idempotent canonical mechanism | auth, profile |
| RISK-006 | high | open | Local profile SELECT policy is broad | Nickname enumeration/privacy exposure | yes for profile acceptance | Replace with minimum-disclosure uniqueness approach | profile |
| RISK-007 | high | open | Web UTC date derivation vs reported Mobile local dates | Day/week/month totals may diverge | yes | Define one date-only algorithm and boundary fixtures | work, statistics, reports, rental |
| RISK-008 | medium | open | Multiple display rounding sites; no shared rule | Cross-client monetary differences | yes for expenses/rental | Approve precision/rounding and fixtures | statistics, reports, expenses, rental |
| RISK-009 | medium | open | Local confirmation off vs reported Staging on | Signup/profile sequencing differs | yes for auth acceptance | Verify Staging and confirmed signup | auth, profile |
| RISK-010 | medium | open | Garage Web models stricter than generated nullability | Runtime null assumptions | no for current Mobile scope | Align models/schema before sharing Garage | garage |
| RISK-011 | medium | open | Legacy aggregate and platform-specific earnings fields coexist | Historical totals may double count or drift | yes for historical import | Define precedence/backfill/deprecation | work, statistics, reports |
| RISK-012 | medium | open | Some reads fail silently; no shared error envelope | Clients communicate failures differently | no for fixture review | Define error categories before orchestration | work, garage |
| RISK-013 | medium | open | Garage odometer cache not user-scoped | Account switching can show stale value | no for current Mobile scope | Scope or remove local cache | garage |
| RISK-014 | high | open | No expense/rental schema, RLS, API, or fixtures | Feature cannot be implemented safely | yes | Decide domain, migrate, verify, add fixtures | expenses, rental |

## Mobile review resolution

- `MISMATCH-007` is resolved: independent Mobile review of snapshot `0.2.0-draft.2` passed all seven supplied calculation cases. No Mobile Statistics calculation change is required. Backend, timezone, and rounding risks remain separate and open.
- `MISMATCH-008` is open, medium, and non-blocking: Mobile requires `work_shifts.user_id` and includes `graphql_public` declarations, while the snapshot type permits nullable ownership and has no matching declarations. Verify Staging identity, reconcile migrations, regenerate types from verified Staging, compare byte-for-byte, and never manually merge generated types.

Mobile client compatibility does not establish backend contract verification. Staging identity, migration reconstruction, RLS, ownership, profile bootstrap, timezone, rounding, Annual Report readiness, and Expenses/Rental remain open.

## Overall gate

The snapshot is usable for Mobile technical review of Auth intent, Work mappings, Statistics/Reports formulas, and known risks. It is not a verified Staging schema snapshot. Expenses and rental are blocked, and Profile cannot be accepted until its mechanism is unified.
