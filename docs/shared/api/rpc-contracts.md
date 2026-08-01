# RPC Contracts

**STATUS: NOT USED**

Generated database types expose no public Functions, the local schema snapshot lists no functions, and no `.rpc(...)` call site was found. This is repository-local evidence; remote Staging absence is unknown.

RPC becomes the preferred boundary for atomic multi-table writes, shared calculations, idempotent commands, dependent mutations, or aggregations that must be identical across clients. The existing Garage history-plus-rule update meets the atomicity criterion if it becomes shared, but no RPC contract is proposed here.

Evidence: `lib/database.types.ts`, `supabase/schema.snapshot.json`, repository source search.

