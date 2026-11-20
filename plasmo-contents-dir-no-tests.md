---
topic: testing
source_issue: 108
---

Plasmo turns every file in `src/contents/` into a content script, so tests of `src/contents/index.ts` live outside that folder: `src/content-script.test.ts` (jsdom, strategies and `@plasmohq/messaging` mocked, `vi.resetModules()` plus a dynamic import per test because `main` starts on a body mutation). The background handler test is `src/background/report-content-error.test.ts`, which uses the real `createSentryClient`, `vi.stubEnv("PLASMO_PUBLIC_SENTRY_DSN", ...)` before a dynamic import, and a stubbed `fetch` to read the envelope.
