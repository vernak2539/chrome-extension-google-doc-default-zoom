import type { BaseStrategy } from "~strategies/base"
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

// UI Selectors
const CLICKABLE_ZOOM_SELECT_ID = "#t-zoom"
const CLICKABLE_ZOOM_OPTION_CLASS = ".goog-menuitem"

class DocsStrategy implements BaseStrategy {
  private isViewOnly: boolean
  private readonly logger: Logger
  public readonly STORAGE_KEY: string = STORAGE_KEY

  constructor({ isViewOnly }) {
    this.isViewOnly = isViewOnly
    this.logger = new Logger("Sheets")
  }

  getIsZoomSelectorDisabled() {
    const zoomSelect = getDOMElement(CLICKABLE_ZOOM_SELECT_ID)
    return zoomSelect.classList.contains("goog-toolbar-combo-button-disabled")
  }

  execute(executionLocation: string) {
    this._getZoomValueFromStorage().then((zoomValue) => {
      this._executeUIFlow(zoomValue)
      this.logger.info(
        `Zoom executed. Method: ${executionLocation}. Zoom Value: ${zoomValue}`
      )
    })
  }

  _getZoomValueFromStorage() {
    return getZoomValueFromStorage(this.STORAGE_KEY)
  }

  _executeUIFlow(zoomValue: string) {
    // don't do anything if zoom level is set to default value
    if (zoomValue === DEFAULT_ZOOM) {
      return
    }

    // get menu element responsible for changing zoom
    const zoomInput = getDOMElement(CLICKABLE_ZOOM_SELECT_ID)
    const { x: zoomInputX, y: zoomInputY } = getDOMElementCoordinates(zoomInput)
    simulateClick(zoomInput, zoomInputX, zoomInputY)

    // get zoom menu element dropdown
    const zoomInputAriaOwns = zoomInput.attributes["aria-owns"].value // this is the link
    const zoomInputSelect = getDOMElement(
      `.goog-menu.goog-menu-vertical[aria-activedescendant="${zoomInputAriaOwns}"]`
    )

    // figure out zoom value to select
    const zoomInputSelectOptions = zoomInputSelect.querySelectorAll(
      CLICKABLE_ZOOM_OPTION_CLASS
    )

    let newZoomLevelElement = null
    for (let i = 0; i < zoomInputSelectOptions.length; i++) {
      if (zoomInputSelectOptions[i].firstChild.textContent === zoomValue) {
        newZoomLevelElement = zoomInputSelectOptions[i].firstChild
      }
    }

    // somehow we may not have matched the right element
    if (!newZoomLevelElement) {
      return
    }

    // select new zoom level
    const { x: newZoomOptionX, y: newZoomOptionY } =
      getDOMElementCoordinates(newZoomLevelElement)
    simulateClick(newZoomLevelElement, newZoomOptionX, newZoomOptionY)

    // close dropdown with blur event (may need to check again to see if it's closed)
    setTimeout(() => {
      simulateClick(getDOMElement("canvas"), 0, 0)
    }, 500)
  }
}

export default DocsStrategy
