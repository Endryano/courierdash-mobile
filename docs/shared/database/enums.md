# Database Enums

**STATUS: NOT USED**

Repository-generated database types expose no public Postgres enums, and the local schema snapshot lists none. This is local evidence only; remote Staging inventory is blocked.

The six platform identifiers are a TypeScript/domain union, not a database enum. `garage_history.service_type` and tax setting modes are text fields without a verified database enum or check constraint. Mobile must not assume that arbitrary text is safe merely because the database accepts it. Shared domain enumerations should be versioned in the contract and, when appropriate, enforced through an additive migration.

Evidence: `lib/database.types.ts`, `lib/work-platforms.ts`, `supabase/schema.snapshot.json`.

