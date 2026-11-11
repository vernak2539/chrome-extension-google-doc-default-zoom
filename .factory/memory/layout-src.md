---
topic: Source layout (Plasmo)
---

Plasmo 0.90.5 + React 18.2 + TS 5.8. src/popup.tsx is the popup (router in src/router.tsx, pages in src/areas/{home,settings}); src/tabs/_.tsx are extension tab pages; src/contents/index.ts is the content script; src/background/index.ts plus src/background/messages/_.ts are @plasmohq/messaging handlers; src/strategies/{base,docs,sheets}.ts are the per-app zoom strategies; src/components/<Name>/index.tsx; src/utils/ holds helpers; src/stories/ holds Storybook stories.
