const MENU_SELECTOR = ".goog-menu";

/**
 * Finds the open zoom dropdown menu for the zoom combobox.
 *
 * Google Docs and Sheets set `aria-owns` on the combobox once the menu is open. It used to hold the id of the
 * highlighted menu item (matching the menu's `aria-activedescendant`); it now holds the id of the menu itself. Both
 * layouts are handled.
 *
 * Returns null when no menu can be found.
 */
export const findZoomMenu = (zoomCombobox: Element): Element | null => {
  const ownsId = zoomCombobox.getAttribute("aria-owns");

  if (!ownsId) {
    return null;
  }

  const ownedElement = zoomCombobox.ownerDocument.getElementById(ownsId);
  const menu = ownedElement?.closest(MENU_SELECTOR);

  if (menu) {
    return menu;
  }

  return (
    Array.from(zoomCombobox.ownerDocument.querySelectorAll(MENU_SELECTOR)).find(
      (element) => element.getAttribute("aria-activedescendant") === ownsId
    ) ?? null
  );
};
