---
topic: content script flow
---

`AbstractBaseStrategy.execute()` resolves to a `ZoomOutcome` (`src/types.ts`) and never rejects. Build outcomes with `APPLIED`, `skipped()` and `failed()` from `src/utils/zoom-outcome.ts`. `src/contents/index.ts` sends every outcome through `handleOutcome`, which logs it and calls `reportZoomOutcome` (`src/utils/sentry/report-zoom-outcome.ts`). Only `failed` outcomes reach Sentry, with one capture each. `observeElementAndExecute` in `src/utils/mutation-observer-helpers.ts` takes an `onStop` callback, called with `watch_element_missing` when its selector is missing and `page_load_timeout` when `shouldStop` fires (`OBSERVE_EXECUTION_LIMIT` = 1000). `onElementAvailable` only fires on a DOM mutation. `BrowserLogger.info` takes one string argument.
