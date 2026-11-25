---
topic: ci
source_issue: 175
---

`.github/workflows/e2e-live.yml` runs on every pull request and on `workflow_dispatch`, with no `schedule:`. Its `capture` job runs `pnpm e2e:capture` and uploads only `e2e/fixtures` as the `fixtures` artifact, so `src/strategies/docs-fit-labels.json` (written by the capture since #175) is not in the artifact unless the upload `path` also lists it. It runs on ubuntu-latest, so the Linux-only per-language Fit tests run there.
