import { BaseStrategy } from "~strategies/base"
import getZoomValueFromStorage from "~utils/get-zoom-value-from-storage"
import Logger from "~utils/logger"
import {
  getDOMElement,
  getDOMElementCoordinates,
  simulateClick
} from "~utils/ui-helpers"

export const STORAGE_KEY = "sheets:zoomValue"
export const ZOOM_VALUES = ["50%", "75%", "90%", "100%", "125%", "150%", "200%"]
export const DEFAULT_ZOOM = ZOOM_VALUES.at(3)

class DocsStrategy extends BaseStrategy {
  public readonly STORAGE_KEY: string = STORAGE_KEY
  public readonly CLICKABLE_ZOOM_SELECT_ID: string = "#t-zoom"

  constructor(isViewOnly) {
    super('Sheets', isViewOnly)
  }

  getIsZoomSelectorDisabled() {
    const zoomSelect = getDOMElement(this.CLICKABLE_ZOOM_SELECT_ID)
    return zoomSelect.classList.contains("goog-toolbar-combo-button-disabled")
  }
}

export default DocsStrategy
