---
topic: Toolchain and install
---

pnpm@9.10.0 (packageManager in package.json), Node 22.13.0 (.node-version and CI). Install with `pnpm install --frozen-lockfile --ignore-scripts` (factory checks); --ignore-scripts skips husky's `prepare` hook. ESM package ("type": "module").
