## Translation of Store Listings

This is done using Google Cloud Translation API, which will give us consistent translations.

To translate the store listings, run the following command:

```bash
GOOGLE_APPLICATION_CREDENTIALS=./ node bin/translate-store-listing-translate.mjs --listing=base
```

or

```bash
GOOGLE_APPLICATION_CREDENTIALS=./ node bin/translate-store-listing-translate.mjs --listing=extended
```
