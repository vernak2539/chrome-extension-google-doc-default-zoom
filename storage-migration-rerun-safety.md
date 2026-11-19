---
topic: storage
source_issue: 105
---

`src/utils/migrations.ts` reads the V1 keys, `docs`, `sheets` and `schemaVersion` with one `getMany`. With `schemaVersion` < 2 and V1 keys present it writes `docs`, `sheets` and `schemaVersion` in one `setMany`, then removes the V1 keys with one `removeMany`. With no V1 keys it writes only `schemaVersion`. With `schemaVersion` 2 and leftover V1 keys it only removes them. `migrateV1ToV2(v1Data, current)` keeps a stored `docs`/`sheets` object. `src/utils/migrations.test.ts` runs the real `migrationsReady` against `src/test-support/fake-chrome-storage.ts` (an in-memory `chrome.storage.sync` that records `set`/`remove` calls and must be stubbed before the dynamic import of the module under test).
