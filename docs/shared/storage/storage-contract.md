# Storage Contract

**STATUS: NOT USED**

No Supabase Storage call site, bucket contract, upload flow, or generated storage policy evidence was found in the Web repository. Remote Staging Storage inventory was not queried because environment identity was not verified.

Mobile must not create or depend on a bucket from this snapshot. Any future storage feature must define bucket ownership, object paths, MIME/size limits, signed URL behavior, deletion rules, RLS/storage policies, and lifecycle before implementation.

Evidence: repository source search and `lib/supabase.ts`.

