---
topic: strategies
source_issue: 109
---

The Docs view-only flow has no default-zoom check: with `viewOnly` on and no `#zoomSelect`, a stored `100%` still clicks View > Zoom > 100% (`planZoom` returns `view_menu_preset`). Only the toolbar path (`planToolbarZoom`) returns `skip default_zoom`.
