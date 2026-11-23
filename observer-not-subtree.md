---
topic: content script flow
source_issue: 103
---

`observeElementAndExecute` in `src/utils/mutation-observer-helpers.ts` observes its element with `{ attributes: true, childList: true, subtree: true }`, so a class change on `#zoomSelect` inside `#docs-toolbar` wakes it. `src/utils/wait-for.ts` `waitFor(selector, timeoutMs)` resolves with the first match or `null` after the timeout; the Docs view-only flow uses it instead of the removed `pause`.
