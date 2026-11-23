---
topic: layout
source_issue: 162
---

Background handlers are plain modules in `src/background/` (`get-app-storage-state.ts`, `report-content-error.ts`, `execute-enter.ts`) registered with `onMessage` in `src/background/index.ts`. There is no `src/background/messages/` folder, and their tests sit next to them in `src/background/`.
