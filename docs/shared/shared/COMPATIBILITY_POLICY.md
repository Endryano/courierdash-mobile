# Compatibility Policy

Contract version: `0.2.0-draft`  
Status: `proposed`

## Compatibility objective

Additive evolution is preferred. Clients may present different interfaces, but they must preserve accepted field meaning, formulas, ownership, date semantics, and failure behavior.

## Rollout sequence

Every shared data or behavior change follows:

1. Expand the contract and backend with backward-compatible capability.
2. Migrate clients while old behavior remains supported.
3. Verify Web and Mobile against the same Staging snapshot and fixtures.
4. Deprecate the old capability with an explicit end condition.
5. Remove it only after the supported client range no longer needs it.

## Change classes

| Class | Meaning | Required handling |
| --- | --- | --- |
| A | Editorial/evidence-only | Review; no runtime migration |
| B | Additive optional capability | Minor contract increment, defaults, fixtures |
| C | Breaking schema, Auth, RLS, formula, currency, timezone, rounding, or required-field change | New version, migration, compatibility plan, dual-client verification |
| D | Security emergency | Immediate containment, explicit impact, incident evidence, follow-up snapshot |

## Supported client range

During the pre-public Mobile phase, compatibility is governed by the explicit catch-up gate rather than a time window. After public Mobile release, the intended policy is current plus previous compatible contract versions. The exact support duration is `future_release_gate` and must be decided before the first public Mobile release.

`semverRangeFormat` is `npm-semver`. Draft versions are pre-release coordination artifacts and do not imply production support.

## Mobile review outcome

The technical review of snapshot `0.2.0-draft.2` completed with `PASS WITH NON-BLOCKING MISMATCHES`. Work and Statistics may continue as local compatibility references, and ordinary Class A Mobile or Web work may continue.

The review resolved no shared backend blocker. Profile, Annual Report, and backend-sensitive shared work remain governed by the existing Staging identity, migration, RLS, ownership, timezone, rounding, and Auth blockers. A Mobile review pass is not Staging verification and is not Production approval.

## Mobile catch-up gate

Mobile cannot be accepted as contract-verified until all applicable items pass:

- Staging identity is unambiguously verified read-only.
- A fresh schema/type snapshot is generated from that Staging target.
- Checked-in migrations can explain the applied schema or the migration gap is explicitly repaired.
- Auth confirmation, redirect, recovery, and deep-link behavior is verified.
- One canonical profile creation mechanism is selected and tested.
- Ownership nullability/default risks are removed or accepted through an explicit migration plan.
- Two-account RLS tests pass for every Mobile-accessed table.
- Work and annual-report fixtures pass on both clients.
- Local-date/week/month boundary semantics are identical.
- Shared rounding and precision are decided before rental or income-after-expenses ships.
- Expenses and rental stay disabled until schema and fixtures are accepted.

## Deprecation rules

- A field is never repurposed to carry a different meaning.
- A legacy alias may be read during migration but canonical writes use the new term.
- Removing or making a field required is Class C.
- The legacy phrase “online tips” may be displayed only as migration copy; the canonical term is `app_tips`.
- Old clients must fail clearly when a required capability is unavailable; silent reinterpretation is forbidden.
