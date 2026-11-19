export interface GetAppStorageStateRequestBody {
  storageKey: string;
}

export interface ExecuteEnterRequestBody {
  zoomValue: string;
}

export interface ExecuteEnterResponseBody {
  err: null | "no_debugger" | "debugger_failed";
}

export type ZoomSkipReason = "classroom_support_disabled" | "default_zoom" | "view_only";

// Each reason names a step and a selector of the zoom flow. None of them hold document data.
export type ZoomFailReason =
  | "zoom_select_missing"
  | "zoom_menu_missing"
  | "zoom_option_missing"
  | "zoom_input_missing"
  | "view_menu_missing"
  | "view_zoom_item_missing"
  | "view_zoom_menu_missing"
  | "view_zoom_option_missing"
  | "watch_element_missing"
  | "page_load_timeout"
  | "exception";

export type ZoomOutcome =
  | { status: "applied" }
  | { status: "skipped"; reason: ZoomSkipReason }
  | { status: "failed"; reason: ZoomFailReason; error?: unknown };

export type WorkspaceAppName = "Docs" | "Sheets";

export interface AppStorageState {
  zoomValue: string;
  viewOnly: boolean;
  classroomSupport: boolean;
}
/** The stored value for Docs "Fit". It is never translated; the popup shows the localized label. */
export type DocsZoomValueFit = "fit";

export type DocsStorageKey = "docs";
export type DocsZoomValues = [DocsZoomValueFit, "50%", "75%", "100%", "125%", "150%", "200%"];

export type SheetsStorageKey = "sheets";
export type SheetsZoomValues = ["50%", "75%", "90%", "100%", "125%", "150%", "200%"];

export type StorageKey = DocsStorageKey | SheetsStorageKey;

export interface UiElements {
  clickableZoomSelectId: string;
  clickableZoomOptionClass: string;
  toolbarId: string;
  menubarViewTabId: string;
}

export interface WorkspaceApp {
  /* Name of the Google Workspace Application */
  name: WorkspaceAppName;

  /*
   * Zoom level to be used by default (i.e. prior to custom selection)
   * This will be the zoom level that the Workspace application uses by default
   */
  defaultZoom: string;

  /* Possible values to zoom (i.e. zoom values in dropdown list) */
  zoomValues: DocsZoomValues | SheetsZoomValues;

  /* Key defining where the zoom value is stored in chrome.storage */
  storageKey: StorageKey;

  /* Selectors for the application's zoom controls */
  uiElements: UiElements;

  /* If the app is enabled in the extension */
  isEnabled: boolean;

  /* Features for the app and their state of enablement */
  features: {
    /* Whether to enable the custom zoom input for an application */
    customZoomInput: boolean;

    /* Whether to enable the view only toggle for an application */
    enableViewOnlyToggle: boolean;

    /* Whether to enable classroom support for an application */
    classroomSupport: boolean;
  };
}

export type ExtensionFileSource = "popup" | "content" | "background" | "tab";

export interface UiStrategyConfig {
  application: WorkspaceAppName;
  features: WorkspaceApp["features"];
  storageKey: StorageKey;
  uiElements: UiElements;
  zoom: {
    defaultZoom: string;
    zoomValues: DocsZoomValues | SheetsZoomValues;
  };
}

export type Feature = keyof WorkspaceApp["features"];

export type GetFromStorageFn<T> = (storageKey: string) => Promise<T>;
