# Commit Policy

## Before staging

- Inspect status, branch, HEAD, diff, and untracked files.
- Preserve unrelated changes; do not reset, clean, amend, rebase, merge, or squash without explicit approval.

## Staging and commit

- Stage explicit accepted files only; never `git add .` or `git add -A`.
- Inspect staged stat, full staged diff, and `git diff --cached --check`.
- Exclude `.env`, credentials, tokens, service-role data, caches, logs, build output, and temporary files.
- `.env.example` may contain public placeholder names only.
- Validate before commit. Commit one coherent milestone with imperative conventional subject (`feat:`, `fix:`, `test:`, `docs:`, `chore:`).
- A suggested message is not commit authorization. Do not create empty no-op commits.
- Do not push by default.

## After commit

- Report hash, subject, file stat, status, and push status.
- Leave a clean tree unless explicitly listed unrelated changes remain.
