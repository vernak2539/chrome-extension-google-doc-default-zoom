---
topic: testing
source_issue: 175
---

In `e2e/zoom-live.e2e.ts` the per-shipped-language Fit tests run only on Linux (`describe.runIf(process.platform === "linux")`), because only Linux Chromium takes the extension UI language from `LANGUAGE`; `launchExtension` in `e2e/harness.ts` sets `--lang`, `LANGUAGE` and Playwright `locale` from the `language` option. The pt-BR and ko cases (an unshipped language, so the extension falls back to English) run on every platform. They check the toolbar click with no digit and not starting with Fit, and `clicks[1]` of the view-only flow.
