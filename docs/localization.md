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

### 2. Generate UI Translations

The translation script works in "diff mode" by default, meaning it will only translate keys that are present in `locales/en/messages.json` but missing in the target language.

1.  **Run the script:**
    ```bash
    GOOGLE_APPLICATION_CREDENTIALS=./creds.json node bin/translate-messages.mjs
    ```
    This will automatically create the `locales/pt/` directory and generate a `messages.json` file with translations for all keys.

### 3. Generate Store Listing Translations

The store listing script translates the contents of `docs/store-listings/`.

1.  **Run for both versions:**
    ```bash
    GOOGLE_APPLICATION_CREDENTIALS=./creds.json node bin/translate-store-listing-translate.mjs --listing=base
    GOOGLE_APPLICATION_CREDENTIALS=./creds.json node bin/translate-store-listing-translate.mjs --listing=extended
    ```
    This will create `pt.md` files in `docs/store-listings/base/` and `docs/store-listings/extended/`.

### 4. Manual Refinement

Machine translations can be imperfect. You can manually edit the generated JSON or Markdown files.

- **Diff Mode Safety:** Running the `translate-messages.mjs` script again in default mode will **not** overwrite your manual changes, as the keys are no longer considered "missing."

* **Force Update:** If you want to force an update for a specific key (overwriting manual changes), use the `--key` flag:
  ```bash
  GOOGLE_APPLICATION_CREDENTIALS=./creds.json node bin/translate-messages.mjs --key="yourKeyName"
  ```

## Developer Notes

- **Description Field:** The `description` field in `messages.json` is always copied from the English source to provide context for developers and future reviewers.
- **API Credentials:** These scripts require valid Google Cloud Translation API credentials.
