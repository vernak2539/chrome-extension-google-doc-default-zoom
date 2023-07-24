import { getClosestZoomValue } from "src/utils/get-closest-zoom-value"
import type { ExecutionLocation, UiStrategyConfig } from "../types"
import type { AbstractBaseStrategyImpl } from "./base"
import { AbstractBaseStrategy } from "./base"
import {
  getDOMElement,
  getDOMElementCoordinates,
  simulateClick
} from "src/utils/ui-helpers"

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
    const viewMenuBarBtn = getDOMElement(
      this.config.uiElements.menubarViewTabId
    )
    const { x: viewMenuBarBtnX, y: viewMenuBarBtnY } =
      getDOMElementCoordinates(viewMenuBarBtn)

    simulateClick(viewMenuBarBtn, viewMenuBarBtnX, viewMenuBarBtnY)

    console.log("VIEW ONLY")
  }
}

export default DocsStrategy
