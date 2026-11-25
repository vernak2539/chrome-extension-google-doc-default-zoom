// Docs ends the Fit row's aria-label with its mnemonic key: "Fit f", "התאמה f"
export const FIT_MNEMONIC = / f$/i;

const ANY_DIGIT = /[0-9٠-٩۰-۹]/;

export interface ZoomRowFacts {
  label: string;
  isCheckbox: boolean;
  shortcut: string;
}

/**
 * Reads what tells the Fit row apart from the zoom presets, from a menu row. It uses only DOM methods
 * that jsdom has too, and no `instanceof`, because a row can come from another window.
 */
export const readZoomRowFacts = (row: Element): ZoomRowFacts => {
  const ariaLabel = row.querySelector(".goog-menuitem-label")?.getAttribute("aria-label");

  return {
    label: ariaLabel
      ? ariaLabel.replace(FIT_MNEMONIC, "").trim()
      : (row.firstChild?.textContent ?? ""),
    isCheckbox:
      row.getAttribute("role") === "menuitemcheckbox" || row.classList.contains("goog-option"),
    shortcut: row.querySelector(".goog-menuitem-accel")?.textContent?.trim() ?? ""
  };
};

const indexesOf = (rows: ReadonlyArray<ZoomRowFacts>, keep: (row: ZoomRowFacts) => boolean) =>
  rows.flatMap((row, index) => (keep(row) ? [index] : []));

/**
 * Finds Docs' Fit zoom row without its text, which is translated into the language Docs is shown in
 * and not the extension's. Only Fit has no digit and is no checkbox; when something else qualifies too
 * (a new row Google added), the shortcut ending in `[` and then a known Fit label decide.
 *
 * Returns -1 unless exactly one row is left. It never uses the row's position and never guesses.
 */
export const findFitRowIndex = (
  rows: ReadonlyArray<ZoomRowFacts>,
  knownLabels: ReadonlyArray<string>
): number => {
  let candidates = indexesOf(rows, (row) => !ANY_DIGIT.test(row.label) && !row.isCheckbox);

  if (candidates.length > 1) {
    // the toolbar dropdown has no shortcuts, so this only narrows when some candidate has one
    const withShortcut = candidates.filter((index) => rows[index].shortcut.endsWith("["));

    if (withShortcut.length > 0) {
      candidates = withShortcut;
    }
  }

  if (candidates.length > 1) {
    candidates = candidates.filter((index) => knownLabels.includes(rows[index].label));
  }

  return candidates.length === 1 ? candidates[0] : -1;
};
