---
topic: Pre-commit hook
---

.husky/pre-commit runs `pnpm exec lint-staged` (oxfmt --write on json/css/md; oxfmt --write plus oxlint --fix on js/ts/tsx/mjs/cjs) and then `pnpm test -- --run`. The hook is only installed when the `prepare` script runs, so installs with --ignore-scripts don't get it.
