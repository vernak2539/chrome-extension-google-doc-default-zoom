---
topic: testing
---

Strategy tests live next to the strategies: `src/strategies/{base,docs,sheets}.test.ts`, each with `// @vitest-environment jsdom` and mocks for `@plasmohq/messaging`, `src/utils/localize` and `src/utils/get-app-storage-state-from-storage`. `base.test.ts` uses a `TestStrategy` subclass whose `performZoom` calls `uiExecuteFlow`. The Docs view-only flow waits `pause(1000)`, so those tests use fake timers and `vi.advanceTimersByTimeAsync(1000)`. Sheets has `enableViewOnlyToggle: false`, so its test overrides the feature in the config. Run `pnpm exec tsc --noEmit` against a `git archive HEAD` copy with a symlinked `node_modules` to get the baseline error list, because the counts in older notes drift.
