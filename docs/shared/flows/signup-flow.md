# Signup Flow

Status: `blocked`

## Contract intent

1. Collect email, password, and the nickname required by the profile contract.
2. Validate password and nickname locally only for user feedback; server constraints remain authoritative.
3. Create the Auth account using email/password.
4. If confirmation is required, show a pending-confirmation state and do not assume a session exists.
5. Create or reconcile exactly one profile through the accepted idempotent bootstrap mechanism.
6. Enter protected product flows only after a valid session and required profile exist.

## Observed Web behavior

Landing signup supplies nickname in user metadata and upserts a profile only when Auth immediately returns a session. Login-page signup supplies only email and password. The Work page later attempts profile recovery from metadata or prompts for a nickname.

## Error outcomes

- Duplicate nickname: surface a stable nickname-conflict result; do not treat a preflight select as race-free.
- Confirmation pending: preserve the account state and provide a clear next action.
- Auth succeeds but profile fails: retry profile bootstrap idempotently; do not create a second Auth account.
- Network failure: distinguish unknown completion from definite rejection.

Mobile implementation is stopped until one profile mechanism and the confirmed-signup path are accepted. Staging confirmation settings remain `reported_pending_snapshot`.

