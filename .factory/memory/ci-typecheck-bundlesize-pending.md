---
topic: ci
---

Factory stages cannot edit `.github/workflows/`. `docs/ci-workflow-changes.md` holds the YAML for adding `pnpm typecheck` and `pnpm bundlesize` to `sanity-check.yml`, and a reusable `submit-reusable.yml` that replaces the duplicated `submit.yml` and `submit-extended.yml`, plus the table of their differences (environment, transform step, Firefox target, Sentry `url_prefix` IDs, keys secret, edge-notes text, artifact prefix). Until the maintainer copies that YAML, no workflow runs `tsc` or `pnpm bundlesize`.
