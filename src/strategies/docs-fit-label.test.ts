/// <reference types="node" />
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));
const LOCALES_DIR = path.join(ROOT, "public/_locales");
const FIT_KEY = "popupDocsDropdownFitSelection";

// The text of Docs' Fit zoom row in each language, recorded from live Docs by `pnpm e2e:capture`
const DOCS_FIT_LABELS: Record<string, string> = JSON.parse(
  readFileSync(path.join(ROOT, "src/strategies/docs-fit-labels.json"), "utf8")
);

const SHIPPED_LOCALES = readdirSync(LOCALES_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

const readFitMessage = (locale: string): string | undefined =>
  JSON.parse(readFileSync(path.join(LOCALES_DIR, locale, "messages.json"), "utf8"))[FIT_KEY]
    ?.message;

// This message is display text only (the popup stores "fit"), and it is the text Docs shows, not a translation of "Fit"
describe(FIT_KEY, () => {
  test.each(SHIPPED_LOCALES)("%s is the label Docs shows", (locale) => {
    expect(
      DOCS_FIT_LABELS[locale],
      `src/strategies/docs-fit-labels.json has no Fit label for ${locale}: run \`pnpm e2e:capture\``
    ).toBeTypeOf("string");

    expect(
      readFitMessage(locale),
      `public/_locales/${locale}/messages.json must keep ${FIT_KEY} as the label Docs shows`
    ).toBe(DOCS_FIT_LABELS[locale]);
  });
});
