---
topic: typecheck
---

`pnpm typecheck` runs `tsc --noEmit -p tsconfig.json --incremental false` and reports 0 errors on the single shared source (both editions). `tsconfig.json` includes `.plasmo/index.d.ts` and `.plasmo/messaging.d.ts`. `.plasmo/` is gitignored and only exists after `plasmo build`/`plasmo dev`, so run a build first.
