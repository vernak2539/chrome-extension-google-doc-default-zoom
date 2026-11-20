import type { ZoomOutcome } from "src/types";
import { findZoomRowIndex } from "src/utils/find-zoom-row-index";
import localize from "src/utils/localize";
import { pause } from "src/utils/pause";
import { clickDOMElement, getDOMElement, getDOMElementAndClick } from "src/utils/ui-helpers";
import { APPLIED, failed } from "src/utils/zoom-outcome";

import { AbstractBaseStrategy } from "./base";

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

    // this may need to change depending on how quickly the menu loads
    await pause(1000);

    const zoomRowElement = getDOMElement("span[aria-label^='Zoom']");

    if (zoomRowElement) {
      clickDOMElement(zoomRowElement);
    } else {
      // fallback selector (trying to account for potential translation differences)
      const fallbackSelector =
        ".docs-icon-img-container.docs-icon-img.docs-icon-editors-ia-zoom-in";

      if (!getDOMElementAndClick(fallbackSelector)) {
        return failed("view_zoom_item_missing");
      }
    }

    // This is hacky, not sure a better way to do this...
    const fitValue = localize("popupDocsDropdownFitSelection");
    const zoomValueContainer = getDOMElement(`[aria-label^="${fitValue}"]`)?.closest(".goog-menu");

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
