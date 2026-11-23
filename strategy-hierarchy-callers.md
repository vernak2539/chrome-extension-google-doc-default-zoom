---
topic: strategies
source_issue: 160
---

There is no strategy class hierarchy any more. `createZoomDriver(config, { isUIPreview, viewMenuFlow? })` in `src/strategies/base.ts` returns a `ZoomDriver` (`isUIPreview`, `getIsPageLoadingElementToWatch`, `getIsPageLoading`, `execute`). `createDocsDriver` (`docs.ts`, passes `viewMenuFlow`) and `createSheetsDriver` (`sheets.ts`) are its only callers, and `src/content-script.ts` (`createDriver` switch) is their only production importer. `src/content-script.test.ts` mocks `src/strategies/docs` and `src/strategies/sheets` by module path, so a change to their exports needs a change to that mock. A `view_menu_preset` plan without `viewMenuFlow` returns `failed("view_menu_missing")`.
