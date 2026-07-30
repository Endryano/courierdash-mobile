# Development Workflow

## Discovery

- Use for unknown contracts, audits, architecture choices, and bounded plans.
- Inspect source, tests, relevant docs, and Git state first.
- Read-only unless changes, dependency installation, remote access, or commits are explicitly authorized.
- Return evidence, options, risks, blockers, and a recommended next milestone.

## Implementation

- Start only with approved scope and a clean/understood working tree.
- Change only milestone files; reuse existing contracts/providers before adding abstractions.
- Add focused offline tests; preserve unrelated changes.
- Fix only small in-scope defects found by validation. Stop when a fix changes architecture, domain, backend, or scope.

## Checkpoint

- Review actual diff, untracked files, staged scope, and validation results.
- Exclude secrets, local environment files, generated output, caches, and unrelated work.
- A checkpoint is one reviewable milestone; it does not authorize subsequent work.

## Validation

- Run `npm.cmd run typecheck`, `npm.cmd run lint`, `npm.cmd run test`, and `git diff --check`.
- Report exact results, suite/test count, skipped/failures, warnings, console errors, and unhandled rejections.
