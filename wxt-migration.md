---
topic: build
source_issue: 162
---

The repo builds with WXT 0.21.5, not Plasmo: `pnpm build:base` / `pnpm build:extended` run `wxt build --mode <edition>`, `package:*` run `wxt zip`, and `postinstall` runs `wxt prepare`. After `pnpm install --ignore-scripts` run `pnpm exec wxt prepare` before Vitest, or every test file fails with `Failed to load tsconfig '.wxt/tsconfig.json'`. Storage goes through `wxt/utils/storage` (`readStoredValue` / `watchStoredValue` in `src/utils/storage.ts`), messaging through `@webext-core/messaging` (`src/utils/messaging.ts`), and the Sentry DSN env var is `WXT_SENTRY_DSN`. Repo-truth notes that mention Plasmo, `@plasmohq/*`, `.plasmo/` or `PLASMO_*` are out of date.
