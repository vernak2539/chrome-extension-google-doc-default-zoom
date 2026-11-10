---
topic: DOM interaction and error handling
---

Use simulateClick, getDOMElementAndClick or clickDOMElement from src/utils/ui-helpers.ts, which dispatch mouse events with coordinates, because a plain .click() often doesn't register in Docs/Sheets. Logging uses `new BrowserLogger("<area>")` (src/utils/logger, built on tslog). Errors are reported with `createSentryClient("<area>").captureException(err)` (src/utils/sentry/base.ts). The content script catches errors and logs them rather than rethrowing.
