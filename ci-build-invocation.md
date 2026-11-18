---
topic: ci
---

Workflows build with `pnpm build:<edition> --source-maps --target=<t>` and package with `pnpm package:<edition> --target=<t>` (`plasmo package` doesn't build and needs the same tag), with output in `build/<target>-<edition>`. Flags on the `package.json` `build:base` / `build:extended` scripts (`plasmo build --hoist --tag=<edition>`) reach CI and the store releases. pnpm passes `--target` and `--source-maps` through the nested `pnpm build` -> `pnpm build:extended` call.
