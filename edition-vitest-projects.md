---
topic: testing
source_issue: 104
---

`vite.config.ts` imports `defineConfig` from `vitest/config` and has two inline projects (`base`, `extended`, `extends: true`) that set `env.PLASMO_TAG`, so `pnpm exec vitest run` runs every test file once per edition (output lines are prefixed `|base|` / `|extended|`). Tests of Extended-only code use `describe.runIf(IS_EXTENDED_EDITION)` / `test.runIf(...)` from `src/utils/edition`; `src/background/execute-enter.test.ts` and the custom zoom tests in `src/strategies/base.test.ts` do. Storybook defines `process.env.PLASMO_TAG` as `"extended"` in `.storybook/main.ts`. `pnpm build-storybook` fails on `main` too, on a `tslog` deep import (`Missing "./dist/esm/index.js" specifier`).
