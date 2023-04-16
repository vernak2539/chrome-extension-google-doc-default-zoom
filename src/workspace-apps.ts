import {
  DOCS_DEFAULT_ZOOM,
  DOCS_STORAGE_KEY,
  DOCS_ZOOM_VALUES,
  SHEETS_DEFAULT_ZOOM,
  SHEETS_STORAGE_KEY,
  SHEETS_ZOOM_VALUES
} from "./constants"
import type { UiStrategyConfig, WorkspaceApp, WorkspaceAppName } from "./types"

export const workspaceApps: WorkspaceApp[] = [
  {
    name: "Docs",
    defaultZoom: DOCS_DEFAULT_ZOOM,
    zoomValues: DOCS_ZOOM_VALUES,
    storageKey: DOCS_STORAGE_KEY,
    isEnabled: true,
    features: {
      customZoomInput: true
    }
  },
  {
    name: "Sheets",
    defaultZoom: SHEETS_DEFAULT_ZOOM,
    zoomValues: SHEETS_ZOOM_VALUES,
    storageKey: SHEETS_STORAGE_KEY,
    isEnabled: true,
    features: {
      customZoomInput: false
    }
  }
]

export const workspaceAppUiStrategyConfigs: Record<
  WorkspaceAppName,
  UiStrategyConfig
> = {
  Docs: {
    application: "Docs",
    storageKey: DOCS_STORAGE_KEY,
    uiElements: {
      clickableZoomSelectId: "#zoomSelect",
      clickableZoomOptionClass: ".goog-menuitem"
    },
    zoom: {
      defaultZoom: DOCS_DEFAULT_ZOOM
    }
  },
  Sheets: {
    application: "Sheets",
    storageKey: SHEETS_STORAGE_KEY,
    uiElements: {
      clickableZoomSelectId: "#t-zoom",
      clickableZoomOptionClass: ".goog-menuitem"
    },
    zoom: {
      defaultZoom: SHEETS_DEFAULT_ZOOM
    }
  }
}
