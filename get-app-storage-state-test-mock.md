---
topic: testing
source_issue: 178
---

`src/background/get-app-storage-state.test.ts` mocks `src/utils/storage` with `readStoredValue` as a `vi.fn` and an `appStateKey` stub. Each test sets the result (`mockRejectedValue` for the IO-error default path, `mockResolvedValue` for a stored state).
