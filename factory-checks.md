---
topic: ci
---

The pre-PR checks in `.factory/config.yml` run, in order: `pnpm install --frozen-lockfile --ignore-scripts`, `pnpm format:check`, `pnpm lint`, `pnpm exec vitest run`, `pnpm build --target=chrome-mv3`. `oxfmt --check .` also checks `.factory/memory/*.md`, so memory files need a blank line after the frontmatter (run `pnpm exec oxfmt .factory/memory/`).
