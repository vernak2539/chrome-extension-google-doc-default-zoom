---
topic: testing
source_issue: 105
---

`src/utils/sentry/base.test.ts` imports `./base` at the top and only stubs the `chrome` global inside `captureEvent`. If `src/utils/sentry/base.ts` (or anything it imports) imports `src/constants`, the module-scope `localize(...)` call throws at import and the test file fails. `base.ts` therefore imports only `src/utils/storage` (the shared `storage` and `SCHEMA_VERSION_KEY`). `src/utils/storage-migration.ts` imports `src/constants`, so `base.ts` must not import it.
