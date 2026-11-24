import { DOCS_FIT_LABELS, isFitZoomValue } from "src/constants";
import type { UiStrategyConfig, ZoomOutcome } from "src/types";
import { findFitRowIndex, readZoomRowFacts } from "src/utils/find-fit-row";
import { findZoomRowIndex } from "src/utils/find-zoom-row-index";
import { clickDOMElement, getDOMElement, getDOMElementAndClick } from "src/utils/ui-helpers";
import { waitFor } from "src/utils/wait-for";
import { APPLIED, failed } from "src/utils/zoom-outcome";

import { createZoomDriver } from "./base";

const ZOOM_MENU_WAIT_MS = 1000;
const ZOOM_ITEM_SELECTOR = "span[aria-label^='Zoom']";
// fallback selector (trying to account for potential translation differences)
const ZOOM_ITEM_FALLBACK_SELECTOR =
  ".docs-icon-img-container.docs-icon-img.docs-icon-editors-ia-zoom-in";
const ZOOM_ROW_SELECTOR = ".goog-menuitem.apps-menuitem";

const getRowTexts = (menu: Element) =>
  Array.from(menu.querySelectorAll(ZOOM_ROW_SELECTOR), (row) => row.firstChild?.textContent);

// Computed style and not layout: it is what jsdom can answer, and Docs hides a closed menu with it
const isShown = (element: Element): boolean => {
  const { display, visibility } = getComputedStyle(element);

  return display !== "none" && visibility !== "hidden";
};

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

  // The zoom submenu is the shown menu that lists the default zoom. Menus are found by that, and not by the Fit
  // label, which is in the language Docs is shown in. Other menus stay in the page, hidden.
  const zoomValueContainer = await waitFor(".goog-menu", ZOOM_MENU_WAIT_MS, (menu) => {
    return isShown(menu) && findZoomRowIndex(getRowTexts(menu), config.zoom.defaultZoom) !== -1;
  });

  if (!zoomValueContainer) {
    getDOMElementAndClick("body");
    return failed("view_zoom_menu_missing");
  }

  const zoomValueRows = Array.from(zoomValueContainer.querySelectorAll(ZOOM_ROW_SELECTOR));

  const rowIndex = isFitZoomValue(zoomValue)
    ? findFitRowIndex(zoomValueRows.map(readZoomRowFacts), DOCS_FIT_LABELS)
    : findZoomRowIndex(getRowTexts(zoomValueContainer), zoomValue);

  if (rowIndex === -1) {
    getDOMElementAndClick("body");
    return failed("view_zoom_option_missing");
  }

  clickDOMElement(zoomValueRows[rowIndex].firstChild as Element);
  return APPLIED;
};

export const createDocsDriver = (config: UiStrategyConfig) =>
  createZoomDriver(config, { isUIPreview, viewMenuFlow });
