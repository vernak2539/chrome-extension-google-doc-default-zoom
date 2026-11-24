// @vitest-environment jsdom
import { describe, expect, test } from "vitest";

import { findFitRowIndex, readZoomRowFacts } from "./find-fit-row";

const KNOWN_LABELS = ["Fit", "An Fenstergröße anpassen", "合わせる", "ملاءمة"];

const PRESETS = ["50%", "75%", "100%", "125%", "150%", "200%"];

const presetRow = (text: string) =>
  `<div class="goog-menuitem apps-menuitem goog-option" role="menuitemcheckbox"><div class="goog-menuitem-content">${text}</div></div>`;

// View > Zoom: Fit has a label with its mnemonic and a shortcut, the presets are checkboxes
const viewMenuRow = (label: string, shortcut: string, role = "menuitem") =>
  `<div class="goog-menuitem apps-menuitem" role="${role}"><div class="goog-menuitem-content"><span class="goog-menuitem-label" aria-label="${label} f">${label}</span><span class="goog-menuitem-accel">${shortcut}</span></div></div>`;

// The toolbar dropdown rows are text only
const toolbarRow = (text: string) =>
  `<div class="goog-menuitem"><div class="goog-menuitem-content">${text}</div></div>`;

const findIn = (rowsHtml: string[], knownLabels = KNOWN_LABELS) => {
  const menu = document.createElement("div");
  menu.innerHTML = rowsHtml.join("");

  return findFitRowIndex(
    Array.from(menu.querySelectorAll(".goog-menuitem"), readZoomRowFacts),
    knownLabels
  );
};

describe("findFitRowIndex in View > Zoom", () => {
  test.each([
    ["en", "Fit", "⌘+Option+["],
    ["de", "An Fenstergröße anpassen", "⌘+Wahltaste+["],
    ["ja", "合わせる", "⌘+Option+["],
    ["ar", "ملاءمة", "⌘+الخيار+["]
  ])("should find the Fit row in %s", (_language, label, shortcut) => {
    expect(findIn([viewMenuRow(label, shortcut), ...PRESETS.map(presetRow)])).toBe(0);
  });

  test("should not use the row's position", () => {
    expect(findIn([...PRESETS.map(presetRow), viewMenuRow("Fit", "⌘+Option+[")])).toBe(
      PRESETS.length
    );
  });

  test("should find Fit by its shortcut when Google adds another row that is not a checkbox", () => {
    const rows = [
      viewMenuRow("Presentation", "⌘+Option+Shift+P"),
      viewMenuRow("Fit", "⌘+Option+["),
      ...PRESETS.map(presetRow)
    ];

    expect(findIn(rows)).toBe(1);
  });

  test("should return -1 when two rows qualify and the shortcut does not tell them apart", () => {
    const rows = [viewMenuRow("Ajustar", "⌘+Option+["), viewMenuRow("Otro", "⌘+Option+[")];

    expect(findIn([...rows, ...PRESETS.map(presetRow)])).toBe(-1);
  });

  test("should return -1 when every row is a preset", () => {
    expect(findIn(PRESETS.map(presetRow))).toBe(-1);
  });

  test("should read a non-checkbox row with a digit in its label as a preset", () => {
    expect(findIn([viewMenuRow("100%", ""), viewMenuRow("Fit", "⌘+Option+[")])).toBe(1);
  });
});

describe("findFitRowIndex in the toolbar dropdown", () => {
  const presets = PRESETS.map(toolbarRow);

  test.each(["Fit", "Ajustar", "ملاءمة"])(
    "should find the only row without a digit: %s",
    (label) => {
      expect(findIn([toolbarRow(label), ...presets], KNOWN_LABELS)).toBe(0);
    }
  );

  test("should treat Arabic-Indic and Persian digits as digits", () => {
    expect(findIn([toolbarRow("٥٠٪"), toolbarRow("۷۵٪"), toolbarRow("Fit")])).toBe(2);
  });

  test("should pick the row with a known label when a row with no digit is added", () => {
    expect(
      findIn([toolbarRow("New feature"), toolbarRow("An Fenstergröße anpassen"), ...presets])
    ).toBe(1);
  });

  test("should return -1 when a row with no digit is added and no label is known", () => {
    expect(findIn([toolbarRow("New feature"), toolbarRow("Ajustar"), ...presets])).toBe(-1);
  });
});

describe("readZoomRowFacts", () => {
  test("should fall back to the text of the first child when the row has no label", () => {
    const row = document.createElement("div");
    row.innerHTML = `<div>Ajustar</div>`;

    expect(readZoomRowFacts(row)).toEqual({ label: "Ajustar", isCheckbox: false, shortcut: "" });
  });
});
