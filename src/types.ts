export interface GetZoomValueRequestBody {
  storageKey: string
}

export interface GetZoomValueResponseBody {
  zoomValue: string
}

export interface GetFeatureViewOnlyRequestBody {
  storageKey: string
}

export interface GetFeatureViewOnlyResponseBody {
  enabled: boolean
}

export interface ExecuteEnterRequestBody {
  zoomValue: string
}

export type WorkspaceAppName = "Docs" | "Sheets"
export type DocsZoomValueFit =
  | "Fit"
  | "Adatta"
  | "Anpassen"
  | "Ajuster"
  | "Подогнать"
  | "フィット"
  | "Ajustar"

export type DocsStorageKey = "zoomValue"
export type DocsZoomValues = [
  DocsZoomValueFit,
  "50%",
  "75%",
  "100%",
  "125%",
  "150%",
  "200%"
]

export type SheetsStorageKey = "sheets:zoomValue"
export type SheetsZoomValues = [
  "50%",
  "75%",
  "90%",
  "100%",
  "125%",
  "150%",
  "200%"
]

export type StorageKey = DocsStorageKey | SheetsStorageKey

export interface WorkspaceApp {
  /* Name of the Google Workspace Application */
  name: WorkspaceAppName

  /*
   * Zoom level to be used by default (i.e. prior to custom selection)
   * This will be the zoom level that the Workspace application uses by default
   */
  defaultZoom: string

  /* Possible values to zoom (i.e. zoom values in dropdown list) */
  zoomValues: DocsZoomValues | SheetsZoomValues

  /* Key defining where the zoom value is stored in chrome.storage */
  storageKey: string

  /* If the app is enabled in the extension */
  isEnabled: boolean

  /* Features for the app and their state of enablement */
  features: {
    /* Whether to enable the custom zoom input for an application */
    customZoomInput: boolean

    /* Whether to enable the view only toggle for an application */
    enableViewOnlyToggle: boolean
  }
}

export type ExtensionFileSource = "popup" | "content" | "background"

export interface UiStrategyConfig {
  application: WorkspaceAppName
  features: WorkspaceApp["features"]
  storageKey: StorageKey
  uiElements: {
    clickableZoomSelectId: string
    clickableZoomOptionClass: string
    toolbarHelpMenuId?: string
    toolbarId?: string
    menubarViewTabId?: string
  }
  zoom: {
    defaultZoom: string
    zoomValues: DocsZoomValues | SheetsZoomValues
  }
}

export type Feature = keyof WorkspaceApp["features"]

export type ExecutionLocation = "observer" | "inline"

export type GetFromStorageFn<T> = (storageKey: string) => Promise<T>
