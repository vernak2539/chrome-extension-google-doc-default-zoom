export interface BaseStrategy {
  execute: (executionLocation: string) => void
  getIsZoomSelectorDisabled: () => void
  _getZoomValueFromStorage: () => Promise<string>
  _executeUIFlow: (zoomValue: string) => void
}
