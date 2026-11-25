---
topic: build
source_issue: 182
---

The `vite: ({ command }) => ...` callback in `wxt.config.ts` returns `define`/`sourcemap` for `build` (and sets `process.env.NODE_ENV = "production"` there). For `serve` it defines `import.meta.env.GIT_BRANCH` and `GIT_COMMIT` through `readGit` (`execFileSync("git", ...)`, empty string when git fails). Use that callback for build-time defines that depend on dev or production. `vite.config.ts` (Vitest) does not load `wxt.config.ts`.
