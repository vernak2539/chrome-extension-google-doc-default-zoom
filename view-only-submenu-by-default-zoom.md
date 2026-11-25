---
topic: strategies
source_issue: 175
---

`viewMenuFlow` in `src/strategies/docs.ts` finds the View > Zoom submenu with `waitFor(".goog-menu", ZOOM_MENU_WAIT_MS, predicate)`. The predicate requires `isShown` (computed `display`/`visibility`, not layout) and `findZoomRowIndex(getRowTexts(menu), config.zoom.defaultZoom) !== -1`. `waitFor` (`src/utils/wait-for.ts`) takes an optional `matches` predicate.
