---
topic: storage
source_issue: 178
---

`fillAppState` in `src/constants.ts` is the one read path for stored app state. Its callers are `src/background/get-app-storage-state.ts` (content script), `src/components/WorkspaceApplication/hooks.ts` (popup read and setter `prev`) and `src/utils/storage-migration.ts` (V1 to V2, which writes the result). For `docs` it maps the 13 `LEGACY_FIT_LABELS` to `"fit"` on read, with no write-back and no schema bump.
