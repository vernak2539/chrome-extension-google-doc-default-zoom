# Data Storage Schema

Over time, this extension has migrated its Chrome storage structure (`chrome.storage.local`) to improve maintainability and expandability. If you are ever debugging or looking into the local storage data, this document outlines what each schema version looks like.

## Schema Versions

### V2 Storage (Current)
Implemented around April 2026. This version groups configurations securely under per-application identifiers (`docs`, `sheets`). 

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

*Note: In V1, missing keys were interpreted as standard disabled values or `100%` zoom defaults by the runtime, rather than being explicitly stored.*
