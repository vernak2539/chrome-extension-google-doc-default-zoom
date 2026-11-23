---
topic: editions
source_issue: 165
---

`src/utils/edition.ts` exports `IS_EXTENDED_EDITION = import.meta.env.MODE === "extended"`, the `Edition` type (`"base" | "extended"`) and `EDITION`. `vite.config.ts` has Vitest projects `base` and `extended` that set `mode`, so every test file runs once per edition. `e2e/harness.ts` has its own `Edition` type.
