---
topic: ci
---

`submit.yml` and `submit-extended.yml` upload `build/<t>-prod` source maps with `getsentry/action-release@v1` (the comment at the top of `submit-extended.yml` says it has no Sentry steps, but it does). Both then run `rm ./build/<t>-prod/*.map`, which only removes top-level maps, before `pnpm package`. Changes to the build output, such as bundler flags, therefore affect Sentry symbolication of release builds.
