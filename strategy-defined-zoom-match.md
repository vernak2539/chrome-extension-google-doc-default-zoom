---
topic: Strategies
---

`uiExecuteDefinedZoomFlow` in `src/strategies/base.ts` matches toolbar dropdown rows with strict `firstChild.textContent === zoomValue` (last match wins). The Docs view-only flow uses `findZoomRowIndex` instead.
