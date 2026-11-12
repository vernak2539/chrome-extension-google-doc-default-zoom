---
topic: sentry
---

`src/contents/index.ts` sets a Sentry `DOM` context from `walkDOM` (`src/utils/walk-dom.ts`) of the page header and `body`. It holds only element `id` and `classList.value`, no text. `logger.addContext("url", window.location.href)` only goes to the console, not Sentry. Whether Docs/Sheets element IDs can embed document-specific values hasn't been checked on a real signed-in document.
