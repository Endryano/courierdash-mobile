# RLS Contract

Status: `partially_verified`  
Runtime isolation test: `not_performed_read_only_metadata_audit`

Local snapshot evidence reports RLS enabled on all five public tables. It does not prove the current Staging state.

| Table | Reported semantic policy | Concern |
| --- | --- | --- |
| `work_shifts` | Authenticated owner may select/insert/update/delete when Auth identity equals `user_id` | Ownership nullable; concrete default redacted |
| `garage_rules` | Owner equality for all operations | Ownership nullable |
| `garage_history` | Owner equality for all operations | Ownership nullable |
| `tax_settings` | Owner select/insert/update | No delete policy reported |
| `profiles` | Owner insert/update; reads allowed broadly | Nickname privacy and enumeration risk |

The Mobile review confirmed explicit Work owner payloads and owner-scoped reads, updates, and deletes. These client filters are defense in depth only; they do not prove or replace RLS, ownership constraints, Staging policy metadata, or two-account isolation tests.

## Required verification

Before Mobile staging acceptance, execute two-account tests for every accessed table: own-row select, other-row select denial, own insert, spoofed-owner insert denial, own update/delete where supported, and other-owner update/delete denial. Test anonymous behavior separately. No user data was accessed during this documentation audit.

Any policy or ownership change is Class C unless it is emergency containment under Class D.
