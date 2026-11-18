import { defineConfig } from "vitest/config";

// The zoom flow runs once per edition, against build/chrome-mv3-<edition>. Pick one with `--project`.
const editionProject = (edition: "base" | "extended") => ({
  extends: true,
  test: { name: edition, include: ["e2e/zoom-*.e2e.ts"], env: { E2E_EDITION: edition } }
});

// Browser tests are kept out of the default `vitest run` (it only collects *.test.ts)
export default defineConfig({
  test: {
    testTimeout: 90_000,
    hookTimeout: 90_000,
    fileParallelism: false,
    projects: [
      editionProject("base"),
      editionProject("extended"),
      // capturing and sanitizing fixtures does not load the extension, so it runs once
      {
        extends: true,
        test: { name: "fixtures", include: ["e2e/capture.e2e.ts", "e2e/sanitize.e2e.ts"] }
      }
    ]
  }
});
