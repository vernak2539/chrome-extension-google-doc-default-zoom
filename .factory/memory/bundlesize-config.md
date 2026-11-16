---
topic: build
---

`bundlesize.config.json` has three entries for `build/chrome-mv3-prod`: `popup.*.js` (200 kB), `static/background/index.js` (200 kB) and a catch-all `**/!(popup.*).js` (100 kB, covers `contents.*.js` and `tabs/*.js`). `pnpm bundlesize` runs bundlesize2 and needs a `pnpm build --target=chrome-mv3` first. bundlesize2 gives a file that matches several entries to the most specific path (more `/` parts first), so the catch-all must exclude `popup.*` through the glob, or the popup would be measured against 100 kB. Sizes are gzip. Plasmo writes the background bundle to `static/background/index.js`.
