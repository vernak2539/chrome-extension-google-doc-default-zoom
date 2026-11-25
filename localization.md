---
topic: localization
---

Write user-facing strings with `localize(key)` from `src/utils/localize.ts` (wraps chrome.i18n.getMessage, returns the key when chrome.i18n is unavailable). Messages live in `public/_locales/<lang>/messages.json` (WXT layout: ar, de, en, es, fr, he, it, ja, ru), not `locales/`; en is the source. `bin/translate-messages.mjs` reads `public/_locales` and fills in other languages but needs Google Cloud credentials.
