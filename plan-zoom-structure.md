---
topic: strategies
source_issue: 109
---

Zoom decisions live in `planZoom` / `planToolbarZoom` (`src/strategies/plan-zoom.ts`, pure). The driver's `execute()` (`createZoomDriver` in `src/strategies/base.ts`) builds the `ZoomPage` (`isClassroomSubmission`, `hasZoomSelect = !isUIViewOnly(config)`) and runs the plan with the module function `runPlan`; Docs supplies the `viewMenuFlow` option. `plan-zoom.test.ts` mocks `src/utils/localize` because `getIsCustomZoom` imports `src/constants`, and sets feature flags explicitly so it is edition-independent.
