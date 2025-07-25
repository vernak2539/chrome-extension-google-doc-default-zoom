import type {
  DocsStorageKey,
  DocsZoomValueFit,
  DocsZoomValues,
  SheetsStorageKey,
  SheetsZoomValues,
  UiStrategyConfig,
  WorkspaceApp,
  WorkspaceAppName
} from "src/types";
import localize from "src/utils/localize";

export const GOOGLE_CLASSROOM_DOMAIN = "classroom.google.com";

export const OBSERVE_EXECUTION_LIMIT = 1000;

export const SELECTOR_PAGE_HEADER = "#docs-chrome";

// This needs to match the file name ./src/background/messages/get-zoom-value.ts
export const RELAY_GET_ZOOM_VALUE_FROM_STORAGE = "get-zoom-value";
export const RELAY_GET_FEATURE_VIEW_ONLY_FROM_STORAGE = "get-feature-view-only";
export const RELAY_GET_FEATURE_CLASSROOM_SUPPORT_FROM_STORAGE =
  "get-feature-classroom-support";
export const RELAY_EXECUTE_ENTER = "execute-enter";

/**  Workspace Application: Docs - Start **/
export const DOCS_STORAGE_KEY: DocsStorageKey = "zoomValue";
export const DOCS_ZOOM_VALUES: DocsZoomValues = [
  localize("popupDocsDropdownFitSelection") as DocsZoomValueFit,
  "50%",
  "75%",
  "100%",
  "125%",
  "150%",
  "200%"
];
export const DOCS_DEFAULT_ZOOM = DOCS_ZOOM_VALUES.at(3);
/**  Workspace Application: Docs - End **/

/**  Workspace Application: Sheets - Start **/
export const SHEETS_STORAGE_KEY: SheetsStorageKey = "sheets:zoomValue";
export const SHEETS_ZOOM_VALUES: SheetsZoomValues = [
  "50%",
  "75%",
  "90%",
  "100%",
  "125%",
  "150%",
  "200%"
];
export const SHEETS_DEFAULT_ZOOM = SHEETS_ZOOM_VALUES.at(3);
/**  Workspace Application: Sheets - End **/

export const getFeatureViewOnlyStorageKey = (storageKey: string) =>
  `${storageKey}:viewOnly`;

export const getFeatureClassroomSupportStorageKey = (storageKey: string) =>
  `${storageKey}:classroomSupport`;

export const workspaceApps: WorkspaceApp[] = [
  {
    name: "Docs",
    defaultZoom: DOCS_DEFAULT_ZOOM,
    zoomValues: DOCS_ZOOM_VALUES,
    storageKey: DOCS_STORAGE_KEY,
    isEnabled: true,
    features: {
      customZoomInput: true,
      enableViewOnlyToggle: true,
      classroomSupport: true
    }
  },
  {
    name: "Sheets",
    defaultZoom: SHEETS_DEFAULT_ZOOM,
    zoomValues: SHEETS_ZOOM_VALUES,
    storageKey: SHEETS_STORAGE_KEY,
    isEnabled: true,
    features: {
      customZoomInput: true,
      enableViewOnlyToggle: false,
      classroomSupport: true
    }
  }
];

export const workspaceAppUiStrategyConfigs: Record<
  WorkspaceAppName,
  UiStrategyConfig
> = {
  Docs: {
    application: "Docs",
    features: workspaceApps.find((app) => app.name === "Docs").features,
    storageKey: DOCS_STORAGE_KEY,
    uiElements: {
      clickableZoomSelectId: "#zoomSelect",
      clickableZoomOptionClass: ".goog-menuitem",
      toolbarHelpMenuId: "#docs-help-menu", // this is required for features.customZoomInput = true
      toolbarId: "#docs-toolbar",
      menubarViewTabId: "#docs-view-menu"
    },
    zoom: {
      defaultZoom: DOCS_DEFAULT_ZOOM,
      zoomValues: DOCS_ZOOM_VALUES
    }
  },
  Sheets: {
    application: "Sheets",
    features: workspaceApps.find((app) => app.name === "Sheets").features,
    storageKey: SHEETS_STORAGE_KEY,
    uiElements: {
      clickableZoomSelectId: "#t-zoom",
      clickableZoomOptionClass: ".goog-menuitem",
      toolbarId: "#docs-toolbar",
      menubarViewTabId: "#docs-view-menu"
    },
    zoom: {
      defaultZoom: SHEETS_DEFAULT_ZOOM,
      zoomValues: SHEETS_ZOOM_VALUES
    }
  }
};
