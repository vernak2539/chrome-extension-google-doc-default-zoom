import { describe, expect, test } from "vitest";

import { fillAppState } from "./constants";

// No localize mock: the constants must not depend on a language.
const LEGACY_FIT_LABELS = [
  "Fit",
  "Ajustar",
  "Adatta",
  "Ajuster",
  "Anpassen",
  "フィット",
  "Подогнать",
  "An Fenstergröße anpassen",
  "Ajuster à la fenêtre",
  "合わせる",
  "По ширине страницы",
  "ملاءمة",
  "התאמה"
];

const stateWith = (zoomValue: string) => ({ zoomValue, viewOnly: true, classroomSupport: true });

describe("fillAppState", () => {
  test.each(LEGACY_FIT_LABELS)("should read the saved Docs label %s as fit", (label) => {
    expect(fillAppState("docs", stateWith(label))).toEqual(stateWith("fit"));
  });

  test("should keep a saved fit", () => {
    expect(fillAppState("docs", stateWith("fit"))).toEqual(stateWith("fit"));
  });

  test("should leave Docs percentages and custom values unchanged", () => {
    expect(fillAppState("docs", stateWith("150%")).zoomValue).toBe("150%");
    expect(fillAppState("docs", stateWith("140%")).zoomValue).toBe("140%");
  });

  test("should leave Sheets values unchanged", () => {
    expect(fillAppState("sheets", stateWith("Fit")).zoomValue).toBe("Fit");
    expect(fillAppState("sheets", stateWith("150%")).zoomValue).toBe("150%");
  });
});
