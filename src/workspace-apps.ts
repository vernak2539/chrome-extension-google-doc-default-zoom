import {
  DEFAULT_ZOOM as DOCS_DEFAULT_ZOOM,
  STORAGE_KEY as DOCS_STORAGE_KEY,
  ZOOM_VALUES as DOCS_ZOOM_VALUES
} from "~strategies/docs"
import {
  DEFAULT_ZOOM as SHEETS_DEFAULT_ZOOM,
  STORAGE_KEY as SHEETS_STORAGE_KEY,
  ZOOM_VALUES as SHEETS_ZOOM_VALUES
} from "~strategies/sheets"
import type { WorkspaceApp } from "~types"

const workspaceApps: WorkspaceApp[] = [
  {
    name: "Docs",
    defaultZoom: DOCS_DEFAULT_ZOOM,
    zoomValues: DOCS_ZOOM_VALUES,
    storageKey: DOCS_STORAGE_KEY,
    isEnabled: true
  },
  {
    name: "Sheets",
    defaultZoom: SHEETS_DEFAULT_ZOOM,
    zoomValues: SHEETS_ZOOM_VALUES,
    storageKey: SHEETS_STORAGE_KEY,
    isEnabled: false
  }
]

export default workspaceApps
