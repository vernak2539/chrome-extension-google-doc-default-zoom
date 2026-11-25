---
topic: ci
source_issue: 175
---

`.github/workflows/sanity-check.yml` runs `pnpm format:check`, `pnpm lint`, `pnpm test`, then `pnpm check:editions`, `pnpm typecheck` and `pnpm bundlesize`. Browser tests run in separate jobs per edition (`pnpm build:<edition> -b chrome`, `pnpm test:e2e --project <edition>`), plus a Firefox job (`pnpm build:base -b firefox`, `pnpm test:e2e:firefox`).
