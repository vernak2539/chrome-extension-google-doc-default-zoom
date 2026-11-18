---
topic: editions
source_issue: 103
---

In Base, `customZoomInput` is `IS_EXTENDED_EDITION` in `src/constants.ts`, so a stored non-preset value such as `140%` goes to `uiExecuteDefinedZoomFlow`: it clicks `#zoomSelect`, finds no row with that text and ends as `failed("zoom_option_missing")`, with no debugger relay call (`src/strategies/base.test.ts`). The Base e2e test expects one `#zoomSelect` click and no row click or Enter. Only Extended types the value and falls back to the closest preset.
