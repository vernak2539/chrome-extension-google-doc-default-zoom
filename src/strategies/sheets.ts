import type {
  SheetsStorageKey,
  SheetsZoomValues,
  UiStrategyConfig
} from "../types"
import { AbstractBaseStrategy, AbstractBaseStrategyImpl } from "./base"

export const STORAGE_KEY: SheetsStorageKey = "sheets:zoomValue"
export const ZOOM_VALUES: SheetsZoomValues = [
  "50%",
  "75%",
  "90%",
  "100%",
  "125%",
  "150%",
  "200%"
]
export const DEFAULT_ZOOM = ZOOM_VALUES.at(3)

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
