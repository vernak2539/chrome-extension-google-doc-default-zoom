---
topic: testing
---

Do not put tests or helper files in `src/background/messages/`. Plasmo imports every `.ts` file there as a message handler and bundles it into both editions. Put handler tests in `src/background/` and import them from `./messages/<name>` (see `src/background/execute-enter.test.ts`). `execute-enter.ts` stays in both editions and checks `IS_EXTENDED_EDITION` first, so Base replies `no_debugger` and the minifier drops the debugger code; its tests run in the extended Vitest project only.
