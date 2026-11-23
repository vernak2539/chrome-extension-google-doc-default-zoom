---
topic: testing
source_issue: 159
---

`src/strategies/docs.test.ts` uses fake timers. Its `runViewOnlyFlow` helper calls `vi.advanceTimersByTimeAsync(1000)` after `execute()`. That covers the 1000 ms `waitFor` timeouts in the Docs view-only flow (`ZOOM_MENU_WAIT_MS`), because the Zoom item is already present in the `*_missing` cases that reach the Fit-row wait. A longer wait, or two waits that both time out, would need a bigger advance.
