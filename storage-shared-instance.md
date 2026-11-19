---
topic: storage
source_issue: 105
---

Settings storage goes through the shared `storage` (`new Storage({ area: "sync" })`) exported from `src/utils/storage.ts`, with `SCHEMA_VERSION_KEY` and `CURRENT_SCHEMA_VERSION`. It is used by `src/utils/migrations.ts`, `src/background/messages/get-app-storage-state.ts`, `src/areas/settings/index.tsx`, `src/utils/sentry/base.ts` and the popup hook `src/components/WorkspaceApplication/hooks.ts` (via `useStorage({ key, instance: storage })`). `src/components/Announcement/hooks.ts` keeps its own `new Storage({ area: "local" })` on purpose. Settings are in `chrome.storage.sync`, and Plasmo stores values as JSON strings (`schemaVersion` is `"2"`).
