---
topic: testing
---

Strategy tests live next to the strategies: `src/strategies/{base,docs,sheets}.test.ts`, each with `// @vitest-environment jsdom` and mocks for `src/utils/localize` and `src/utils/get-app-storage-state-from-storage`. `base.test.ts` builds a Docs driver with `createZoomDriver(DOCS_CONFIG, { isUIPreview: () => false })` and a `zoomTo(value)` helper that mocks a `viewOnly: false` stored state and calls `execute()`; it also covers `getIsPageLoading` and `getIsPageLoadingElementToWatch`. `docs.test.ts` and `sheets.test.ts` cover `isUIPreview`. Sheets has `enableViewOnlyToggle: false`, so its test overrides the feature in the config. `docs.test.ts` uses fake timers (see docs-test-timer-helper).
