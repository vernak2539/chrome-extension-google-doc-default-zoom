_copied from bootstrapping_

## Getting Started

First, run the development server:

```bash
pnpm dev        # Extended edition
pnpm dev:base   # Base edition
```

Open your browser and load the appropriate development build. The directory is named after the browser, the manifest version and the edition. For example, if you are developing the Extended edition for Chrome with manifest v3, use: `build/chrome-mv3-extended`.

The build is [WXT](https://wxt.dev/). Entrypoints live in `src/entrypoints/`: `background.ts`, `content.ts`, the popup (`popup/index.html` plus `main.tsx`), and the unlisted pages `ext-versions` and `experimental-features`. Shared code stays in `src/`. Entrypoints are only the thin mount points; the behavior lives in the modules they import.

For further guidance, [visit the WXT documentation](https://wxt.dev/guide/essentials/project-structure).

## Making production build

Run the following:

```bash
pnpm build:base -b chrome
pnpm build:extended -b chrome
pnpm check:editions
```

`-b chrome|edge|firefox` picks the browser; Chrome and Edge build MV3, Firefox builds MV2. This creates a production bundle for each edition in `build/<browser>-mv<n>-<edition>` (for example `build/chrome-mv3-base`), ready to be zipped (`pnpm package:base`, `pnpm package:extended`) and published to the stores. `pnpm build` and `pnpm package` are short for the Extended edition. `pnpm check:editions` fails when a built manifest or bundle does not match its edition. See "Base vs Extended Editions" in [AGENTS.md](../AGENTS.md).

## Storage

Settings live in `chrome.storage.sync`; announcement dismissals live in `chrome.storage.local`. All access goes through `src/utils/storage.ts`, which reads and writes WXT storage keys (`sync:docs`, `sync:sheets`, `sync:schemaVersion`, `local:dismissedAnnouncementIds`).

Builds made before the move to WXT stored each value as JSON text. The background migration rewrites them as plain values on startup, and every read still decodes JSON text in case another device is running an older version. In development, the settings page has Dev Tools buttons to reset the settings, downgrade them to the V1 flat keys, or write them back in the old JSON-text format to exercise the upgrade path. See [STORAGE_SCHEMA.md](./STORAGE_SCHEMA.md).

## Releasing

See [releasing.md](./releasing.md).

## Development Tips

### Requesting PR Reviews from GitHub Copilot

You can request a review from GitHub Copilot using the following commands:

Using `gh pr edit`:

```bash
gh pr edit <pr-number-or-url> --add-reviewer @copilot
```

Or when creating a new PR:

```bash
gh pr create --add-reviewer @copilot
```
