---
topic: sentry
source_issue: 108
---

`createSentryClient` (`src/utils/sentry/base.ts`) filters out the `BrowserApiErrors`, `Breadcrumbs`, `Dedupe` and `GlobalHandlers` integrations. Dedupe was removed because a long-lived client in the background worker (`report-content-error.ts`, `execute-enter.ts`, `get-app-storage-state.ts`) serves many tabs and Dedupe would drop an event equal to the previous one. `src/background/report-content-error.test.ts` sends two identical `reason` reports and expects two transport requests.
