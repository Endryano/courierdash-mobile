# Ownership Model

Status: `blocked`

The canonical boundary is the authenticated Auth user. A user-owned row must have exactly one immutable owner and must not become readable or writable by another user.

- Profile ownership is represented by the profile primary key.
- Work, tax settings, garage rules, and garage history use `user_id`.
- Direct client inserts currently send the authenticated identifier explicitly.
- RLS is required even when the client filters by owner; client filters are not authorization.

Mobile review confirmed that current Work inserts always send authenticated `user_id` and that reads, updates, and deletes are owner-scoped. This makes the current client behavior compatible, but it does not resolve nullable backend ownership, the redacted default, or the lack of verified two-account RLS testing.

Local evidence conflicts with the intended invariant because work and garage ownership fields are nullable. Work ownership also has a concrete database default whose value is intentionally omitted. A client that omits ownership could be misattributed, so Mobile must never rely on that default.

Resolution requires a verified Staging audit, data reconciliation plan, migration to remove unsafe defaults and nullability, and two-account tests. Do not expose the redacted value in tickets, fixtures, examples, or logs.
