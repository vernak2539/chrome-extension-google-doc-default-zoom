---
topic: testing
source_issue: 103
---

`.oxfmtrc.json` has `ignorePatterns: ["e2e/fixtures/**"]`. The fixtures must stay compact HTML: the formatter would add whitespace text nodes, and the extension reads `row.firstChild.textContent` of each `.goog-menuitem`, so a whitespace first child breaks matching. The committed fixtures (`docs-editor`, `docs-view-only`, `sheets-editor`) were synthetic as of the harness PR (header says so) until `pnpm e2e:capture` replaces them.
