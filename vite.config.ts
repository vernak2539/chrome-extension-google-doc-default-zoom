import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    // Mirror WXT's `alias: { src: "src" }` so bare `src/...` imports resolve under Vitest
    alias: { src: fileURLToPath(new URL("./src", import.meta.url)) }
  },
  test: {
    // Run every test file once per edition, the way `wxt build --mode=<edition>` sets MODE
    projects: [
      { extends: true, test: { name: "base", mode: "base" } },
      { extends: true, test: { name: "extended", mode: "extended" } }
    ],
    // @wxt-dev/browser captures globalThis.chrome when it is imported, so it has to be re-evaluated
    // after each test stubs `chrome` and resets the module registry.
    server: {
      deps: {
        inline: [/[\\/]node_modules[\\/](?:wxt|@wxt-dev[\\/](?:storage|browser))[\\/]/]
      }
    }
  }
});
