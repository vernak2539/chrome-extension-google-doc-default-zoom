---
topic: sentry
---

`src/utils/sentry/base.ts` builds a standalone BrowserClient and Scope and filters out the BrowserApiErrors, Breadcrumbs and GlobalHandlers integrations. Events are only sent from explicit `captureException` calls (catch blocks, `ErrorBoundaryWithSentry.componentDidCatch`). The DSN comes from `process.env.PLASMO_PUBLIC_SENTRY_DSN` (`src/utils/sentry/config.ts`).
