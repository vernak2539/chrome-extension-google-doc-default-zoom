---
topic: EXTENDED_ONLY marker gotcha
---
bin/update-code-files.sh strips blocks with a sed range that matches only when the marker is the first non-whitespace text on its line. Put each marker on its own line (as in src/contents/index.ts and src/strategies/base.ts). Code inside a block must not leave dangling references once it is removed, because CI builds the Base variant too. update-code-files.sh also sed-matches the literal strings `customZoomInput: true` and `localize("extensionNameExtended")`, so keep those strings exactly as written.
