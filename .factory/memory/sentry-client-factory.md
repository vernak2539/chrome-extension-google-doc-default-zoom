---
topic: sentry
---

Every Sentry client (content script, background handlers `execute-enter.ts` and `get-app-storage-state.ts`, `src/utils/migrations.ts`, popup settings, popup/tab error boundaries) is created through `createSentryClient` in `src/utils/sentry/base.ts`. `...extraClientOptions` is spread before `beforeSend`, so callers cannot override the redaction; the second parameter type omits `beforeSend`. `redactEventRequest` / `redactUrl` (`src/utils/sentry/redact-event.ts`) rebuild `event.request` as `{ url, headers }`, with the URL reduced to origin plus app segment (`https://docs.google.com/document/[redacted]`) and the `Referer` header dropped. This is needed because the default `HttpContext` integration adds `location.href` and `document.referrer` to every event. Options that must apply to every client go after `...extraClientOptions`.

`src/utils/sentry/base.test.ts` runs the real `createSentryClient` with a dummy `example.invalid` DSN, a recording transport and stubbed `document`/`location`/`chrome` globals in the node environment; it needs `vi.mock("@plasmohq/storage", ...)`. `@sentry/core` isn't a direct dependency, so types come from `@sentry/browser`.
