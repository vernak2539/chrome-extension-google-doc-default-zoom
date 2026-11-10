---
topic: Localization
---
Write user-facing strings with `localize(key)` from src/utils/localize.ts, which wraps chrome.i18n.getMessage and returns the key itself when chrome.i18n is unavailable. Strings live in locales/<lang>/messages.json (de, en, es, fr, it, ja, ru); en is the source. New keys go in locales/en first. bin/translate-messages.mjs fills in the other languages but needs Google Cloud credentials.
