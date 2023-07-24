import { getClosestZoomValue } from "src/utils/get-closest-zoom-value"
import type { ExecutionLocation, UiStrategyConfig } from "../types"
import type { AbstractBaseStrategyImpl } from "./base"
import { AbstractBaseStrategy } from "./base"
import {
  clickDOMElement,
  getDOMElement,
  getDOMElementAndClick
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
    // should there be a "feature flag" to enable, as it's a bit wonky?? Yes...
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

    // this may need to change depending on how quickly the menu loads
    pause(1000)
      .then(() => {
        let selector = "span[aria-label^='Zoom']"
        const selectorExists = getDOMElement(selector)

        if (selectorExists) {
          getDOMElementAndClick(selector)
          return
        }

        // fallback selector (trying to account for potential translation differences)
        selector =
          ".docs-icon-img-container.docs-icon-img.docs-icon-editors-ia-zoom-in"
        getDOMElementAndClick(selector)
      })
      .then(() => {
        // This is hacky, not sure a better way to do this...
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
          getDOMElementAndClick("body")
          return
        }

        clickDOMElement(newZoomLevelElement)
      })
  }
}

export default DocsStrategy
