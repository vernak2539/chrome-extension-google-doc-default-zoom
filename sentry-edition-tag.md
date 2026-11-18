---
topic: sentry
source_issue: 104
---

The Sentry `extension` tag (`getDefaultTags` in `src/utils/sentry/config.ts`) is `packageJson.name` (`google-workspace-zoom-extended`) in Extended and the literal `google-workspace-zoom-default` in Base, because package.json no longer changes per edition. `src/utils/sentry/base.test.ts` asserts both values. The popup bundle also embeds the whole package.json through this import, so the string `extensionNameExtended` is in every popup bundle. Check the minified `("extensionNameExtended")` call, not the bare string.
