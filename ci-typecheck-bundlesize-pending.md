---
topic: ci
---

Factory stages cannot edit `.github/workflows/`, so workflow changes are written as YAML in `docs/ci-workflow-changes.md` for the maintainer to copy. It holds the `sanity-check.yml` that runs format, lint, test, both editions for three targets, `pnpm check:editions`, typecheck, bundlesize and package, plus a reusable `submit-reusable.yml` with an `edition` input (`base`|`extended`) and thin `submit.yml` / `submit-extended.yml` callers.
