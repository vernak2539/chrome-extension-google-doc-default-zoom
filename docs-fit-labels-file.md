---
topic: localization
source_issue: 175
---

Docs' Fit row text per shipped language is recorded by `pnpm e2e:capture` into `src/strategies/docs-fit-labels.json` (`FIT_LABELS_PATH` in `e2e/targets.ts`; it was `e2e/fixtures/docs-fit-labels.json` before #175). `src/constants.ts` imports it as `DOCS_FIT_LABELS`, the last tie-break of `findFitRowIndex`. `src/strategies/docs-fit-label.test.ts` checks every shipped locale's `popupDocsDropdownFitSelection` equals it, because that message is the saved Fit value until #106. The `E2E live` workflow only uploads `e2e/fixtures`, so its artifact no longer holds this file.
