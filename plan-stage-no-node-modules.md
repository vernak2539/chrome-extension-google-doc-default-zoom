---
topic: env
source_issue: 104
---

In the plan stage the worktree has no `node_modules`, and file tools are restricted to the worktree. Plasmo source (`node_modules/plasmo/dist/index.js`) cannot be read there, so Plasmo behaviour (env files, `--tag`, icon names) must be verified in the execute stage after `pnpm install`. Heredocs (`cat > f <<EOF`) fail in the sandbox, and `git rm` / `git mv` fail because the git index can't be written: use the file tools, `rm` and `mv`.
