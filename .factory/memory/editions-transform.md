---
topic: build
---

The Base edition comes from `pnpm transform-ext` (`bin/transform-extension.mjs`), which rewrites files in place; Extended is the repo's default state, so run the transform only in a throwaway copy. It does the following:

- Edits `package.json`: name, displayName, `manifest.name`, `manifest.permissions = []` and the gecko id.
- Runs `bin/update-code-files.sh`: seds `customZoomInput: true` to `false` in `src/constants.ts`, swaps `localize("extensionNameExtended")` for `localize("extensionName")` in `src/popup.tsx`, and deletes every `/*--EXTENDED_ONLY_START--*/` … `/*--EXTENDED_ONLY_END--*/` block under `src/` (`src/contents/index.ts`, `src/strategies/base.ts`).
- Runs `bin/update-icons.sh` (replaces `assets/icon.png` with `icon-default.png`) and `bin/remove-files.sh` (deletes `src/background/messages/execute-enter.ts`).

The factory pre-PR checks build only the Extended edition (`pnpm build --target=chrome-mv3`). In the execute sandbox the Base edition can be transformed, installed, type-checked and unit-tested in a `$TMPDIR` copy, but `plasmo build` fails there with "Operation not permitted".
