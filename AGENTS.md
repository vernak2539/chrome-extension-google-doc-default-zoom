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

### "Base" vs "Extended" Versions

The project maintains a single codebase for two versions of the extension:

1.  **Base:** Supports only predefined zoom levels.
2.  **Extended:** Supports custom zoom levels by using the `debugger` permission (not available on Firefox).

Transformation between these versions is handled by scripts in the `bin/` directory (`transform-extension.mjs`, `update-code-files.sh`), which strip code blocks marked with `/*--EXTENDED_ONLY_START--*/` and `/*--EXTENDED_ONLY_END--*/`.

## Building and Running

### Development

```bash
pnpm dev
```

This starts the Plasmo development server. Load the generated extension from `build/chrome-mv3-dev` (or the appropriate target directory) into your browser.

### Production Build

```bash
pnpm build
```

Generates a production-ready bundle in the `build/` directory.

### Testing

```bash
pnpm test
```

Runs the Vitest suite.

### Storybook

```bash
pnpm storybook
```

Runs the Storybook development server for component documentation.

### Version Transformation

To transform the "Extended" source (the default state of the repository) into the "Base" version:

```bash
pnpm transform-ext
```

**Warning:** This script modifies `package.json` and files in `src/` in-place.

## Development Conventions

### Coding Style

- **Mandatory Workflow:** **ALWAYS** run `pnpm format` and `pnpm lint` before completing any code changes or submitting a PR.
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

Use the following markers for code that should only exist in the "Extended" version:

```typescript
/*--EXTENDED_ONLY_START--*/
// Extended-only logic here
/*--EXTENDED_ONLY_END--*/
```

## Pull Request & Code Review Workflow

When tasking with addressing PR reviews or managing the PR lifecycle, follow this workflow:

### 1. Verification

- **Tests:** **ALWAYS** run tests using `pnpm test -- --run` (or similar non-watching flags) to ensure the process terminates automatically.
- **Build:** Run `pnpm build` to verify the extension bundles correctly.
- **Format/Lint:** Run `pnpm format` and `pnpm lint` as per the mandatory workflow.

### 2. Addressing Reviews

- **Fetch Comments:** Use `gh api repos/{owner}/{repo}/pulls/{number}/comments` to read latest feedback.
- **Action Comments:** Implement requested changes surgically.
- **Resolve Threads:** After pushing fixes, resolve the corresponding review threads using the GitHub GraphQL API (`resolveReviewThread` mutation). This provides clear visual feedback that a comment has been addressed.
- **Re-request Review:** Use `gh pr edit {number} --add-reviewer {login}` or `gh pr comment` to notify reviewers of the updates.

### 3. Pushing Changes

- **Format & Lint:** **ALWAYS** run `pnpm format` and `pnpm lint` immediately before pushing. Pushing unformatted code is a failure.
- Ensure all commits follow the existing style and that the remote branch is kept up to date (`git push`).
