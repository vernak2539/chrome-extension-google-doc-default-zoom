---
topic: Docs view-only zoom
---

`src/strategies/docs.ts` `uiExecuteDocsViewOnlyFlow` clicks View > Zoom, then picks a row from `.goog-menuitem.apps-menuitem` by its `firstChild.textContent`. Row matching lives in `src/utils/find-zoom-row-index.ts`: the value must not have a digit directly before or after it ("50%" must not match "150%"), and the first match wins. The Fit row label is localized via `popupDocsDropdownFitSelection` (Fit, Ajustar, フィット, ...), so text matching must not assume Latin letters. Commit 90e02a3 changed strict equality to `includes` because live row text can contain more than the bare zoom string.
