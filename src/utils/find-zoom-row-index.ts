const isDigit = (character: string | undefined) =>
  character !== undefined && character >= "0" && character <= "9";

/**
 * True when `text` contains `value` and the match is not part of a longer number, i.e. no digit
 * directly before or after it ("50%" must not match inside "150%").
 */
const containsWholeValue = (text: string, value: string): boolean => {
  let start = text.indexOf(value);

  while (start !== -1) {
    const end = start + value.length;

    if (!isDigit(text[start - 1]) && !isDigit(text[end])) {
      return true;
    }

    start = text.indexOf(value, start + 1);
  }

  return false;
};

/**
 * Finds the first menu row that contains the zoom value. A percent value is matched by its number
 * alone, because Docs writes the sign after it (`50%`, `50 %`), before it in Arabic (`%50`) or as
 * `٪` in Persian. Only digits are checked at the edges, so `50` never matches inside `150` and
 * localized "Fit" labels in any script still match.
 *
 * Returns -1 when no row matches.
 */
export const findZoomRowIndex = (
  rowContents: ReadonlyArray<string | null | undefined>,
  zoomValue: string
): number => {
  const value = zoomValue.trim();
  const target = value.endsWith("%") ? value.slice(0, -1) : value;

  return rowContents.findIndex((content) => !!content && containsWholeValue(content, target));
};
