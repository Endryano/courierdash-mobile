# Migration Map

Status: `blocked` for reproducible baseline

| Migration | Repository intent | Local evidence | Applied on Staging |
| --- | --- | --- | --- |
| `202607230001_add_stuart_and_other_platform.sql` | Add Stuart/Other income, orders, app tips, bonuses, custom name, and checks | Reflected in local snapshot/types | Unknown |
| `202607240001_add_cash_tips_per_platform.sql` | Add six cash-tip fields, non-negative checks, and Other-name dependency | Reflected in local snapshot/types | Unknown |

No checked-in migration creates the base tables, profile uniqueness, initial work fields, garage/tax tables, base RLS policies, or the reported work ownership default. Therefore the repository cannot reproduce the complete local schema from migrations alone.

`latestMigration` remains null because remote applied history was not queried. The two filenames above are repository files, not claims about Staging application state.

Required resolution: capture an approved read-only Staging migration inventory, reconcile missing history through reviewed migrations, regenerate types, and update the snapshot. No migration was applied by this task.

