---
topic: popup
source_issue: 182
---

`src/areas/settings/index.tsx` shows its dev-only tools only when `import.meta.env.COMMAND === "serve"` (WXT dev). The Vitest config does not set `COMMAND`, and `.storybook/main.ts` defines it as `"serve"`. The footer shows the storage schema with `localize("popupSettingsStorageVersion")` and renders `<VersionInfo />` (`src/components/VersionInfo/index.tsx`): the manifest version in every build, plus branch and commit from `import.meta.env.GIT_BRANCH` / `GIT_COMMIT` in `serve` only. Tests set these with `vi.stubEnv`.
