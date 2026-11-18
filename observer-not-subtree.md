---
topic: content script flow
source_issue: 103
---

`observeElementAndExecute` in `src/utils/mutation-observer-helpers.ts` observes its element with `{ attributes: true, childList: true }` and no `subtree`. When the page is still loading it watches `#docs-toolbar` (or `#docs-view-menu`), so a class change on `#zoomSelect` alone does not wake it. The toolbar itself must mutate. `onElementAvailable` (used first, for `#docs-chrome`) observes `document.body` with `childList` and `subtree`.
