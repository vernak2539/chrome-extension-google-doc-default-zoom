---
topic: testing
source_issue: 103
---

`playwright` ^1.64.1 is a devDependency in package.json (also used by `.gemini/skills/storybook-visual-inspector/scripts/capture.mjs`). `@playwright/test` is not installed; the e2e harness drives Playwright through Vitest. In a fresh worktree Chromium is not downloaded (`pnpm exec playwright install --with-deps chromium`), so `pnpm test:e2e` fails at `launchPersistentContext` until it is.
