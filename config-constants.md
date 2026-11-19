---
topic: App config lives in constants.ts
---

src/constants.ts defines zoom values, storage keys ("docs", "sheets"), the `APPS` registry (`Record<StorageKey, WorkspaceApp>`: feature flags customZoomInput, enableViewOnlyToggle, classroomSupport, plus the DOM `uiElements` such as #zoomSelect and #t-zoom), `getDefaultAppState(storageKey?)` (the only place storage defaults and the "100%" fallback live) and `workspaceAppUiStrategyConfigs`, which is built from `APPS`. RELAY_* constants must match the filenames in src/background/messages/ (Plasmo messaging routes handlers by filename).
