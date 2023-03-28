import {
  DEFAULT_ZOOM as DOCS_DEFAULT_ZOOM,
  STORAGE_KEY as DOCS_STORAGE_KEY,
  ZOOM_VALUES as DOCS_ZOOM_VALUES
} from "~strategies/docs"
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
    defaultZoom: "",
    zoomValues: [""],
    storageKey: "",
    isEnabled: false
  }
]

export default workspaceApps
