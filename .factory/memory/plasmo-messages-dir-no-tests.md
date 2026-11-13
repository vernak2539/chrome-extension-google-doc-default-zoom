---
topic: Tests for background message handlers
---

Do not put tests or helper files in `src/background/messages/`. Plasmo imports every `.ts` file there as a message handler, and `bin/remove-files.sh` deletes `execute-enter.ts` in the Base edition, which would break a test there. Put handler tests in `src/background/` and import them from `./messages/<name>` (see `src/background/execute-enter.test.ts`). Tests for Extended-only code (`execute-enter`, the custom zoom flow in `src/strategies/base.test.ts`) fail after `pnpm transform-ext`, because the code is removed. CI runs the tests before the transform.
