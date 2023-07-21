import type { UiStrategyConfig } from "../types"
import type { AbstractBaseStrategyImpl } from "./base"
import { AbstractBaseStrategy } from "./base"

class DocsStrategy
  extends AbstractBaseStrategy
  implements AbstractBaseStrategyImpl
{
  constructor(config: UiStrategyConfig) {
    super(config)
  }

  public execute(executionLocation: string) {
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
    // 1. check if zoom value is included in predefined list
    // 2. if not, find the closes zoom value (bias to towards higher)\
    // 3. set zoom value (new flow)

    console.log("VIEW ONLY")
  }
}

export default DocsStrategy
