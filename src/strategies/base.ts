import Logger from "~utils/logger";
import {getDOMElement, getDOMElementCoordinates, simulateClick} from "~utils/ui-helpers";
import getZoomValueFromStorage from "~utils/get-zoom-value-from-storage";
import {DEFAULT_ZOOM} from "~strategies/sheets";

interface BaseStrategyImpl {
  isViewOnly: boolean
  STORAGE_KEY: string
  CLICKABLE_ZOOM_SELECT_ID: string
  logger: Logger


  execute: (executionLocation: string) => void
  getIsZoomSelectorDisabled: () => void

}

export abstract class BaseStrategy implements BaseStrategyImpl {
  protected abstract isViewOnly: boolean;
  protected abstract STORAGE_KEY: string;
  protected abstract CLICKABLE_ZOOM_SELECT_ID: string;
  protected logger: Logger
  protected CLICKABLE_ZOOM_OPTION_CLASS: string = ".goog-menuitem"

  protected constructor(strategy: string, isViewOnly: boolean) {
    this.isViewOnly = isViewOnly
    this.logger = new Logger(strategy)
  }

  protected abstract getIsZoomSelectorDisabled(): boolean

  protected execute(executionLocation: string) {
    getZoomValueFromStorage(this.STORAGE_KEY).then((zoomValue) => {
      this._executeUIFlow(zoomValue)
      this.logger.info(
          `Zoom executed. Method: ${executionLocation}. Zoom Value: ${zoomValue}`
      )
    })
  }

  _executeUIFlow(zoomValue: string) {
    // don't do anything if zoom level is set to default value
    if (zoomValue === DEFAULT_ZOOM) {
      return
    }

    // get menu element responsible for changing zoom
    const zoomInput = getDOMElement(this.CLICKABLE_ZOOM_SELECT_ID)
    const { x: zoomInputX, y: zoomInputY } = getDOMElementCoordinates(zoomInput)
    simulateClick(zoomInput, zoomInputX, zoomInputY)

    // get zoom menu element dropdown
    const zoomInputAriaOwns = zoomInput.attributes["aria-owns"].value // this is the link
    const zoomInputSelect = getDOMElement(
        `.goog-menu.goog-menu-vertical[aria-activedescendant="${zoomInputAriaOwns}"]`
    )

    // figure out zoom value to select
    const zoomInputSelectOptions = zoomInputSelect.querySelectorAll(
        this.CLICKABLE_ZOOM_OPTION_CLASS
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