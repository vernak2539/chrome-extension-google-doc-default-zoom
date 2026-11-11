import { DOCS_ZOOM_VALUES } from "src/constants";
import { describe, expect, test, vi } from "vitest";

import { findZoomRowIndex } from "./find-zoom-row-index";

vi.mock("src/utils/localize", () => {
  return {
    default: (string: string) => string
  };
});

describe("Docs", () => {
  describe("findZoomRowIndex", () => {
    test.each(DOCS_ZOOM_VALUES.map((value, index) => [value, index] as const))(
      "should select the row of preset %s",
      (value, index) => {
        expect(findZoomRowIndex([...DOCS_ZOOM_VALUES], value)).toBe(index);
      }
    );

    test("should select 50% rather than 150%", () => {
      expect(findZoomRowIndex(["Fit", "50%", "75%", "100%", "125%", "150%", "200%"], "50%")).toBe(
        1
      );
    });

    test("should tolerate whitespace and extra text in rows", () => {
      const rows = [" Fit ", " 50% ", "75%", "100%", "125%", "150% ", "200%"];

      expect(findZoomRowIndex(rows, "50%")).toBe(1);
      expect(findZoomRowIndex(rows, "150%")).toBe(5);
      expect(findZoomRowIndex(["Fit", "50% (default)", "150%"], "50%")).toBe(1);
    });

    test("should match localized fit labels", () => {
      expect(findZoomRowIndex(["フィット", "50%", "75%"], "フィット")).toBe(0);
      expect(findZoomRowIndex(["Ajustar", "50%", "75%"], "Ajustar")).toBe(0);
    });

    test("should return -1 when no row matches", () => {
      expect(findZoomRowIndex(["Fit", "50%", "75%"], "300%")).toBe(-1);
    });

    test("should skip null and empty rows", () => {
      expect(findZoomRowIndex([null, undefined, "", "50%"], "50%")).toBe(3);
    });

    test("should select the first match", () => {
      expect(findZoomRowIndex(["75%", "50%", "50%"], "50%")).toBe(1);
    });
  });
});
