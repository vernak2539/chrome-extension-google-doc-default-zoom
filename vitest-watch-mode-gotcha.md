---
topic: Tests: avoid watch mode
---

`pnpm test` runs plain `vitest`, which starts watch mode in an interactive terminal. Use `pnpm exec vitest run` or `pnpm test -- --run` so it exits. No vitest config exists (vite.config.ts is an empty defineConfig({})). Tests are colocated as src/utils/\*.test.ts.
