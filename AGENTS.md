# GEMINI.md - Google Workspace Zoom Default

## Project Overview

A browser extension (Chrome, Edge, Firefox) designed to set a default zoom level for Google Docs and Google Sheets. It addresses the lack of a native "default zoom" setting in Google Workspace by programmatically interacting with the application's UI.

### Key Technologies

- **Framework:** [WXT](https://wxt.dev/) (Browser extension framework)
- **Library:** React 18
- **Language:** TypeScript
- **Styling:** CSS Modules, Vanilla CSS
- **Error Tracking:** Sentry
- **Testing:** Vitest
- **Documentation:** Storybook

### Architecture

The project follows a strategy-based architecture to handle different Google Workspace applications:

- **`src/entrypoints/`:** WXT entrypoints: `background.ts`, `content.ts` (which calls `src/content-script.ts`), `popup/index.html`, and the two unlisted pages (`ext-versions`, `experimental-features`). `src/content-script.ts` detects the current application (Docs or Sheets) and runs the matching driver.
- **`src/strategies/`:** Zoom decisions are made by the pure `planZoom` in `plan-zoom.ts` (no DOM, unit tested). `createDocsDriver` and `createSheetsDriver`, both built from `createZoomDriver` in `base.ts`, read the page, ask `planZoom` for a plan and run it by finding and interacting with the zoom UI elements. A driver holds no zoom decision; Docs passes its View-menu flow as an option.
- **`src/background/`:** Handles background tasks: storage reads and Sentry reporting. Custom zoom is applied by the content script with synthetic key events.
- **`src/utils/`:** Provides helper functions for DOM manipulation (`ui-helpers.ts`), localization (`localize.ts`), and storage.

### "Base" vs "Extended" Editions

The project maintains a single codebase for two editions of the extension:

1.  **Base:** Supports only predefined zoom levels.
2.  **Extended:** Supports custom zoom levels by typing the value into the zoom control with synthetic key events. Firefox ships Base only.

Each edition is a WXT build mode (`wxt build --mode base|extended`). The source is never rewritten, so what is tested is what ships. The browser comes from `-b chrome|edge|firefox`; Chrome and Edge build MV3 and Firefox builds MV2. Firefox ships only the Base edition: `wxt.config.ts` rejects `--mode extended -b firefox`, so there is no Firefox Extended build or release.

- **Code:** `IS_EXTENDED_EDITION` in `src/utils/edition.ts` is `import.meta.env.MODE === "extended"`. Any other mode means Base. Branch on it where the editions differ; search for it to find every such place.
- **Manifest:** the `EDITIONS` map in `wxt.config.ts` holds the name, Firefox add-on id and permissions for each mode. The manifest function writes them; there are no env files. `pnpm check:editions` fails when a built manifest does not match its edition.
- **Icons:** `assets/icons/<edition>/<size>.png` at 16, 32, 48, 64 and 128 px, supplied by the `build:publicAssets` hook. `assets/icon.base.png` and `assets/icon.extended.png` are the 662 px masters.
- **Output:** `build/<browser>-mv<n>-<edition>` (for example `build/chrome-mv3-base`) and `build/<browser>-mv<n>-<edition>.zip`. `wxt` dev uses the same mode and writes to the same directory, so a dev build overwrites a production build. Always rebuild (`pnpm build:<edition>`) before `pnpm package:<edition>` or `pnpm check:editions`: a dev build is unminified and writes the same directory. `wxt zip` always builds, and it leaves sourcemaps out of the zip.
- **Tests:** Vitest runs every test file once per edition (the `base` and `extended` projects in `vite.config.ts` set the mode). Tests for Extended-only code use `describe.runIf(IS_EXTENDED_EDITION)` or `test.runIf(IS_EXTENDED_EDITION)`. Storybook defines `MODE` as `extended`.

## Building and Running

### Development

```bash
pnpm dev        # Extended edition
pnpm dev:base   # Base edition
```

This starts the WXT development server. Load the generated extension from `build/chrome-mv3-extended` or `build/chrome-mv3-base` (or the appropriate `-b` browser directory) into your browser.

### Production Build

```bash
pnpm build:base
pnpm build:extended   # `pnpm build` is the same
pnpm package:base     # zips build/<target>-base
pnpm package:extended # `pnpm package` is the same
```

Pass `-b chrome|edge|firefox` as usual. Chrome and Edge build MV3, Firefox builds MV2. Firefox is Base-only; Extended builds target Chrome and Edge. Sourcemaps are always written next to the bundles in `build/<browser>-mv<n>-<edition>` and left out of the zips.

### Edition Check

```bash
pnpm check:editions
```

Run it after building. It fails when a built manifest in `build/<target>-<edition>` doesn't match its edition (name, Firefox add-on id, `debugger` permission, or a host permission), or when it finds no build.

### Type Checking and Bundle Size

Run both after `pnpm build:base -b chrome` and `pnpm build:extended -b chrome`. `pnpm typecheck` needs the `.wxt/` declarations that `wxt prepare` (or any build) creates, and `pnpm bundlesize` reads `build/chrome-mv3-*`, so it measures every edition you built for `chrome`.

```bash
pnpm typecheck
pnpm bundlesize
```

`pnpm typecheck` runs `tsc --noEmit` and must report no errors. `pnpm bundlesize` checks the gzipped size of every JS bundle against the budgets in `bundlesize.config.json`.

### Testing

```bash
pnpm test
```

Runs the Vitest suite once for each edition (use `pnpm test -- --run` to exit after one run).

Browser tests that load the built extension against saved or live Docs and Sheets pages are described in [docs/e2e.md](docs/e2e.md) (`pnpm test:e2e`).

### Storybook

```bash
pnpm storybook
```

Runs the Storybook development server for component documentation.

### Releasing

Bump with `npm version patch|minor|major` and `git push --follow-tags`; the tag publishes to the stores. See [docs/releasing.md](./docs/releasing.md).

## Development Conventions

### Coding Style

- **Mandatory Workflow:** Quality gates (formatting, linting, and tests) run automatically on `pre-commit` via `husky` and `lint-staged`. While automated, it is still good practice to manually verify your changes before committing.
- **Formatting:** oxfmt is used for code formatting (`pnpm format`).
- **Linting:** oxlint is used for linting (`pnpm lint`).
- **Imports:** oxfmt handles import sorting automatically via the `sortImports` option.
- **Naming:** Use PascalCase for React components and camelCase for functions and variables.

### UI Interaction

Google Docs/Sheets UI is complex. Use the `simulateClick` helper in `src/utils/ui-helpers.ts`, which dispatches `mousedown`, `mouseup`, and `click` events with coordinates, as standard `.click()` calls often fail to register.

### Localization

All user-facing strings should be localized using `src/utils/localize.ts`, which wraps `chrome.i18n.getMessage`. Localized strings are stored in `public/_locales/`.

For instructions on adding new languages or managing translations, refer to [docs/localization.md](./docs/localization.md).

### Conditional Code

Branch on `IS_EXTENDED_EDITION` (`src/utils/edition.ts`) for code that should only run in the "Extended" edition. Both editions are built from the same source, so a branch has to compile in both:

```typescript
import { IS_EXTENDED_EDITION } from "src/utils/edition";

if (IS_EXTENDED_EDITION) {
  // Extended-only logic here
}
```

## Pull Request & Code Review Workflow

When tasking with addressing PR reviews or managing the PR lifecycle, follow this workflow:

### 1. Verification

- **Tests:** **ALWAYS** run tests using `pnpm test -- --run` (or similar non-watching flags) to ensure the process terminates automatically.
- **Build:** Run `pnpm build:base` and `pnpm build:extended`, then `pnpm check:editions`, to verify both editions bundle correctly.
- **Types and size:** After building both editions, run `pnpm typecheck` and `pnpm bundlesize`.
- **Format/Lint:** Run `pnpm format` and `pnpm lint` as per the mandatory workflow.

### 2. Addressing Reviews

- **Fetch Comments:** Use `gh api repos/{owner}/{repo}/pulls/{number}/comments` to read latest feedback.
- **Action Comments:** Implement requested changes surgically.
- **Resolve Threads:** After pushing fixes, resolve the corresponding review threads using the GitHub GraphQL API (`resolveReviewThread` mutation). This provides clear visual feedback that a comment has been addressed.
- **Re-request Review:** Use `gh pr edit {number} --add-reviewer {login}` or `gh pr comment` to notify reviewers of the updates.

### 3. Pushing Changes

- **Quality Gates:** Automated `pre-commit` hooks handle formatting, linting, and testing. Ensure all hooks pass before pushing.
- Ensure all commits follow the existing style and that the remote branch is kept up to date (`git push`).
