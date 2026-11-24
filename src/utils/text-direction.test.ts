/// <reference types="node" />
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

import { getTextDirection, RTL_LANGUAGES } from "./text-direction";

const LOCALES_DIR = fileURLToPath(new URL("../../public/_locales", import.meta.url));

// A fixed list of RTL languages to exercise the RTL branch with, independent of which locales ship
const RTL = { ar: true, he: true } as const;

describe("getTextDirection", () => {
  test.each(["he", "ar", "ar-EG", "ar_EG", "HE", "he-IL"])(
    "should be rtl for %s when the list has it",
    (uiLanguage) => {
      expect(getTextDirection(uiLanguage, RTL)).toBe("rtl");
    }
  );

  test.each(["fa", "ur", "en-US", "de", "arx"])(
    "should be ltr for %s when the list does not have it",
    (uiLanguage) => {
      expect(getTextDirection(uiLanguage, RTL)).toBe("ltr");
    }
  );

  test("should be ltr for en-US with the shipped list", () => {
    expect(getTextDirection("en-US")).toBe("ltr");
  });
});

describe("RTL_LANGUAGES", () => {
  test.each(Object.keys(RTL_LANGUAGES))("%s ships a locale", (code) => {
    expect(
      existsSync(path.join(LOCALES_DIR, code, "messages.json")),
      `${code} is in RTL_LANGUAGES but public/_locales/${code}/messages.json does not exist`
    ).toBe(true);
  });

  test("lists every right-to-left locale that ships", () => {
    const rtlLocales = readdirSync(LOCALES_DIR, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .filter(
        (name) =>
          (
            new Intl.Locale(name.replace("_", "-")) as Intl.Locale & {
              getTextInfo(): { direction: "ltr" | "rtl" };
            }
          ).getTextInfo().direction === "rtl"
      );

    for (const name of rtlLocales) {
      expect(
        RTL_LANGUAGES[name.split("_")[0]],
        `public/_locales/${name} is a right-to-left locale missing from RTL_LANGUAGES`
      ).toBe(true);
    }
  });
});
