---
topic: sentry
---

`redactUrl` in `src/utils/sentry/redact-event.ts`: http(s) URLs become `origin/<document|spreadsheets>/[redacted]` when a path segment is `document` or `spreadsheets`, `origin/[redacted]` when no such segment exists, and `origin/` for an empty path. Other schemes keep `protocol//host/pathname` without query and fragment, and the `moz-extension:` host becomes `[redacted]`. A string that is not a URL becomes `[redacted]`. Stack-frame URLs are not redacted.
