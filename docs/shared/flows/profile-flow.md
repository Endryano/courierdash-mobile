# Profile Flow

Status: `blocked`

## Shared invariant

One Auth user maps to one profile whose key equals the Auth identifier. Nickname is unique. A missing profile is recoverable state, not permission to create another Auth account.

## Proposed state machine

- `unknown`: session/profile not loaded.
- `missing`: authenticated user has no profile.
- `creating`: one idempotent bootstrap attempt is active.
- `ready`: profile exists and nickname is accepted.
- `conflict`: nickname uniqueness rejected.
- `retryable_error`: completion is uncertain or network failed.
- `blocked`: contract cannot choose a mechanism from current evidence.

This state machine is proposed, not implemented. Current Web paths perform signup-time upsert, metadata-driven lazy upsert, or an interactive Work-page upsert. No verified trigger/RPC exists, and broad nickname reads create a privacy concern.

Mobile stop: yes. Resolve `RISK-005` and `RISK-006`, then verify the selected mechanism with confirmation enabled and concurrent nickname attempts.

