import { defineConfig } from "vitest/config";

// Browser tests are kept out of the default `vitest run` (it only collects *.test.ts)
export default defineConfig({
  test: {
    include: ["e2e/**/*.e2e.ts"],
    testTimeout: 90_000,
    hookTimeout: 90_000,
    fileParallelism: false
  }
});
