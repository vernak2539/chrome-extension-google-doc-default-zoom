---
topic: testing
source_issue: 175
---

jsdom has no layout, so `getClientRects()` is always empty there. A visibility check that unit tests in `src/strategies/*.test.ts` must exercise needs computed style (display/visibility), as `isShown` in `src/strategies/docs.ts` does. `e2e/capture.e2e.ts` uses `getClientRects` only inside the live browser.
