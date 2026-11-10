---
topic: Extended vs Base builds
---
By default the repo is the "Extended" extension (debugger permission, custom zoom). `pnpm transform-ext` (bin/transform-extension.mjs) rewrites package.json, sets customZoomInput to false in src/constants.ts, deletes src/background/messages/execute-enter.ts, swaps icons, and strips code between `/*--EXTENDED_ONLY_START--*/` and `/*--EXTENDED_ONLY_END--*/`. It modifies files IN PLACE, so never run it in a working tree you plan to commit.
