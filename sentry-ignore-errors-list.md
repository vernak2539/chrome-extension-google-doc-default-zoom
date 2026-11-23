---
topic: sentry
source_issue: 162
---

`SENTRY_BASE_CONFIG.ignoreErrors` in `src/utils/sentry/config.ts` is shared by every client through `createSentryClient` (`src/utils/sentry/base.ts`). It drops debugger errors and unactionable storage errors (LevelDB `ChromeMethodBFE` IO errors, `"sync" is not available in this instance of Chrome`, `"browser.storage.sync" is undefined`). Sentry matches the patterns against the last exception `value` alone and against `type: value`. `src/utils/sentry/base.test.ts` mocks `src/utils/storage`, and its `captureEventItems` helper uses a recording transport and returns every `event` item, so a dropped error gives an empty list.
