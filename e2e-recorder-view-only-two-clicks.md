---
topic: testing
source_issue: 175
---

In the view-only Docs flow the recorder (`e2e/harness.ts`) logs two `.goog-menuitem` clicks: `clicks[0]` is View > Zoom, `clicks[1]` is the zoom row (the Fit row's text goes on with its shortcut, e.g. `Fit⌘+Option+[`). Use `waitForClicks(page, 2)` and check `clicks[1]`; polling `clicks.at(-1)` with a loose pattern can match the View > Zoom click.
