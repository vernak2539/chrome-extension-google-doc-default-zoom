import { getClosestZoomValue } from "src/utils/get-closest-zoom-value"
import type { ExecutionLocation, UiStrategyConfig } from "../types"
import type { AbstractBaseStrategyImpl } from "./base"
import { AbstractBaseStrategy } from "./base"
import {
  clickDOMElement,
  getDOMElement,
  getDOMElementAndClick,
  getDOMElementCoordinates,
  simulateClick
} from "src/utils/ui-helpers"
import { pause } from "src/utils/pause"

class DocsStrategy
  extends AbstractBaseStrategy
  implements AbstractBaseStrategyImpl
{
  constructor(config: UiStrategyConfig) {
    super(config)
  }

  public execute(executionLocation: ExecutionLocation) {
    this.getZoomValueFromStorage().then((zoomValue) => {
      if (this.isViewOnly()) {
        this.uiExecuteDocsViewOnlyFlow(zoomValue)
      } else {
        this.uiExecuteFlow(zoomValue)
      }
    })
  }

  private isViewOnly() {
    const zoomInputContainer = document.querySelector(
      this.config.uiElements.clickableZoomSelectId
    )

    return !zoomInputContainer
  }

  private uiExecuteDocsViewOnlyFlow(zoomValue: string) {
    // view only Docs don't allow for custom zoom levels, but rather only allow the predefined ones
    let finalZoom = zoomValue

    // 1. check if zoom value is included in predefined list
    const isPredefinedList = this.config.zoom.zoomValues.includes(
      zoomValue as never
    )

    // 2. if not, find the closest zoom value in the predefined list (bias to towards higher)
    if (!isPredefinedList) {
      finalZoom = getClosestZoomValue(this.config.zoom.zoomValues, zoomValue)
    }

    // 3. set zoom value (new flow)
    getDOMElementAndClick(this.config.uiElements.menubarViewTabId)

    pause(500)
      .then(() => {
        let selector = "span[aria-label^='Zoom']"
        const selectorExists = getDOMElement(selector)

        if (selectorExists) {
          getDOMElementAndClick(selector)
          return
        }

        // This selector would work as well, but want to get the value of the box
        selector =
          ".docs-icon-img-container.docs-icon-img.docs-icon-editors-ia-zoom-in"
        getDOMElementAndClick(selector)
      })
      .then(() => {
        const zoomValueContainer = getDOMElement('[aria-label^="Fit"]').closest(
          ".goog-menu"
        )
        const zoomValueRows = zoomValueContainer.querySelectorAll(
          ".goog-menuitem.apps-menuitem"
        )

        let newZoomLevelElement = null
        for (let i = 0; i < zoomValueRows.length; i++) {
          if (zoomValueRows[i].firstChild.textContent === zoomValue) {
            newZoomLevelElement = zoomValueRows[i].firstChild
          }
        }

        if (!newZoomLevelElement) {
          // TODO: Close dropdowns
          return
        }

        clickDOMElement(newZoomLevelElement)
      })
  }
}

export default DocsStrategy
