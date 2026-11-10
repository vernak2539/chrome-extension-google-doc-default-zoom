---
topic: App config lives in constants.ts
---

src/constants.ts defines zoom values, storage keys ("docs", "sheets"), workspaceApps feature flags (customZoomInput, enableViewOnlyToggle, classroomSupport) and workspaceAppUiStrategyConfigs (DOM selectors such as #zoomSelect and #t-zoom). RELAY\_\* constants must match the filenames in src/background/messages/ (Plasmo messaging routes handlers by filename).
