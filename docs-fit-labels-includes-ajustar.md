---
topic: testing
source_issue: 175
---

`src/strategies/docs-fit-labels.json` has nine labels (ar, de, en, es, fr, he, it, ja, ru), and "Ajustar" is the `es` one. Strategy tests that pass `DOCS_FIT_LABELS` through the real flows must use labels that are not in this file (for example "New feature", "Nueva opción") to model an unknown row. `src/utils/find-fit-row.test.ts` uses its own four-entry `KNOWN_LABELS`, so "Ajustar" counts as unknown there.
