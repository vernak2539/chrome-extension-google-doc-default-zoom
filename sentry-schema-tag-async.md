---
topic: sentry
source_issue: 108
---

`createSentryClient` sets the `storageSchemaVersion` tag on its scope only after `storage.get` resolves (`src/utils/sentry/base.ts`), so a `scope.clone()` made earlier never gets it. Plasmo's generated router calls handlers synchronously from `chrome.runtime.onMessage`. `src/background/messages/report-content-error.ts` therefore awaits `storage.get(SCHEMA_VERSION_KEY)` and sets the tag on each clone (default 1).
