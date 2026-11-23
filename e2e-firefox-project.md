---
topic: testing
source_issue: 159
---

`e2e/firefox.e2e.ts` (`e2e/firefox-harness.ts`, Base edition only) repeats the Chromium fixture tests from `e2e/zoom-fixtures.e2e.ts`. Run it with `pnpm test:e2e:firefox`. A change to a fixture test usually needs the same change in both files.
