import { describe, expect, test } from "vitest";
import getNumericZoom from "./get-numeric-zoom";

describe("getNumericZoom", () => {
  test("should return number if string without '%'", () => {
    expect(getNumericZoom("100")).toBe(100);
  });

  test("should return number if string with '%'", () => {
    expect(getNumericZoom("100%")).toBe(100);
  });
});
