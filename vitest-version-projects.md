---
topic: testing
source_issue: 104
---

package.json pins `vitest` ^3.2.4, which supports inline `test.projects` in `vite.config.ts`. `defineConfig` must come from `vitest/config` for the `test` key to type-check.
