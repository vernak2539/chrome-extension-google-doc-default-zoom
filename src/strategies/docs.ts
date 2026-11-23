import type { UiStrategyConfig, ZoomOutcome } from "src/types";
import { findZoomRowIndex } from "src/utils/find-zoom-row-index";
import localize from "src/utils/localize";
import { clickDOMElement, getDOMElement, getDOMElementAndClick } from "src/utils/ui-helpers";
import { waitFor } from "src/utils/wait-for";
import { APPLIED, failed } from "src/utils/zoom-outcome";

import { createZoomDriver } from "./base";

const ZOOM_MENU_WAIT_MS = 1000;
const ZOOM_ITEM_SELECTOR = "span[aria-label^='Zoom']";
// fallback selector (trying to account for potential translation differences)
const ZOOM_ITEM_FALLBACK_SELECTOR =
  ".docs-icon-img-container.docs-icon-img.docs-icon-editors-ia-zoom-in";

/**
 * This function tells us if the doc is in preview mode. There is no menu in preview mode, so we can't zoom
 *
 * example preview URL: "/document/d/XXXX/preview"
 */
const isUIPreview = (href: string): boolean => /\/preview$/.test(new URL(href).pathname);

const viewMenuFlow = async (config: UiStrategyConfig, zoomValue: string): Promise<ZoomOutcome> => {
  if (!getDOMElementAndClick(config.uiElements.menubarViewTabId)) {
    return failed("view_menu_missing");
  }

  const zoomItem = await waitFor(
    `${ZOOM_ITEM_SELECTOR}, ${ZOOM_ITEM_FALLBACK_SELECTOR}`,
    ZOOM_MENU_WAIT_MS
  );

  if (!zoomItem) {
    return failed("view_zoom_item_missing");
  }

  // a combined selector returns the first match in document order, so look for the span first
  clickDOMElement(getDOMElement(ZOOM_ITEM_SELECTOR) ?? zoomItem);

  // This is hacky, not sure a better way to do this...
  const fitValue = localize("popupDocsDropdownFitSelection");
  const fitRow = await waitFor(`[aria-label^="${fitValue}"]`, ZOOM_MENU_WAIT_MS);
  const zoomValueContainer = fitRow?.closest(".goog-menu");

  if (!zoomValueContainer) {
    getDOMElementAndClick("body");
    return failed("view_zoom_menu_missing");
  }

  const zoomValueRows = zoomValueContainer.querySelectorAll(".goog-menuitem.apps-menuitem");

  const rowIndex = findZoomRowIndex(
    Array.from(zoomValueRows, (row) => row.firstChild?.textContent),
    zoomValue
  );

  if (rowIndex === -1) {
    getDOMElementAndClick("body");
    return failed("view_zoom_option_missing");
  }

  clickDOMElement(zoomValueRows[rowIndex].firstChild as Element);
  return APPLIED;
};

export const createDocsDriver = (config: UiStrategyConfig) =>
  createZoomDriver(config, { isUIPreview, viewMenuFlow });
