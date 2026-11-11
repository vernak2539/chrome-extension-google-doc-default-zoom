---
topic: build
---

`plasmo build --hoist` maps to Parcel `defaultTargetOptions.shouldScopeHoist` (read in `node_modules/plasmo/dist/index.js`: `shouldScopeHoist:R("--hoist")`). The `build` script in `package.json` uses it (issue #99). `src/` has no runtime `import()`, and `@plasmohq/messaging`, `@plasmohq/storage` and `react-aria-components` dists contain none. `tsc --noEmit` has a baseline of 45 errors and doesn't depend on `scripts`.
