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

    test("should match Arabic rows that write the sign before the number", () => {
      const rows = [
        "ملاءمة(F)⌘+الخيار+[",
        "%50(1)",
        "%75(2)",
        "%90(3)",
        "%100(4)⌘0",
        "%125",
        "%150(6)",
        "%200(7)"
      ];

      expect(findZoomRowIndex(rows, "50%")).toBe(1);
      expect(findZoomRowIndex(rows, "150%")).toBe(6);
      expect(findZoomRowIndex(rows, "ملاءمة")).toBe(0);
    });

    test("should match Persian rows that use the Arabic percent sign", () => {
      const rows = ["پر کردن پنجره", "50٪(1)", "150٪(6)"];

      expect(findZoomRowIndex(rows, "50%")).toBe(1);
      expect(findZoomRowIndex(rows, "150%")).toBe(2);
    });

    test("should match rows with a non-breaking space before the sign", () => {
      const rows = ["Ajuster(F)", "50\u00a0%(1)", "150\u00a0%(6)"];

      expect(findZoomRowIndex(rows, "150%")).toBe(2);
    });
  });
});
