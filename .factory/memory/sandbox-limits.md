---
topic: env
---

In the factory execute sandbox (checked 2026-11-12), `pnpm install --frozen-lockfile --ignore-scripts` and `pnpm exec plasmo build [--hoist] --source-maps --target=<t>` work in the worktree itself and finish in about 4s. Writes still only reach the worktree and `$TMPDIR`. A zsh heredoc (`cat > f <<EOF`) fails there, so write scripts with the Write tool inside the worktree (delete them after) or with `printf`. Headless Chromium (Playwright) cannot launch: it fails with "Failed to create a ProcessSingleton" and crashpad "Permission denied", so extension behaviour tests need a host/CI run. A `$TMPDIR` copy made with `rsync` has a broken `node_modules`; run a fresh `pnpm install --store-dir $TMPDIR/store` in the copy (about 15s). `jsdom` (top-level `node_modules/jsdom`) can run the built content and popup bundles with a stubbed `chrome`, `fetch` and `postMessage`.
