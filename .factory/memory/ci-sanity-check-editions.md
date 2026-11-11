---
topic: ci
---

`.github/workflows/sanity-check.yml` runs on `pull_request` to main, push to main and `workflow_dispatch`. It runs `pnpm install`, `format:check`, `lint` and `test`, then builds and packages chrome-mv3, edge-mv3 and firefox-mv2. It then runs `pnpm transform-ext` and builds and packages all three targets again for the Base edition. So the GitHub Sanity Check on a PR is the evidence that both editions build, even when the factory sandbox can't run `plasmo build`.
