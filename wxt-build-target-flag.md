---
topic: build
source_issue: 160
---

With WXT, `pnpm build:base --target=chrome-mv3` fails with `Unknown option --target`. Use `pnpm build:base -b chrome` (and `pnpm build:extended -b chrome`); the output is `build/chrome-mv3-<edition>`, which `pnpm check:editions` checks.
