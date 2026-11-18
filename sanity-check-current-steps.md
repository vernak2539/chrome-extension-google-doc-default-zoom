---
topic: ci
source_issue: 103
---

`.github/workflows/sanity-check.yml` runs: install, `pnpm format:check`, `pnpm lint`, `pnpm test`, 'Build both editions' (`pnpm build:base|extended --source-maps --target=chrome-mv3|edge-mv3|firefox-mv2`), `pnpm check:editions`, `pnpm typecheck`, `pnpm bundlesize` (INTERNAL_SKIP_CACHE=1), Playwright Chromium install, `pnpm test:e2e` ('Browser tests', both editions on chrome-mv3), then packaging of all six builds. Failed browser tests upload `e2e/results/screenshots` as `e2e-screenshots`. There is no transform-ext step.
