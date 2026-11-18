---
topic: build
---

`bundlesize.config.json` has three entries, now with `build/chrome-mv3-*` as the directory so one `pnpm bundlesize` run measures every chrome-mv3 edition you built: `popup.*.js` (200 kB), `static/background/index.js` (200 kB) and a catch-all `**/!(popup.*).js` (100 kB, covers `contents.*.js` and `tabs/*.js`). It needs `pnpm build:base --target=chrome-mv3` and `pnpm build:extended --target=chrome-mv3` first. bundlesize2 gives a file that matches several entries to the most specific path (more `/` parts first), so the catch-all excludes `popup.*` through the glob. Sizes are gzip. Plasmo writes the background bundle to `static/background/index.js`. bundlesize2 0.0.35 contacts an external cache service (`bundlesize-cache.now.sh`) when it detects CI; set `INTERNAL_SKIP_CACHE=1` to turn that off.
