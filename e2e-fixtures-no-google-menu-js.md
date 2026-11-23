---
topic: testing
source_issue: 159
---

The fixtures in `e2e/fixtures/` are static markup with no Google Closure code, so opening or closing the zoom dropdown is never modelled there and a fixture e2e cannot show a menu closing. Fixture tests can only assert what the extension dispatched (`dismissals` in the recorder). Only `e2e/zoom-live.e2e.ts` runs against real Google menu behaviour.
