# GEMINI.md - Google Workspace Zoom Default

## Project Overview

A browser extension (Chrome, Edge, Firefox) designed to set a default zoom level for Google Docs and Google Sheets. It addresses the lack of a native "default zoom" setting in Google Workspace by programmatically interacting with the application's UI.

### Key Technologies

- **Framework:** [Plasmo](https://docs.plasmo.com/) (Browser extension framework)
- **Library:** React 18
- **Language:** TypeScript
- **Styling:** CSS Modules, Vanilla CSS
- **Error Tracking:** Sentry
- **Testing:** Vitest
- **Documentation:** Storybook

### Architecture

The project follows a strategy-based architecture to handle different Google Workspace applications:

- **`src/contents/index.ts`:** The main entry point for the content script, which detects the current application (Docs or Sheets) and executes the appropriate strategy.
- **`src/strategies/`:** Contains `DocsStrategy` and `SheetsStrategy`, both inheriting from `AbstractBaseStrategy`. These classes encapsulate the logic for finding and interacting with the zoom UI elements.
- **`src/background/`:** Handles background tasks, notably using the `chrome.debugger` API in the "Extended" version to simulate keyboard events for custom zoom values.
- **`src/utils/`:** Provides helper functions for DOM manipulation (`ui-helpers.ts`), localization (`localize.ts`), and storage.

### "Base" vs "Extended" Editions

The project maintains a single codebase for two editions of the extension:

1.  **Base:** Supports only predefined zoom levels.
2.  **Extended:** Supports custom zoom levels by using the `debugger` permission (not available on Firefox).

Each edition is a Plasmo build tag (`plasmo build --tag=base|extended`). The source is never rewritten, so what is tested is what ships.

- **Code:** `IS_EXTENDED_EDITION` in `src/utils/edition.ts` is `process.env.PLASMO_TAG === "extended"`. An unset tag means Base. Branch on it where the editions differ (`customZoomInput` in `src/constants.ts`, the `execute-enter` relay in `src/contents/index.ts`, the guard in `src/background/messages/execute-enter.ts`, the popup heading, the Sentry `extension` tag). Plasmo bundles every file in `src/background/messages/`, so a handler must check the edition itself for the minifier to drop its code from Base.
- **Manifest:** `package.json` `manifest` holds `$PLASMO_PUBLIC_EXT_NAME`, `$DEBUGGER_PERMISSION` and `$FIREFOX_EXT_ID`. Plasmo fills them from the committed `.env.base` and `.env.extended` (non-secret values only; `.gitignore` has exceptions for these two files). A missing variable does **not** fail the build: an empty `$DEBUGGER_PERMISSION` silently drops the permission and a missing `PLASMO_PUBLIC_EXT_NAME` falls back to the Extended name. `pnpm check:editions` catches both.
- **Icons:** `assets/icon.base.png` and `assets/icon.extended.png`. Plasmo picks `icon.<tag>.png` before `icon.png`, and there is no untagged icon.
- **Output:** `build/<target>-<edition>` (for example `build/chrome-mv3-base`) and `build/<target>-<edition>.zip`. `plasmo dev` uses the same `--tag` and writes `build/<target>-<edition>` too.
- **Tests:** Vitest runs every test file once per edition (the `base` and `extended` projects in `vite.config.ts` set `PLASMO_TAG`). Tests for Extended-only code use `describe.runIf(IS_EXTENDED_EDITION)` or `test.runIf(IS_EXTENDED_EDITION)`. Storybook defines `PLASMO_TAG` as `extended`.

## Building and Running

### Development

```bash
pnpm dev        # Extended edition
pnpm dev:base   # Base edition
```

This starts the Plasmo development server. Load the generated extension from `build/chrome-mv3-extended` or `build/chrome-mv3-base` (or the appropriate target directory) into your browser.

### Production Build

```bash
pnpm build:base
pnpm build:extended   # `pnpm build` is the same
pnpm package:base     # zips build/<target>-base
pnpm package:extended # `pnpm package` is the same
```

Pass `--target=chrome-mv3|edge-mv3|firefox-mv2` and `--source-maps` as usual. The bundles are written to `build/<target>-<edition>`.

### Edition Check

```bash
pnpm check:editions
```

Run it after building. It checks every `build/<target>-<edition>` directory and exits with 1 when a manifest has an unexpanded `$VARIABLE` or an empty permission, when Base has the `debugger` permission or Extended does not, when the manifest name or the Firefox add-on id is wrong, when a Base bundle contains `Input.insertText`, `Input.dispatchKeyEvent` or the Extended popup heading, or when no Extended bundle contains `Input.insertText`. It also fails when it finds no build.

### Type Checking and Bundle Size

Run both after `pnpm build:base --target=chrome-mv3` and `pnpm build:extended --target=chrome-mv3`. `pnpm typecheck` needs the `.plasmo/` declarations that the build creates, and `pnpm bundlesize` reads `build/chrome-mv3-*`, so it measures every edition you built for `chrome-mv3`.

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

All user-facing strings should be localized using `src/utils/localize.ts`, which wraps `chrome.i18n.getMessage`. Localized strings are stored in `locales/`.

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
