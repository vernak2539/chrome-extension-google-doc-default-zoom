---
topic: env
source_issue: 105
---

In code review, `node_modules` is installed: the factory runs the checks, starting with `pnpm install --frozen-lockfile --ignore-scripts`, before the review agent starts. The sandbox lets you read it. Glob and Grep still report "No files found" for `node_modules/...`, because they use ripgrep: `/node_modules` is in `.gitignore`, and pnpm makes each package a symlink into `node_modules/.pnpm/`, which ripgrep does not follow. That result does not mean the folder is missing. Read package files by exact path, starting with `node_modules/<pkg>/package.json` for its `exports` map, for example `node_modules/@plasmohq/storage/dist/hook.js` (built files are minified onto one line). Grep works when `path` is a folder or file inside the package, such as `node_modules/@plasmohq/storage/dist`, but not the package folder itself. The plan stage is different: there `node_modules` has not been installed yet (see `plan-stage-no-node-modules`).
