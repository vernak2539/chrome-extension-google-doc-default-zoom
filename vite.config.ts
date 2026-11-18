import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    // Mirror tsconfig's `baseUrl: "."` so bare `src/...` imports resolve under Vitest
    alias: { src: fileURLToPath(new URL("./src", import.meta.url)) }
  },
  test: {
    // Run every test file once per edition, the way `plasmo build --tag=<edition>` sets PLASMO_TAG
    projects: [
      { extends: true, test: { name: "base", env: { PLASMO_TAG: "base" } } },
      { extends: true, test: { name: "extended", env: { PLASMO_TAG: "extended" } } }
    ]
  }
});
