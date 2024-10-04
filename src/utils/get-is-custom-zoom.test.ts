import { DOCS_ZOOM_VALUES, SHEETS_ZOOM_VALUES } from "src/constants";
import { describe, expect, test, vi } from "vitest";
import getIsCustomZoom from "./get-is-custom-zoom";

vi.mock("src/utils/localize", (original) => {
  return {
    default: (string: string) => string
  };
});

describe("getIsCustomZoom", () => {
  describe("Docs", () => {
    test("should return true if not predefined value", () => {
      expect(getIsCustomZoom("Docs", "123%")).toBe(true);
    });

    test.each(DOCS_ZOOM_VALUES)(
      "should return false if predefined value (%i)",
      (value) => {
        expect(getIsCustomZoom("Docs", value)).toBe(false);
      }
    );
  });

  describe("Sheets", () => {
    test("should return true if not predefined value", () => {
      expect(getIsCustomZoom("Sheets", "123%")).toBe(true);
    });

    test.each(SHEETS_ZOOM_VALUES)(
      "should return false if predefined value (%i)",
      (value) => {
        expect(getIsCustomZoom("Sheets", value)).toBe(false);
      }
    );
  });
});
