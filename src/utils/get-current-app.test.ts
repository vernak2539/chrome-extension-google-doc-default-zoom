import { describe, expect, test } from "vitest";
import getCurrentApp from "./get-current-app";

describe("getCurrentApp", () => {
  describe("Docs", () => {
    test("should return 'Docs' if docs URL", () => {
      const href =
        "https://docs.google.com/document/d/1T5dfgvgJ9dbnY7fecFhpZPC_RivgKkqx7AIqNZLNzBg/edit";

      expect(getCurrentApp(href)).toBe("Docs");
    });

    test("should return null if not docs URL", () => {
      const href = "http://example.com/test";

      expect(getCurrentApp(href)).toBeNull();
    });
  });

  describe("Sheets", () => {
    test("should return 'Sheets' if sheets URL", () => {
      const href =
        "https://docs.google.com/spreadsheets/d/1tgKLl1vOAyEbGuoEJj59fx14CAGDYUu0xQUJucgG-aE/edit?gid=0#gid=0";

      expect(getCurrentApp(href)).toBe("Sheets");
    });

    test("should return null if not sheets URL", () => {
      const href = "http://example.com/test";

      expect(getCurrentApp(href)).toBeNull();
    });
  });
});
