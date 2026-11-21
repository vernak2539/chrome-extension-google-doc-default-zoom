---
topic: strategies
source_issue: 109
---

Issue #109 (planner + drivers) is split into 3 PRs approved by the owner: (1) pure `planZoom` in `src/strategies/plan-zoom.ts` with no-DOM tests (done); (2) `waitFor` instead of `pause(1000)` in `docs.ts` and the 500 ms `closeDropdown` setTimeout, the observer `subtree` fix, and closing the dropdown with blur, checked in CI; (3) per-app drivers instead of `AbstractBaseStrategy`.
