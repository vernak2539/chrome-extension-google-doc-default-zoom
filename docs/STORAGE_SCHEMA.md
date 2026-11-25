# Data Storage Schema

Over time, this extension has migrated its Chrome storage structure to improve maintainability and expandability. If you are ever debugging or looking into the stored data, this document outlines where it lives and what each schema version looks like.

## Where data is stored

- **Settings** (everything below) live in `chrome.storage.sync`. All code reaches them through `src/utils/storage.ts`, which uses WXT storage keys.
- Because WXT includes the area in the key, the keys in code are `sync:docs`, `sync:sheets` and `sync:schemaVersion`; `chrome.storage.sync` itself holds the part after the colon.
- **Announcement dismissals** live in `chrome.storage.local` under `dismissedAnnouncementIds`, because they are per-device UI state (`src/components/Announcement/hooks.ts`, key `local:dismissedAnnouncementIds`).
- Values are stored as **plain values**: `schemaVersion` is the number `2` and each app object is an object.

### Values written by older builds

Builds that used [Plasmo](https://docs.plasmo.com/) wrote every value as JSON text: `schemaVersion` was the string `"2"` and each app was a JSON string. A synced device that has not updated can still write those values, so:

- **Every read decodes JSON text** (`readStoredValue` / `watchStoredValue` in `src/utils/storage.ts`). The popup and the content script therefore work even before the migration runs.
- **The background migration rewrites old values** as plain values on startup (`src/utils/migrations.ts`). It sends every changed key in one `chrome.storage.sync.set` call, so an interrupted run is safe to repeat.

## Who reads and writes

- The popup only **reads** storage when it opens. It writes only when the user changes a setting or uses "Reset to factory settings".
- A missing app object, or a field missing from one, means "use the defaults". Defaults come from one place, `getDefaultAppState` in `src/constants.ts`. Readers apply them with `fillAppState`, and reading never writes them to storage.
- The background script runs the migration on startup (`src/utils/migrations.ts`).

## Schema Versions

### V2 Storage (Current)

Implemented around April 2026. This version groups configurations under per-application identifiers (`docs`, `sheets`).

**Why we migrated:**
The legacy flat-key structure created massive clutter in the root storage space. By encapsulating state within top-level application boundaries, we pave the way for supporting future tools (like Slides) without risking key conflicts or having to parse delimited string keys constantly. V1 keys are automatically migrated to this structure dynamically within the background script upon startup.

**Schema Shape:**

```json
{
  "schemaVersion": 2,
  "docs": {
    "zoomValue": "150%",
    "viewOnly": true,
    "classroomSupport": false
  },
  "sheets": {
    "zoomValue": "100%",
    "viewOnly": false,
    "classroomSupport": true
  }
}
```

**The Docs Fit value:**

`"fit"` is a valid Docs `zoomValue`. It is the same in every language, so a changed browser language or a synced device in another language does not break it. The popup shows it with the localized `popupDocsDropdownFitSelection` text and stores only `"fit"`.

Earlier versions stored the translated label (for example `"Fit"`, `"Ajustar"` or `"Anpassen"`). `fillAppState` maps those legacy labels (`LEGACY_FIT_LABELS` in `src/constants.ts`) to `"fit"` for `docs` when it reads. There is no write-back: the old label stays in storage until the user changes a setting in the popup. The schema version stays `2`. A device that still runs an earlier version treats a saved `"fit"` as a custom zoom until it updates.

**Migration from V1:**

The migration can be interrupted (for example when the service worker stops) and is safe to run again. On each startup:

1. `schemaVersion` below 2 and V1 keys exist: `docs`, `sheets` and `schemaVersion` are written in one `chrome.storage.sync.set` call, then all V1 keys are removed in one call. An app object that is already stored is kept; V1 values only fill in an app that has none, and defaults fill in any field the V1 keys lack. The migration builds each app object with `fillAppState`, so a V1 Fit label is written as `"fit"`.
2. `schemaVersion` below 2 and no V1 keys (a fresh install): only `schemaVersion` is written.
3. `schemaVersion` is 2 and V1 keys are left over from an interrupted run: only those keys are removed.
4. `schemaVersion` is 2 and any of `docs`, `sheets` or `schemaVersion` is still JSON text (a Plasmo build wrote it): those values are rewritten as plain values in one call.
5. `schemaVersion` is 2 and the values are already plain: nothing is written.

**Testing the upgrade locally:**

The settings page has a Dev Tools section in development builds. "Write Settings in Plasmo Format" rewrites the current settings as JSON text with `schemaVersion: "2"`, the way the old build stored them. Restart the extension and confirm the popup still shows the same zoom and that `chrome.storage.sync` now holds plain values. The same path is covered by unit tests (`src/utils/storage-dev-tools.test.ts`, `src/utils/migrations.test.ts`) and by one browser test (`e2e/zoom-fixtures.e2e.ts`, "Docs applies a preset zoom saved as JSON text by the Plasmo versions").

---

### V1 Storage (Legacy)

The original flat-key structure used before schema versioning was introduced.

**Schema Shape:**

```json
{
  "zoomValue": "150%",
  "zoomValue:viewOnly": true,
  "zoomValue:classroomSupport": false,
  "sheets:zoomValue": "100%",
  "sheets:zoomValue:viewOnly": false,
  "sheets:zoomValue:classroomSupport": true
}
```

_Note: In V1, missing keys were interpreted as standard disabled values or `100%` zoom defaults by the runtime, rather than being explicitly stored._

The Dev Tools section also has "Downgrade to V1 Format", which removes the V2 keys and recreates these flat keys. Restart the extension to test the V1 → V2 migration.
