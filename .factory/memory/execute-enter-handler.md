---
topic: Debugger zoom handler
---

`src/background/messages/execute-enter.ts` is the Extended-only handler (deleted by `bin/remove-files.sh` for Base). It types the custom zoom value through `chrome.debugger`: `attach`, `Input.insertText`, then `Input.dispatchKeyEvent` rawKeyDown + char. It awaits every call, detaches in `finally` only if `attach` resolved, and always replies. The reply type `ExecuteEnterResponseBody.err` in `src/types.ts` is `null | "no_debugger" | "debugger_failed"`. The caller `uiExecuteCustomZoomFlow` in `src/strategies/base.ts` (inside an EXTENDED_ONLY block) falls back to the nearest preset on any truthy `err` and when the relay promise rejects. The rawKeyDown + char pair was found by trial in commit 485a0b0 and has no documented reason.
