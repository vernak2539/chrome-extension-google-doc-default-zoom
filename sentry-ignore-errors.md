---
topic: Sentry ignoreErrors
---

`SENTRY_BASE_CONFIG.ignoreErrors` in `src/utils/sentry/config.ts` filters "Detached while handling command.", "Cannot access a chrome-extension:// URL of different extension" and "Cannot access a chrome:// URL" for every client, because all clients spread it in `src/utils/sentry/base.ts`. The owner decided to keep these filters, each with a justification comment. The error strings are not verified against Chromium sources.
