---
topic: typecheck
source_issue: 109
---

`tsconfig.json` includes `./**/*.ts` and `./**/*.tsx`, so test files are type-checked by `pnpm typecheck`. A change to a protected or abstract method of `AbstractBaseStrategy` must still compile with `TestStrategy` in `src/strategies/base.test.ts`.
