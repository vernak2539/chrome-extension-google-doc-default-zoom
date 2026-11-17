---
topic: strategies
---

`isUIViewOnly()` in `src/strategies/base.ts` is `!document.querySelector(clickableZoomSelectId)`, the same selector `uiExecuteFlow` clicks. The DOM cannot tell a view-only document from a renamed zoom selector. A strategy branch on `isUIViewOnly()` alone would make the `zoom_select_missing` path in `uiExecuteFlow` unreachable, so Docs and Sheets also require the saved `viewOnly` setting. Sheets has `enableViewOnlyToggle: false` in `src/constants.ts`, so its `skipped("view_only")` never runs in production.
