---
topic: sentry
source_issue: 108
---

`createSentryClient` in `src/utils/sentry/base.ts` sets `release` from `chrome?.runtime?.getManifest?.().version` after `...SENTRY_BASE_CONFIG`; `src/utils/sentry/config.ts` no longer imports `package.json`, so no bundle embeds it. Plasmo copies the `package.json` version into the manifest, and the release workflow (`submit-reusable.yml`) names the Sentry release with the `package.json` version, so source maps match. Under test the `release` is undefined unless `chrome.runtime.getManifest` is stubbed.
