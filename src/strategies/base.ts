import type { UiStrategyConfig } from "../types"
import getIsCustomZoom from "../utils/get-is-custom-zoom"
import getZoomValueFromStorage from "../utils/get-zoom-value-from-storage"
import {
  getDOMElement,
  getDOMElementCoordinates,
  simulateClick
} from "../utils/ui-helpers"

export interface AbstractBaseStrategyImpl {
  execute: (executionLocation: string) => void
  getIsZoomSelectorDisabled: () => boolean
  // These values need to be implemented on the abstract class... but TS interfaces
  // getIsViewOnly: () => boolean
  // config: UiStrategyConfig
  // getZoomValueFromStorage: () => Promise<string>
  // uiExecuteFlow: (zoomValue: string) => void
}

export abstract class AbstractBaseStrategy implements AbstractBaseStrategyImpl {
  protected readonly config: UiStrategyConfig
  public abstract execute(executionLocation: string): void
  // protected abstract getIsViewOnly(): boolean

  protected constructor(config: UiStrategyConfig) {
    this.config = config
  }

  protected getZoomValueFromStorage() {
    return getZoomValueFromStorage(this.config.storageKey)
  }

  protected uiExecuteFlow(zoomValue: string) {
    // don't do anything if zoom level is set to default value or not set
    if (!zoomValue || zoomValue === this.config.zoom.defaultZoom) {
      return
    }

    // add check for if strategy is supported or not for app
    if (getIsCustomZoom(zoomValue)) {
      this.uiExecuteCustomZoomFlow(zoomValue)
    } else {
      this.uiExecuteDefinedZoomFlow(zoomValue)
    }
  }

  private uiExecuteDefinedZoomFlow(zoomValue: string) {
    // will need to use the help menu most likely... trusted keyboard events cannot be done

    // get menu element responsible for changing zoom
    const zoomInput = getDOMElement(
      this.config.uiElements.clickableZoomSelectId
    )
    const { x: zoomInputX, y: zoomInputY } = getDOMElementCoordinates(zoomInput)
    simulateClick(zoomInput, zoomInputX, zoomInputY)

    // get zoom menu element dropdown
    const zoomInputAriaOwns = zoomInput.attributes["aria-owns"].value // this is the link
    const zoomInputSelect = getDOMElement(
      `.goog-menu.goog-menu-vertical[aria-activedescendant="${zoomInputAriaOwns}"]`
    )

    // figure out zoom value to select
    const zoomInputSelectOptions = zoomInputSelect.querySelectorAll(
      this.config.uiElements.clickableZoomOptionClass
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

  private uiExecuteCustomZoomFlow(zoomValue: string) {
    // open help menu
    // type in "zoom 113"
    // set small timeout for dropdown / observer
    // click first thing in dropdown
    // thing should close
  }

  public getIsZoomSelectorDisabled() {
    const zoomSelect = getDOMElement(
      this.config.uiElements.clickableZoomSelectId
    )
    return zoomSelect.classList.contains("goog-toolbar-combo-button-disabled")
  }
}
