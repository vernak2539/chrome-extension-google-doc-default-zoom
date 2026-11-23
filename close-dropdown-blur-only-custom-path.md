---
topic: strategies
source_issue: 159
---

`closeDropdown(zoomInputContainer)` in `src/strategies/base.ts` blurs `zoomInputContainer.querySelector("input")` and then calls `getDOMElementAndClick("body")`. Only `uiExecuteCustomZoomFlow` focuses that input; the preset and failure paths open the menu with synthetic mouse events (`src/utils/ui-helpers.ts`) that do not move focus, so the blur alone does nothing there and the `body` mousedown is what closes the menu. The e2e recorder records these as `dismissals` (mousedown targets outside `#zoomSelect, #t-zoom, .goog-menu`). Tests: 'closing the zoom dropdown' in `src/strategies/base.test.ts`.
