---
topic: strategies
---

`uiExecuteDefinedZoomFlow` in `src/strategies/base.ts` matches toolbar dropdown rows with strict `firstChild.textContent === zoomValue` (last match wins), except for the Fit value (`isFitZoomValue`), which goes through `findFitRowIndex`. The Docs view-only flow uses `findZoomRowIndex` for percentages and `findFitRowIndex` for Fit.
