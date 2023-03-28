import {
  DEFAULT_ZOOM as DOCS_DEFAULT_ZOOM,
  STORAGE_KEY as DOCS_STORAGE_KEY,
  ZOOM_VALUES as DOCS_ZOOM_VALUES
} from "~strategies/docs"

export interface WorkspaceApp {
  /* Name of the Google Workspace Application */
  name: string

  /*
   * Zoom level to be used by default (i.e. prior to custom selection)
   * This will be the zoom level that the Workspace application uses by default
   */
  defaultZoom: string

  /* Possible values to zoom (i.e. zoom values in dropdown list) */
  zoomValues: string[]

  /* Key defining where the zoom value is stored in chrome.storage */
  storageKey: string

  /* If the app is enabled in the extension */
  isEnabled: boolean
}

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
