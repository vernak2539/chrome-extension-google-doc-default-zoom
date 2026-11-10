---
topic: Exact check commands
---
Order from .factory/config.yml: `pnpm format:check` (oxfmt --check .), `pnpm lint` (oxlint .), `pnpm exec vitest run`, `pnpm build --target=chrome-mv3`. Auto-fix: `pnpm format` / `pnpm lint:fix`. CI (.github/workflows/sanity-check.yml) also builds edge-mv3 and firefox-mv2 and repeats the builds after `pnpm transform-ext`.
