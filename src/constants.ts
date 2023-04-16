import type {
  DocsStorageKey,
  DocsZoomValues,
  SheetsStorageKey,
  SheetsZoomValues
} from "./types"

export const OBSERVE_EXECUTION_LIMIT = 1000

// This needs to match the file name ./src/background/messages/get-zoom-value.ts
export const RELAY_GET_ZOOM_VALUE_FROM_STORAGE = "get-zoom-value"

// Workspace Application: Docs
export const DOCS_STORAGE_KEY: DocsStorageKey = "zoomValue"
export const DOCS_ZOOM_VALUES: DocsZoomValues = [
  "Fit",
  "50%",
  "75%",
  "100%",
  "125%",
  "150%",
  "200%"
]
export const DOCS_DEFAULT_ZOOM = DOCS_ZOOM_VALUES.at(3)

// Workspace Application: Sheets
export const SHEETS_STORAGE_KEY: SheetsStorageKey = "sheets:zoomValue"
export const SHEETS_ZOOM_VALUES: SheetsZoomValues = [
  "50%",
  "75%",
  "90%",
  "100%",
  "125%",
  "150%",
  "200%"
]
export const SHEETS_DEFAULT_ZOOM = SHEETS_ZOOM_VALUES.at(3)
