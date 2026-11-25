---
topic: popup
source_issue: 178
---

`src/components/SelectZoomInput/index.tsx` renders `<option key={value} value={value}>`. The text is `localize("popupDocsDropdownFitSelection")` when `isFitZoomValue(value)`, else the value. The custom-value case adds a first `N/A` option with no `value` attribute. `WorkspaceApplication/component.tsx` treats any `zoomValue` not in `zoomValues` as custom.
