---
topic: storage
source_issue: 178
---

Docs' Fit zoom is stored as the literal `"fit"` (`DocsZoomValueFit`, `DOCS_ZOOM_VALUES[0]`, `isFitZoomValue` in `src/constants.ts`). `src/constants.ts` no longer imports `localize`. `popupDocsDropdownFitSelection` is display text only, shown by `SelectZoomInput`. `docs-fit-labels.json` is used for `findFitRowIndex` tie-breaks and by `docs-fit-label.test.ts`.
