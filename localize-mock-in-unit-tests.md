---
topic: testing
---

Unit tests that import `src/constants` (e.g. `DOCS_ZOOM_VALUES`) mock localize with `vi.mock("src/utils/localize", () => ({ default: (s: string) => s }))`, as `src/utils/get-closest-zoom-value.test.ts` does. With the mock, the Fit value is the key string `popupDocsDropdownFitSelection`.
