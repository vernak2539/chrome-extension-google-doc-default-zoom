---
topic: env
---

In the factory execute sandbox, creating `.idea` dirs inside the worktree is denied, so `pnpm install` fails there (ordered-binary ships a `.idea` folder), but works in a copy under `$TMPDIR` (use `--store-dir $TMPDIR/store`). `pnpm build` (Plasmo/Parcel LMDB cache) fails with "Operation not permitted" even in `$TMPDIR`, so builds cannot be verified in the sandbox. `registry.npmjs.org` must be in `network_allowlist`.
