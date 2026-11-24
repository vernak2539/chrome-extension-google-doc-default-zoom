import { describe, expect, test } from "vitest";

import { getTextDirection } from "./text-direction";

describe("getTextDirection", () => {
  test.each(["he", "ar", "ar-EG", "ar_EG", "HE", "he-IL"])("should be rtl for %s", (uiLanguage) => {
    expect(getTextDirection(uiLanguage)).toBe("rtl");
  });

  test.each(["fa", "ur", "en-US", "de", "arx"])("should be ltr for %s", (uiLanguage) => {
    expect(getTextDirection(uiLanguage)).toBe("ltr");
  });
});
