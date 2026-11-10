---
topic: testing
---

Component tests opt in to jsdom per file with a `// @vitest-environment jsdom` first line (jsdom ^26 is installed; it declares `node >=18`, CI uses Node 22.13.0). React is 18.2, so use `createRoot` from `react-dom/client` and `act` from `react-dom/test-utils`. Under jsdom, `tslog/dist/esm/index.js` (deep import in `src/utils/logger/index.ts`) fails to resolve, so mock `../logger/index`. `vite.config.ts` aliases `src` to `./src` so bare `src/...` imports resolve in Vitest.
