export interface GetZoomValueRequestBody {
  storageKey: string
}

export interface GetZoomValueResponseBody {
  zoomValue: string
}

export type WorkspaceAppName = "Docs" | "Sheets"

export interface WorkspaceApp {
  /* Name of the Google Workspace Application */
  name: WorkspaceAppName

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
