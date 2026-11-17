---
topic: Storage schema and migrations
---

chrome.storage is accessed via @plasmohq/storage. The current schema is V2 (documented in docs/STORAGE_SCHEMA.md): `schemaVersion` plus per-app objects `docs` and `sheets`, each holding {zoomValue, viewOnly, classroomSupport}. The pure V1->V2 logic is in src/utils/storage-migration.ts (tested); the background runner is src/utils/migrations.ts, which exports `migrationsReady`. That promise swallows errors on purpose and reports them to Sentry.
