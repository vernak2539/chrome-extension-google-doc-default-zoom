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

    if (getIsCustomZoom(zoomValue)) {
      this.uiExecuteDefinedZoomFlow(zoomValue)
    } else {
      this.uiExecuteCustomZoomFlow(zoomValue)
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
    // debugger
    //
    // zoomInput.addEventListener("keydown", (e) => {
    //   console.log(e)
    // })
    //
    // const inputBox = zoomInput.querySelector("input")
    // inputBox.addEventListener("keydown", (e) => {
    //   console.log(e)
    // })
    //
    // inputBox.value = "130"
    // inputBox.select()
    // inputBox.dispatchEvent(new Event("input"))
    // inputBox.dispatchEvent(new Event("input"))

    // const zoomInput = document.querySelector('.docs-menu-input');
    // zoomInput.focus();
    // zoomInput.value = '150';
    // zoomInput.dispatchEvent(new Event('input'));
    // const keydownEvent = new KeyboardEvent("keydown", {
    //   key: "Enter",
    //   bubbles: true,
    //   cancelable: true
    // })
    // inputBox.dispatchEvent(keydownEvent)
    //
    // // Create and dispatch an input event
    // const inputEvent = new Event("input", {
    //   bubbles: true,
    //   cancelable: true
    // })
    // inputBox.dispatchEvent(inputEvent)
    //
    // // Create and dispatch a keyup event for the Enter key
    // const keyupEvent = new KeyboardEvent("keyup", {
    //   key: "Enter",
    //   bubbles: true,
    //   cancelable: true
    // })
    // inputBox.dispatchEvent(keyupEvent)

    // const ev = new KeyboardEvent("keydown", {
    //   view: window,
    //   bubbles: true,
    //   cancelable: true,
    //   code: "Enter",
    //   key: "Enter",
    //   keyCode: 13,
    //   which: 13
    //   // clientX: 1,
    //   // clientY: 1
    // })
    // Object.defineProperty(ev, "isTrusted", { value: true })
    //
    // console.log(ev)
    // inputBox.dispatchEvent(ev)
    // inputBox.dispatchEvent(
    //   new KeyboardEvent("keyup", {
    //     view: window,
    //     bubbles: true,
    //     cancelable: true,
    //     code: "Enter",
    //     key: "Enter",
    //     keyCode: 13,
    //     which: 13
    //     // clientX: 1,
    //     // clientY: 1
    //   })
    // )
    // inputBox.dispatchEvent(
    //   new KeyboardEvent("keypress", {
    //     view: window,
    //     bubbles: true,
    //     cancelable: true,
    //     key: "Enter"
    //     // clientX: 1,
    //     // clientY: 1
    //   })
    // )
    // inputBox.dispatchEvent(
    //   new KeyboardEvent("keyup", {
    //     view: window,
    //     bubbles: true,
    //     cancelable: true,
    //     key: "Enter"
    //
    //     // clientX: 1,
    //     // clientY: 1
    //   })
    // )

    // stop for now when the thing is open
    return
  }

  public getIsZoomSelectorDisabled() {
    const zoomSelect = getDOMElement(
      this.config.uiElements.clickableZoomSelectId
    )
    return zoomSelect.classList.contains("goog-toolbar-combo-button-disabled")
  }
}
