import { describe, expect, test } from "vitest";

import { DOCS_FIT_LABELS, DOCS_ZOOM_VALUE_FIT, fillAppState, getZoomRowLabels } from "./constants";

// No localize mock: the constants must not depend on the browser language
describe("fillAppState", () => {
  test.each(DOCS_FIT_LABELS)('should read the legacy Fit label "%s" as "fit"', (label) => {
    expect(fillAppState("docs", { zoomValue: label }).zoomValue).toBe(DOCS_ZOOM_VALUE_FIT);
  });

  test("should keep the other fields when it reads a legacy Fit label", () => {
    expect(
      fillAppState("docs", { zoomValue: "Anpassen", viewOnly: true, classroomSupport: true })
    ).toEqual({ zoomValue: "fit", viewOnly: true, classroomSupport: true });
  });

  test.each(["fit", "150%", "130%"])("should keep the stored zoom value %s", (zoomValue) => {
    expect(fillAppState("docs", { zoomValue }).zoomValue).toBe(zoomValue);
  });

  test("should fall back to the default zoom when nothing is stored", () => {
    expect(fillAppState("docs").zoomValue).toBe("100%");
  });
});

describe("getZoomRowLabels", () => {
  test("should list every Fit translation for fit", () => {
    expect(getZoomRowLabels(DOCS_ZOOM_VALUE_FIT)).toEqual(DOCS_FIT_LABELS);
  });

  test("should list only the value for a percentage", () => {
    expect(getZoomRowLabels("150%")).toEqual(["150%"]);
  });
});
