---
topic: build
---

The Base edition comes from `pnpm transform-ext` (`bin/transform-extension.mjs`), which rewrites files in place (package.json names/permissions, `customZoomInput: true` to false in `src/constants.ts`, `bin/remove-files.sh` deletes `src/background/messages/execute-enter.ts`). Extended is the repo's default state; run the transform only in a throwaway copy.
