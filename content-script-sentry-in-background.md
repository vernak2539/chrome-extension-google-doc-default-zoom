---
topic: content script flow
source_issue: 108
---

`src/contents/index.ts` has no Sentry client. On a `failed` outcome, or an exception escaping `main()`, `reportFailure` builds the `DOM` context with `walkDOM` (page header and `body`) and sends it with `sendToBackground` (name `RELAY_REPORT_CONTENT_ERROR` = `report-content-error`) to `src/background/messages/report-content-error.ts`. That handler holds `createSentryClient("content")`, uses `sentryScope.clone()` per report, sets `request.url` from `req.sender.url` (redacted by `beforeSend`) and reports through `reportZoomOutcome` or `captureException`. Errors cross as `SerializedError` (`src/utils/serialize-error.ts`, name/message/stack). A normal page load never calls `walkDOM`.
