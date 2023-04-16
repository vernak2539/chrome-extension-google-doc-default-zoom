import type { UiStrategyConfig } from "../types"
import { AbstractBaseStrategy, AbstractBaseStrategyImpl } from "./base"

class SheetsStrategy
  extends AbstractBaseStrategy
  implements AbstractBaseStrategyImpl
{
  constructor(config: UiStrategyConfig) {
    super(config)
  }

  execute(executionLocation: string) {
    this.getZoomValueFromStorage().then((zoomValue) => {
      this.uiExecuteFlow(zoomValue)
    })
  }

  // getIsViewOnly() {
  //   return false
  // }
}

export default SheetsStrategy
