---
topic: ci
---

All workflows (`sanity-check.yml`, `submit.yml`, `submit-extended.yml`) build with `pnpm build --source-maps --target=<t>` and package with `pnpm package --target=<t>` (`plasmo package` doesn't build). Flags in the `package.json` `build` script therefore reach CI and the store releases. `bin/transform-extension.mjs` doesn't touch `scripts`, so Extended and Base both inherit them. `submit-extended.yml` builds only chrome-mv3 and edge-mv3.
