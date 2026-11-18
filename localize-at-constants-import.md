---
topic: testing
source_issue: 104
---

`src/constants.ts` calls `localize("popupDocsDropdownFitSelection")` at module scope. Any test that imports a module which imports `src/constants` must mock `src/utils/localize` or stub `chrome` before the import, or it throws a ReferenceError.
