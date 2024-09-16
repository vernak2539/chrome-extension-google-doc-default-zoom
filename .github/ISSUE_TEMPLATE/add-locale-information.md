---
name: Update/Add Locale Information
about: Use this issue type to update translations and/or add new locale support
title: Add Locale Information for XX locale
labels: localisation
assignees: vernak2539
---

## Localisation Request

- [ ] Update existing translation
- [ ] Add support for new locale

## Locale

**What locale are you looking to update or add?**

<INSERT_LOCALE>

## Update existing translation

**DELETE THIS SECTION IF NOT UPDATING AN EXISTING TRANSLATION**

Please follow the steps below to update an existing translation:

1. Update the value in the English translations file (`locales/en/messages.json`)
2. Update all other translation files based on the changes you made in the English translations file

## Add support for new locale

**DELETE THIS SECTION IF NOT ADDING A NEW LOCALE**

Please follow the steps below to add support for a new locale:

1. Create a new file in the `locales` directory with the appropriate language code (e.g. `locales/fr/messages.json` for French)
2. Copy the structure from the English translation file (e.g. `locales/en/messages.json`) and translate the values into the new language

### Images for Context

Below are screenshots of the extension with the English language selected.

![](https://raw.githubusercontent.com/vernak2539/chrome-extension-google-doc-default-zoom/main/.github/ISSUE_TEMPLATE/img-localisation-popup.png)

![](https://raw.githubusercontent.com/vernak2539/chrome-extension-google-doc-default-zoom/main/.github/ISSUE_TEMPLATE/img-localisation-page-versions.png)

![](https://raw.githubusercontent.com/vernak2539/chrome-extension-google-doc-default-zoom/main/.github/ISSUE_TEMPLATE/img-localisation-page-experimental-features.png)
