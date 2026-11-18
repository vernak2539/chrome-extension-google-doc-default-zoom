---
topic: build
source_issue: 104
---

`pnpm dev` / `pnpm dev:base` (`plasmo dev --tag=<edition>`) write to the same `build/<target>-<edition>` directory as `pnpm build:<edition>`. A dev bundle is unminified and keeps debugger code in Base, so rebuild before `pnpm package:<edition>` or `pnpm check:editions`. `check:editions` does not detect dev builds.
