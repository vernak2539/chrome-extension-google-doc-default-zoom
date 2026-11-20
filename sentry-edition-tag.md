---
topic: sentry
source_issue: 104
---

The Sentry `extension` tag (`getDefaultTags` in `src/utils/sentry/config.ts`) is the literal `google-workspace-zoom-extended` in Extended and `google-workspace-zoom-default` in Base. `src/utils/sentry/base.test.ts` asserts both values. No bundle imports `package.json` any more (the `release` comes from the manifest).
