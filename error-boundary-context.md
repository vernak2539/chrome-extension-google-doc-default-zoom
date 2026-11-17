---
topic: react-error-boundary
---

`src/utils/sentry/react-error-boundary.tsx` uses `static contextType = LoggerContext`, so the logger is on `this.context` (there is no `this.logger`). `LoggerContext` lives in `src/utils/logger/context.tsx`; `BrowserLogger.error(message, error)` is in `src/utils/logger/index.ts`. In `src/popup.tsx` the boundary wraps `IndexPopup` from outside `<LoggerProvider>`, so it gets the default `new BrowserLogger("popup")`.
