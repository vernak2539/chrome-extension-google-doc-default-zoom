---
topic: testing
source_issue: 103
---

`pnpm e2e:capture` runs capture, then always runs sanitize, then exits with capture's status. `e2e/capture.e2e.ts` deletes a target's raw file (`e2e/results/raw/<name>.html`) before capturing, and `e2e/sanitize.e2e.ts` skips targets with no raw file. The e2e recorder (`window.__e2e` in `e2e/harness.ts`) records `clicks` (menu-row text), `enters` (input value on Enter) and `controlClicks` (ids of `#zoomSelect`/`#t-zoom` clicks, proof the content script ran).
