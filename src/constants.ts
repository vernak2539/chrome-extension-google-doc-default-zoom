import type {
  AppStorageState,
  DocsStorageKey,
  DocsZoomValueFit,
  DocsZoomValues,
  SheetsStorageKey,
  StorageKey,
  SheetsZoomValues,
  UiStrategyConfig,
  WorkspaceApp,
  WorkspaceAppName
} from "src/types";
import { IS_EXTENDED_EDITION } from "src/utils/edition";
import localize from "src/utils/localize";

export const GOOGLE_CLASSROOM_DOMAIN = "classroom.google.com";

export const OBSERVE_EXECUTION_LIMIT = 1000;

export const SELECTOR_PAGE_HEADER = "#docs-chrome";

// These need to match the file names in ./src/background/messages/
export const RELAY_GET_APP_STORAGE_STATE = "get-app-storage-state";
export const RELAY_EXECUTE_ENTER = "execute-enter";
export const RELAY_REPORT_CONTENT_ERROR = "report-content-error";

/**  Workspace Application: Docs - Start **/
export const DOCS_STORAGE_KEY: DocsStorageKey = "docs";
export const DOCS_ZOOM_VALUES: DocsZoomValues = [
  localize("popupDocsDropdownFitSelection") as DocsZoomValueFit,
  "50%",
  "75%",
  "100%",
  "125%",
  "150%",
  "200%"
];
export const DOCS_DEFAULT_ZOOM = DOCS_ZOOM_VALUES[3];
/**  Workspace Application: Docs - End **/

/**  Workspace Application: Sheets - Start **/
export const SHEETS_STORAGE_KEY: SheetsStorageKey = "sheets";
export const SHEETS_ZOOM_VALUES: SheetsZoomValues = [
  "50%",
  "75%",
  "90%",
  "100%",
  "125%",
  "150%",
  "200%"
];
export const SHEETS_DEFAULT_ZOOM = SHEETS_ZOOM_VALUES[3];
/**  Workspace Application: Sheets - End **/

export const APPS: Record<StorageKey, WorkspaceApp> = {
  [DOCS_STORAGE_KEY]: {
    name: "Docs",
    defaultZoom: DOCS_DEFAULT_ZOOM,
    zoomValues: DOCS_ZOOM_VALUES,
    storageKey: DOCS_STORAGE_KEY,
    isEnabled: true,
    features: {
      customZoomInput: IS_EXTENDED_EDITION,
      enableViewOnlyToggle: true,
      classroomSupport: true
    },
    uiElements: {
      clickableZoomSelectId: "#zoomSelect",
      clickableZoomOptionClass: ".goog-menuitem",
      toolbarId: "#docs-toolbar",
      menubarViewTabId: "#docs-view-menu"
    }
  },
  [SHEETS_STORAGE_KEY]: {
    name: "Sheets",
    defaultZoom: SHEETS_DEFAULT_ZOOM,
    zoomValues: SHEETS_ZOOM_VALUES,
    storageKey: SHEETS_STORAGE_KEY,
    isEnabled: true,
    features: {
      customZoomInput: IS_EXTENDED_EDITION,
      enableViewOnlyToggle: false,
      classroomSupport: true
    },
    uiElements: {
      clickableZoomSelectId: "#t-zoom",
      clickableZoomOptionClass: ".goog-menuitem",
      toolbarId: "#docs-toolbar",
      menubarViewTabId: "#docs-view-menu"
    }
  }
};

/** The one place storage defaults are defined. An unknown key gets the "100%" zoom. */
export const getDefaultAppState = (storageKey?: string): AppStorageState => ({
  zoomValue: APPS[storageKey as StorageKey]?.defaultZoom ?? "100%",
  viewOnly: false,
  classroomSupport: false
});

/**
 * The one place a stored app state is filled in from the defaults: all of it when nothing is
 * stored, or each field a stored object lacks (for example one saved before the field existed).
 */
export const fillAppState = (
  storageKey: string | undefined,
  stored?: Partial<AppStorageState>
): AppStorageState => {
  const defaults = getDefaultAppState(storageKey);
  return {
    zoomValue: stored?.zoomValue ?? defaults.zoomValue,
    viewOnly: stored?.viewOnly ?? defaults.viewOnly,
    classroomSupport: stored?.classroomSupport ?? defaults.classroomSupport
  };
};

const toUiStrategyConfig = (app: WorkspaceApp): UiStrategyConfig => ({
  application: app.name,
  features: app.features,
  storageKey: app.storageKey,
  uiElements: app.uiElements,
  zoom: {
    defaultZoom: app.defaultZoom,
    zoomValues: app.zoomValues
  }
});

export const workspaceAppUiStrategyConfigs: Record<WorkspaceAppName, UiStrategyConfig> = {
  Docs: toUiStrategyConfig(APPS[DOCS_STORAGE_KEY]),
  Sheets: toUiStrategyConfig(APPS[SHEETS_STORAGE_KEY])
};
