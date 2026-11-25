---
topic: strategies
source_issue: 175
---

Both zoom flows and `e2e/capture.e2e.ts` find Docs' Fit row with `findFitRowIndex(rows.map(readZoomRowFacts), DOCS_FIT_LABELS)` from `src/utils/find-fit-row.ts`, with no label lookup: no digit and not a checkbox (`role=menuitemcheckbox` / `goog-option`), then a shortcut ending in `[` (only when some candidate has one, since toolbar rows have none), then a known label; exactly one row or -1. -1 gives `zoom_option_missing` (toolbar) or `view_zoom_option_missing` (view-only) and clicks nothing. The View > Zoom submenu in `src/strategies/docs.ts` is the shown `.goog-menu` (computed style, not layout) that lists the default zoom. A test label for an 'unknown' row must not be one of the nine in the labels file ("Ajustar" is Spanish).
