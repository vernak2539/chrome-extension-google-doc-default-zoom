---
topic: content script flow
source_issue: 103
---

`src/contents/index.ts` starts only through `onElementAvailable(SELECTOR_PAGE_HEADER, ...)`, which needs a `document.body` childList mutation after the script is injected. A page where `#docs-chrome` already exists at injection and never mutates afterwards never starts the zoom flow. `all_frames` is true in the PlasmoCSConfig.
