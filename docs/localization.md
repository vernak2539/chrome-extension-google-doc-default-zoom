# Localization

The extension supports multiple languages for both its UI and its store listings. We use the Google Cloud Translation API to automate the initial translation from English to other supported languages.

## Supported Languages

The source of truth for all supported languages is `bin/translate-config.mjs`.

## How to Add a New Language

To add a new language (e.g., Portuguese) to the extension, follow these steps:

### 1. Update the Shared Config

Add the new language to the `LANGUAGES` array in `bin/translate-config.mjs`:

```javascript
export const LANGUAGES = [...{ code: "pt", name: "Portuguese" }];
```

### 2. Record Docs' Fit Label

`popupDocsDropdownFitSelection` is not a translation. Both zoom flows find the Fit row of the Docs zoom menu by this text, so it has to be the label Docs itself shows in that language (Docs shows "An Fenstergröße anpassen" in German, not "Anpassen"). A translation service can't know it.

`pnpm e2e:capture` records it from live Docs, signed out, in every language in `bin/translate-config.mjs`, into `e2e/fixtures/docs-fit-labels.json` ([e2e.md](./e2e.md#capture-and-refresh-the-fixtures)). It needs no Google account or build. To record only the Fit labels:

```bash
pnpm exec vitest run --config e2e/vitest.config.ts e2e/capture -t "Fit label"
```

Each run of the `E2E live` workflow does the same, and its `fixtures` artifact holds the file. Commit `e2e/fixtures/docs-fit-labels.json`.

### 3. Generate UI Translations

The translation script works in "diff mode" by default, meaning it will only translate keys that are present in `public/_locales/en/messages.json` but missing in the target language.

1.  **Run the script:**
    ```bash
    GOOGLE_APPLICATION_CREDENTIALS=./creds.json node bin/translate-messages.mjs
    ```
    This will automatically create the `public/_locales/pt/` directory and generate a `messages.json` file with translations for all keys.

The script never machine-translates `popupDocsDropdownFitSelection`. When a language has none, it copies the label from `e2e/fixtures/docs-fit-labels.json`. When no label is recorded for the language, it leaves the key out, says so, and exits with an error: run step 2, then the script again. It never replaces a Fit label that exists, and `--key=popupDocsDropdownFitSelection` is refused.

### 4. Generate Store Listing Translations

The store listing script translates `docs/store-listings/<listing>/en.md` into each language that has no `<code>.md` yet. It leaves existing listings alone.

1.  **Run for both versions:**
    ```bash
    GOOGLE_APPLICATION_CREDENTIALS=./creds.json node bin/translate-store-listing-translate.mjs --listing=base
    GOOGLE_APPLICATION_CREDENTIALS=./creds.json node bin/translate-store-listing-translate.mjs --listing=extended
    ```
    This will create `pt.md` files in `docs/store-listings/base/` and `docs/store-listings/extended/`.
2.  **Re-translate an existing listing** (after changing `en.md`, for example) with `--force`. It takes one or more language codes and overwrites those files:
    ```bash
    GOOGLE_APPLICATION_CREDENTIALS=./creds.json node bin/translate-store-listing-translate.mjs --listing=base --force=pt
    GOOGLE_APPLICATION_CREDENTIALS=./creds.json node bin/translate-store-listing-translate.mjs --listing=base --force=de,fr
    ```

### 5. Manual Refinement

Machine translations can be imperfect. You can manually edit the generated JSON or Markdown files.

- **Diff Mode Safety:** Running the `translate-messages.mjs` script again in default mode will **not** overwrite your manual changes, as the keys are no longer considered "missing."

* **Force Update:** If you want to force an update for a specific key (overwriting manual changes), use the `--key` flag:
  ```bash
  GOOGLE_APPLICATION_CREDENTIALS=./creds.json node bin/translate-messages.mjs --key="yourKeyName"
  ```

- **Don't edit the Fit label:** `src/strategies/docs-fit-label.test.ts` fails when a locale's `popupDocsDropdownFitSelection` is not the label in `e2e/fixtures/docs-fit-labels.json`. de, fr, ja and ru still ship labels Docs doesn't show. Correcting them changes the Fit value users have saved, so [#106](https://github.com/vernak2539/chrome-extension-google-doc-default-zoom/issues/106) fixes them with its migration. Until then the test pins them as they are.

## Developer Notes

- **Description Field:** The `description` field in `messages.json` is always copied from the English source to provide context for developers and future reviewers.
- **API Credentials:** These scripts require valid Google Cloud Translation API credentials.
