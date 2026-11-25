---
topic: ci
source_issue: 175
---

`pnpm test:e2e:live` runs only `e2e/zoom-live` (`vitest run --config e2e/vitest.config.ts e2e/zoom-live`). `pnpm test:e2e` runs `e2e/zoom-fixtures` and `e2e/text-direction`. `pnpm test:e2e:live:firefox` runs the `firefox-live` project.
