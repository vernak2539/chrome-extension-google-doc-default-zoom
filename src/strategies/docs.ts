import type { ZoomOutcome } from "src/types";
import { findZoomRowIndex } from "src/utils/find-zoom-row-index";
import localize from "src/utils/localize";
import { clickDOMElement, getDOMElement, getDOMElementAndClick } from "src/utils/ui-helpers";
import { waitFor } from "src/utils/wait-for";
import { APPLIED, failed } from "src/utils/zoom-outcome";

import { AbstractBaseStrategy } from "./base";

const ZOOM_MENU_WAIT_MS = 1000;
const ZOOM_ITEM_SELECTOR = "span[aria-label^='Zoom']";
// fallback selector (trying to account for potential translation differences)
const ZOOM_ITEM_FALLBACK_SELECTOR =
  ".docs-icon-img-container.docs-icon-img.docs-icon-editors-ia-zoom-in";

class DocsStrategy extends AbstractBaseStrategy {
  /**
   * This function tells us if the doc is in preview mode. There is no menu in preview mode, so we can't zoom
   *
   * example preview URL: "/document/d/XXXX/preview"
   */
  public isUIPreview(href: string): boolean {
    return /\/preview$/.test(new URL(href).pathname);
  }

  protected override async uiExecuteViewMenuFlow(zoomValue: string): Promise<ZoomOutcome> {
    if (!getDOMElementAndClick(this.config.uiElements.menubarViewTabId)) {
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
  }
}

export default DocsStrategy;
