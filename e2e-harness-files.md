---
topic: testing
source_issue: 103
---

`e2e/zoom-fixtures.e2e.ts` covers Docs preset (150%), Sheets preset (125%), Docs custom (140%: Extended expects one Enter with `140%`; Base expects one `#zoomSelect` control click and no row click or Enter), Docs view-only (two clicks: `Zoom...` then a row matching `150%` with digit boundaries) and page-still-loading (disabled `#zoomSelect`, then enable it and mutate `#docs-toolbar`). It reads the recorder state from `window.__e2e` set up by `installRecorder` in `e2e/harness.ts`. Fixtures in `e2e/fixtures/` are synthetic until `pnpm e2e:capture` replaces them.
