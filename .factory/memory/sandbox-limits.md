---
topic: env
---

In the factory execute sandbox, `pnpm install` inside the worktree fails with "Operation not permitted" (observed while pnpm creates a `.idea` dir for `ordered-binary`), but works in a copy under `$TMPDIR` (use `--store-dir $TMPDIR/store`), where vitest runs fine. `pnpm build` (Plasmo/Parcel LMDB cache) failed with "Operation not permitted" even in `$TMPDIR`, so builds could not be verified in the sandbox.
