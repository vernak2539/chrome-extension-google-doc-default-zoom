import type { ExecutionLocation, UiStrategyConfig } from "../types"
import { AbstractBaseStrategy, type AbstractBaseStrategyImpl } from "./base"

class SheetsStrategy
  extends AbstractBaseStrategy
  implements AbstractBaseStrategyImpl
{
  constructor(config: UiStrategyConfig) {
    super(config)
  }

  execute(executionLocation: ExecutionLocation) {
    this.getZoomValueFromStorage().then((zoomValue) => {
      this.uiExecuteFlow(zoomValue)
    })
  }

  // getIsViewOnly() {
  //   return false
  // }
}

export default SheetsStrategy
