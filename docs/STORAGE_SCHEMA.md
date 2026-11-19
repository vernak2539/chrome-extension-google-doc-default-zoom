# Data Storage Schema

Over time, this extension has migrated its Chrome storage structure to improve maintainability and expandability. If you are ever debugging or looking into the stored data, this document outlines where it lives and what each schema version looks like.

## Where data is stored

- **Settings** (everything below) live in `chrome.storage.sync`. All code reaches them through the shared `storage` instance in `src/utils/storage.ts`, which names the area explicitly.
- **Announcement dismissals** live in `chrome.storage.local`, because they are per-device UI state (`src/components/Announcement/hooks.ts`).
- [Plasmo's storage](https://docs.plasmo.com/framework/storage) stores each value as a JSON string. In the shapes below, `schemaVersion` is stored as the string `"2"` and each app object as a JSON string; the examples show the parsed values.

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

**Migration from V1:**

The migration can be interrupted (for example when the service worker stops) and is safe to run again. On each startup:

1. `schemaVersion` below 2 and V1 keys exist: `docs`, `sheets` and `schemaVersion` are written in one `chrome.storage.sync.set` call, then all V1 keys are removed in one call. An app object that is already stored is kept; V1 values only fill in an app that has none, and defaults fill in any field the V1 keys lack.
2. `schemaVersion` below 2 and no V1 keys (a fresh install): only `schemaVersion` is written.
3. `schemaVersion` is 2 and V1 keys are left over from an interrupted run: only those keys are removed.

**Docs "Fit" zoom value (still schema version 2):**

`docs.zoomValue` is `"fit"` for the Docs Fit zoom. It is never a translated label; the popup shows the localized text and the content script matches the Docs menu row against every translation. Older versions stored the translated label itself (`Fit`, `Ajustar`, `Adatta`, `Anpassen`, `Ajuster`, `Подогнать`, `フィット`). On each startup, a stored `docs.zoomValue` with one of those labels is rewritten to `"fit"` in its own write, with the other fields kept. Every reader also maps a legacy label to `"fit"` (`fillAppState`), because a device that has not updated can still sync one.

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
