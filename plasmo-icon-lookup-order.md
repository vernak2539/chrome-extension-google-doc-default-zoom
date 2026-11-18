---
topic: build
source_issue: 104
---

Plasmo 0.90.5 picks the icon (`Fc` in `node_modules/plasmo/dist/index.js`) in this order: `icon.<tag>.<NODE_ENV>.png`, `icon.<NODE_ENV>.png`, `icon.<tag>.png`, `icon.png` (also `icon512`, `icon-512` and similar names). The tag defaults to `prod`/`dev` when neither `--tag` nor PLASMO_TAG is set.
