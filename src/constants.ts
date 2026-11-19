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

export const GOOGLE_CLASSROOM_DOMAIN = "classroom.google.com";

export const OBSERVE_EXECUTION_LIMIT = 1000;

export const SELECTOR_PAGE_HEADER = "#docs-chrome";

// This needs to match the file name ./src/background/messages/get-app-storage-state.ts
export const RELAY_GET_APP_STORAGE_STATE = "get-app-storage-state";
export const RELAY_EXECUTE_ENTER = "execute-enter";

/**  Workspace Application: Docs - Start **/
export const DOCS_STORAGE_KEY: DocsStorageKey = "docs";
export const DOCS_ZOOM_VALUE_FIT: DocsZoomValueFit = "fit";

// Every translation of popupDocsDropdownFitSelection in locales/*/messages.json. Docs shows the
// Fit row in the Chrome language, and older versions stored the label itself as the zoom value.
export const DOCS_FIT_LABELS = [
  "Fit",
  "Ajustar",
  "Adatta",
  "Anpassen",
  "Ajuster",
  "Подогнать",
  "フィット"
] as const;

export const DOCS_ZOOM_VALUES: DocsZoomValues = [
  DOCS_ZOOM_VALUE_FIT,
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

/** Turns a translated Docs "Fit" label that an older version stored into the stable `"fit"`. */
export const toStableZoomValue = (zoomValue: string): string =>
  (DOCS_FIT_LABELS as readonly string[]).includes(zoomValue) ? DOCS_ZOOM_VALUE_FIT : zoomValue;

/** The texts a zoom menu row can have for a stored zoom value: every Fit translation, or the value. */
export const getZoomRowLabels = (zoomValue: string): readonly string[] =>
  zoomValue === DOCS_ZOOM_VALUE_FIT ? DOCS_FIT_LABELS : [zoomValue];

/**
 * The one place a stored app state is filled in from the defaults: all of it when nothing is
 * stored, or each field a stored object lacks (for example one saved before the field existed).
 * It also reads a legacy translated "Fit" as `"fit"`, as another device can still sync one.
 */
export const fillAppState = (
  storageKey: string | undefined,
  stored?: Partial<AppStorageState>
): AppStorageState => {
  const defaults = getDefaultAppState(storageKey);
  return {
    zoomValue: toStableZoomValue(stored?.zoomValue ?? defaults.zoomValue),
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
