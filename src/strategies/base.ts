import type { UiStrategyConfig } from "../types"
import getIsCustomZoom from "../utils/get-is-custom-zoom"
import getNumericZoom from "../utils/get-numeric-zoom"
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
    // THIS IS IMPOSSIBLE AT THE TIME DUE TO NOT BEING ABLE TO TRIGGER EVENTS BASED ON INPUTS CHANGING
    // WILL BE LEAVING THIS HERE FOR NOW...

    // open help menu
    const helpMenu = getDOMElement(this.config.uiElements.toolbarHelpMenuId)
    const { x: zoomInputX, y: zoomInputY } = getDOMElementCoordinates(helpMenu)
    simulateClick(helpMenu, zoomInputX, zoomInputY)

    // - find the dropdown due to client height - document.querySelectorAll(".docs-omnibox-input.jfk-textinput.label-input-label")

    // find the dropdown that is visible after clicking "help"
    const allDropdownMenus = document.querySelectorAll(
      ".goog-menu.goog-menu-vertical.docs-material.ia-menu.ia-primary-menu"
    )
    console.log(allDropdownMenus)
    const helpDropdownMenuIndex = Array.from(allDropdownMenus).findIndex(
      (menu) => Boolean(menu.clientHeight)
    )
    const helpDropdownMenu = allDropdownMenus[helpDropdownMenuIndex]

    console.log(helpDropdownMenu)
    console.log(helpDropdownMenu.querySelectorAll("input"))

    const helpDropdownInput = helpDropdownMenu.querySelectorAll("input")[0]

    // type in "zoom 113"
    setTimeout(() => {
      helpDropdownInput.value = `zoom ${getNumericZoom(zoomValue)}`
      // helpDropdownInput.select()
      helpDropdownInput.focus()

      helpDropdownInput.dispatchEvent(new InputEvent("input"))
      helpDropdownInput.dispatchEvent(
        new KeyboardEvent("keyup", { key: "Enter" })
      )
    }, 1000)

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
