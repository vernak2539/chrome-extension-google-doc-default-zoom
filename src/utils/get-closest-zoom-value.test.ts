import { DOCS_ZOOM_VALUES } from "src/constants";
import { describe, expect, test, vi } from "vitest";
import { getClosestZoomValue } from "./get-closest-zoom-value";

vi.mock("src/utils/localize", (original) => {
  return {
    default: (string: string) => string
  };
});

describe("Docs", () => {
  describe("getClosesZoomValue", () => {
    test.each([
      ["0%", "50%"],
      ["50%", "50%"],
      ["60%", "50%"],
      ["70%", "75%"],
      ["75%", "75%"],
      ["85%", "75%"],
      ["95%", "100%"],
      ["100%", "100%"],
      ["110%", "100%"],
      ["123%", "125%"],
      ["130%", "125%"],
      ["135%", "125%"],
      ["140%", "150%"],
      ["150%", "150%"],
      ["175%", "150%"],
      ["176%", "200%"],
      ["200%", "200%"],
      ["300%", "200%"]
    ])("getClosesZoomValue - %i", (actual, expected) => {
      expect(getClosestZoomValue(DOCS_ZOOM_VALUES, actual)).toBe(expected);
    });
  });
});
