---
topic: ci
source_issue: 103
---

Browser tests are wired into CI: `.github/workflows/sanity-check.yml` runs `pnpm exec playwright install --with-deps chromium` and `pnpm test:e2e` (both editions) after the tagged builds and bundlesize, and uploads `e2e/results/screenshots` on failure. `.github/workflows/e2e-live.yml` (pull requests and manual) builds both editions, runs `pnpm test:e2e:live --project base|extended` and `pnpm e2e:capture` with `continue-on-error`, uploads `e2e/fixtures` and screenshots with `if: always()`, and fails in a last step if a live step failed. The raw captures in `e2e/results/raw` are never uploaded. There is no `docs/ci-workflow-changes.md` any more.
