---
topic: ci
---

Factory stages cannot edit `.github/workflows/`. `sanity-check.yml` now runs `pnpm typecheck` (once, after the Extended build) and `pnpm bundlesize` (after each build, with `INTERNAL_SKIP_CACHE: "1"`). Still pending: `docs/ci-workflow-changes.md` holds the YAML for a reusable `submit-reusable.yml` that replaces the duplicated `submit.yml` and `submit-extended.yml`, plus the table of their differences.
