import type { DocsStorageKey, DocsZoomValues, StorageKey } from "../types"
import type { UiStrategyConfig } from "../types"
import { AbstractBaseStrategy, BaseStrategy } from "./base"

export const STORAGE_KEY: DocsStorageKey = "zoomValue"
export const ZOOM_VALUES: DocsZoomValues = [
  "Fit",
  "50%",
  "75%",
  "100%",
  "125%",
  "150%",
  "200%"
]
export const DEFAULT_ZOOM = ZOOM_VALUES.at(3)

class DocsStrategy extends BaseStrategy implements AbstractBaseStrategy {
  constructor(config: UiStrategyConfig) {
    super(config)
  }

  public execute(executionLocation: string) {
    this.getZoomValueFromStorage().then((zoomValue) => {
      this.uiExecuteFlow(zoomValue)
    })
  }

  // getIsViewOnly() {
  //   return false
  // }
}

export default DocsStrategy
