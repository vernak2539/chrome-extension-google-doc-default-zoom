---
topic: testing
---

`src/utils/localize.ts` checks `!chrome`, which throws a ReferenceError when the `chrome` global is undefined (e.g. under jsdom in Vitest). Component tests that render localized text should `vi.mock("../../utils/localize", ...)` (as `src/components/SelectZoomInput/index.test.tsx` does) or `vi.stubGlobal("chrome", ...)`.
