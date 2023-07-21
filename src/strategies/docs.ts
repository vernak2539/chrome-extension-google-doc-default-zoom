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
    // find closes zoom value if custom
    console.log("VIEW ONLY")
  }
}

export default DocsStrategy
