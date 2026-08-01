# Edge Function Contracts

**STATUS: NOT USED**

No Edge Function source directory, invocation, webhook, external integration, payment, or privileged side-effect contract was found in the Web repository. Remote Staging function deployment state was not queried.

Future external APIs, secrets, webhooks, emails, payments, and privileged side effects must use an Edge Function or versioned service API. Client bundles must never embed elevated server credentials.

Evidence: repository source search, `lib/supabase.ts`.
