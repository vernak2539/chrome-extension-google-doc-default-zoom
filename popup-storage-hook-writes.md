---
topic: popup
source_issue: 105
---

Plasmo `useStorage` persists the value a function initializer returns, but only renders a plain initial value (read in `@plasmohq/storage` 1.15.0 `dist/hook.js`). `useWorkspaceStorage` therefore passes no initializer and takes `isLoading` from the third tuple item, and the popup writes storage only on a user change. Defaults come from `getDefaultAppState(storageKey)` in `src/constants.ts`. `src/areas/settings/index.tsx` reads `schemaVersion` with a plain initial value of 1. `src/components/WorkspaceApplication/hooks.test.tsx` counts `chrome.storage.sync.set` calls using `src/test-support/fake-chrome-storage.ts`.
