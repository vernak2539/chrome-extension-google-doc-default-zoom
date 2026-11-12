---
topic: env
---

Since 2026-11-12 the execute stage runs inside the factory's own sandbox (macOS Seatbelt around the whole agent), not Claude Code's. In the worktree itself, `pnpm install --frozen-lockfile --ignore-scripts`, `pnpm format:check`, `pnpm lint`, `pnpm exec vitest run` and `pnpm build --source-maps --target=<t>` all work, for chrome-mv3, edge-mv3 and firefox-mv2. No `$TMPDIR` copy or `--store-dir` is needed, and `plasmo build` no longer fails with "Operation not permitted". The Base edition also builds after `pnpm transform-ext` in a throwaway copy (checked for chrome-mv3).

Limits that remain:

- Writes only reach the worktree and `$TMPDIR`.
- The network is only `registry.npmjs.org`, through `HTTPS_PROXY`. Node's built-in `fetch` ignores the proxy, so every build logs a harmless `getaddrinfo ENOTFOUND registry.npmjs.org` from Plasmo's update check and still ends with `DONE`.
- `ps` and loopback ports are unavailable.
- Launching a headless browser inside the sandbox has not been tried.
