---
topic: strategies
source_issue: 109
---

Zoom decisions live in `planZoom` / `planToolbarZoom` (`src/strategies/plan-zoom.ts`, pure). `AbstractBaseStrategy.execute()` builds the `ZoomPage` (`isClassroomSubmission`, `hasZoomSelect = !isUIViewOnly()`) and runs the plan with `runPlan`; Docs overrides `uiExecuteViewMenuFlow`. `plan-zoom.test.ts` mocks `src/utils/localize` because `getIsCustomZoom` imports `src/constants`, and sets feature flags explicitly so it is edition-independent.
