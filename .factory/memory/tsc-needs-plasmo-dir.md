---
topic: typecheck
---

`pnpm typecheck` runs `tsc --noEmit -p tsconfig.json --incremental false` and reports 0 errors. `tsconfig.json` includes `.plasmo/index.d.ts` and `.plasmo/messaging.d.ts`. `.plasmo/` is gitignored and only exists after `plasmo build`/`plasmo dev`, so run a build first. After `pnpm transform-ext`, typecheck reports `TS2307` for `src/background/execute-enter.test.ts` (its handler is deleted), so run it on the Extended edition only.
