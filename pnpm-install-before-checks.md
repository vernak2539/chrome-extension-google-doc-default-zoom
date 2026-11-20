---
topic: env
source_issue: 108
---

A fresh worktree has no `node_modules`, and pnpm 12.21.0 then refuses every script with ERR_PNPM_VERIFY_DEPS_BEFORE_RUN. Run `pnpm install --frozen-lockfile --ignore-scripts` first; it leaves git status clean.
