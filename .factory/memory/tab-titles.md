---
topic: Tab page titles
---

Plasmo writes the generated HTML `<title>` from package.json `displayName` (`__MSG_extensionNameExtended__`), and Chrome doesn't resolve `__MSG_` in HTML. Tab pages in src/tabs/_.tsx therefore set `document.title` themselves from `localize()` at module scope (tested in src/tabs/document-title.test.ts). No other src module imports the tab modules; they are only referenced as `./tabs/_.html` URLs (src/areas/home/index.tsx, src/components/WorkspaceApplication/component.tsx).
