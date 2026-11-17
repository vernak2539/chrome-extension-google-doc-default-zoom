---
topic: Globs in .factory/memory markdown
---

In committed memory files, bare `*` globs get rewritten to `_` (for example `layout-src.md` had `src/tabs/_.tsx`), most likely by the markdown formatter (oxfmt). Put file globs inside backticks, such as `src/tabs/*.tsx`, and check the file after running `pnpm exec oxfmt .factory/memory/`.
