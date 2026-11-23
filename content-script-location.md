---
topic: content script flow
source_issue: 159
---

The content-script logic is `runContentScript` in `src/content-script.ts` (entry `src/entrypoints/content.ts`), tested in `src/content-script.test.ts`. Messages go through `sendMessage` from `src/utils/messaging`, for example `sendMessage("executeEnter", ...)` and `sendMessage("reportContentError", ...)`.
