---
topic: Import path convention
---
App code imports modules with the bare `src/...` prefix (e.g. `import localize from "src/utils/localize"`). This works through tsconfig baseUrl "."; Storybook aliases `src` in .storybook/main.ts. Tests use relative imports. oxfmt sorts imports (sortImports: true), so don't hand-order them.
