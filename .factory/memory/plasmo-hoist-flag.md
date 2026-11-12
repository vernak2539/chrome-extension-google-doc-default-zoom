---
topic: build
---

`plasmo build --hoist` maps to Parcel `defaultTargetOptions.shouldScopeHoist` (read in `node_modules/plasmo/dist/index.js`: `shouldScopeHoist:R("--hoist")`). The `build` script in `package.json` uses it (issue #99). Measured on 2026-11-12: gzip sizes for content, popup, background and each tab page drop about 42%, 46%, 46% and 23-24%, and the numbers are the same within a few bytes across chrome-mv3, edge-mv3 and firefox-mv2 and for Base vs Extended. Source maps are still produced, resolve to `src/` files and have `sourcesContent`. `src/` has no runtime `import()`. `tsc --noEmit` has a baseline of 45 errors and does not depend on `scripts`.
