# Shared Contract Changelog

## Snapshot 0.2.0-draft.3 finalization — 2026-08-01

Status: `partially_verified`

This is a snapshot metadata and evidence finalization, not a new business-contract version. Contract version remains `0.2.0-draft` and the sync terminology remains `SYNC PHASE 1 — MOBILE CATCH-UP`.

### Mobile compatibility review of snapshot 0.2.0-draft.2

- Verdict: `PASS WITH NON-BLOCKING MISMATCHES`.
- Mobile branch: `codex/project-foundation`.
- Mobile HEAD: `4ecfb48d99951539c7f5db73fb748667478ffb85`.
- Reviewed archive SHA-256: `04b159598a1a7c7137417dfc1b1ea40a05c4082ef2fa3ce6d64ec7fbb7880508`.
- Archive extraction, nine JSON parses, 36 artifact checksums, artifact coverage, and sanitization passed.
- Work and Statistics calculation compatibility were confirmed.
- All seven supplied calculation cases passed: five income cases and two report cases.
- Mobile has no RPC, Edge Function, or Storage dependency.
- Mobile code changes, commits, pushes, migrations, network calls, and remote writes were zero.
- Profile parity, Staging Auth/RLS, ownership, timezone, and rounding remain unresolved.
- Annual Report remains blocked even though its pure arithmetic fixtures passed.
- Shared status remains `partially_verified`; this review is neither Staging verification nor Production approval.

## 0.2.0-draft — 2026-08-01

Status: `blocked`

This draft establishes the first repository-local shared Web/Mobile contract package. A verified schema snapshot is impossible in this run because the available linked project cannot be proven to be Staging, so no remote metadata command was executed.

### Added

- Canonical architecture, schema, API, Auth/security, business-rule, and compatibility documents.
- Strict machine-readable contract and fixture schemas.
- Verified local arithmetic fixtures for all six platforms, including Stuart, Other, app tips, cash tips, bonuses, orders, null/missing numeric behavior, and zero-denominator reports.
- Explicit flow state for Auth, Profile, Work, Statistics, Reports, Expenses, and Vehicle Rental.
- Sanitized snapshot export format for Mobile handoff.

### Recorded risks

- Unverified Staging identity and unavailable remote schema revision.
- Incomplete checked-in migration history.
- Redacted concrete ownership default and nullable ownership columns in local schema evidence.
- Multiple Web profile bootstrap paths.
- Broad profile read policy in local evidence.
- Web UTC date derivation versus reported Mobile device-local semantics.
- Undefined rounding, rental proration, and Expenses schema.

### Compatibility

This is a draft catch-up contract. No Production deployment, database migration, branch change, commit, push, or pull request is part of this version.
