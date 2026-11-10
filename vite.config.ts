import { fileURLToPath } from "node:url";

import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    // Mirror tsconfig's `baseUrl: "."` so bare `src/...` imports resolve under Vitest
    alias: { src: fileURLToPath(new URL("./src", import.meta.url)) }
  }
});
