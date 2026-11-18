---
topic: logging
source_issue: 103
---

`BrowserLogger.info` in `src/utils/logger/index.ts` returns early when `process.env.NODE_ENV === "production"`, so `pnpm build` output logs no zoom outcomes to the console. Browser tests of a prod build can't read the outcome from console logs; the e2e recorder watches DOM events instead.
