# Work Flow

Status: `partially_verified`

## Record semantics

Work is a dated record, not a live start/stop shift. The Web stores at most one row per user/calendar date. A record includes distance, hours, and selected platform metrics for Uber, Wolt, Bolt, Glovo, Stuart, and Other.

Each platform can record base income, orders, app tips, cash tips, and bonuses. Other additionally needs a trimmed custom name when any Other metric is non-zero. Cash tips are non-negative. Null or missing numeric fields aggregate as zero in current Web calculations.

## Create/update

1. Require an authenticated session and ready profile.
2. Select at least one platform.
3. Validate Other name and cash tips.
4. Build a single `work_shifts` payload with explicit authenticated ownership.
5. Insert a new row or update by row identifier.
6. Treat the unique user/date conflict as an edit/duplicate-date decision, not a second row.
7. Refresh owned history after success.

## Read/delete

Read only owned rows under RLS and sort/filter locally as the current Web does. Update/delete by identifier still relies on RLS; the identifier alone is never authorization.

## Mobile compatibility review

Mobile HEAD `4ecfb48d99951539c7f5db73fb748667478ffb85` passed review against snapshot `0.2.0-draft.2`. The review confirmed six platforms, local `YYYY-MM-DD`, explicit authenticated ownership on inserts, owner-scoped reads/updates/deletes, and compatible Work-period calculations. Work acceptance is `accepted_by_both`, while verification remains `partially_verified` because Staging schema/RLS and timezone parity are unresolved.

## Known gaps

- Staging schema and RLS are not verified.
- The ownership default is unsafe and redacted.
- Web UTC-derived date defaults conflict with reported Mobile local-date behavior.
- No active-shift lifecycle, transaction, idempotency key, or shared error envelope exists.
- General negative-value validation beyond cash tips is not proven.

Fixtures: `shared/fixtures/income-calculations.json` and `shared/fixtures/report-calculations.json`.
