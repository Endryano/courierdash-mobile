# Database Schema Summary

Status: `partially_verified`  
Target environment: intended Staging, remote status `blocked`

The repository-local schema snapshot and generated types describe five public tables. Remote Staging metadata was not queried because the linked target identity was ambiguous. No revision, applied-migration list, or remote drift claim is available.

| Table | Purpose | Primary/unique identity | Ownership | RLS evidence | Mobile disposition |
| --- | --- | --- | --- | --- | --- |
| `profiles` | Auth-linked nickname | Auth user key; nickname unique | Primary key equals Auth user | Enabled locally; owner insert/update, broad select | Required, profile flow blocked |
| `work_shifts` | Dated work and platform metrics | Numeric primary key; unique user/date | `user_id`, reported nullable with redacted concrete default | Enabled locally; authenticated owner ALL | Required, ownership remediation needed |
| `tax_settings` | Per-platform Web tax settings | Primary key; unique `user_id` | Required `user_id` | Enabled locally; owner select/insert/update | Deferred for Mobile |
| `garage_rules` | Maintenance intervals | Numeric primary key | `user_id`, reported nullable | Enabled locally; owner ALL | Not shared Expenses |
| `garage_history` | Maintenance events | Numeric primary key | `user_id`, reported nullable | Enabled locally; owner ALL | Not shared Expenses |

No public views, functions, triggers, or Postgres enums are represented by local evidence. Remote absence is unknown.

## Relationships

Each ownership field references the Auth user table. Profiles use their primary key as that reference. Work and both garage tables report cascade deletion; tax settings do not report cascade deletion.

## Work fields relevant to Mobile

The work row includes date, distance, hours, and per-platform base income, orders, app tips, cash tips, and bonuses for Uber, Wolt, Bolt, Glovo, Stuart, and Other. Other may include a custom name. Local constraints require a trimmed non-empty Other name when Other metrics are non-zero and require non-negative cash tips.

Legacy aggregate tips and bonuses coexist with platform-specific fields. No precedence or backfill rule is verified for historical data.

## Integrity risks

- The repository has no baseline migration for these tables or RLS policies.
- Work ownership is optional in generated insert types because local schema evidence reports a default; Mobile must not rely on it.
- Several work and garage fields are nullable while Web code often normalizes or assumes values.
- Currency, money precision, and rounding are not enforced by a verified shared schema.
- Expenses and rental tables do not exist in the repository evidence.

