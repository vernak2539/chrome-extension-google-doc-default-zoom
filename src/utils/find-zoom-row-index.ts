const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Finds the first menu row whose text contains the whole zoom value. A digit directly before or
 * after the value means it is part of a different number ("50%" must not match "150%"). Only
 * digits are checked so localized "Fit" labels in any script still match.
 *
 * Returns -1 when no row matches.
 */
export const findZoomRowIndex = (
  rowContents: ReadonlyArray<string | null | undefined>,
  zoomValue: string
): number => {
  const pattern = new RegExp(`(?<!\\d)${escapeRegExp(zoomValue.trim())}(?!\\d)`);

  return rowContents.findIndex((content) => !!content && pattern.test(content.trim()));
};
