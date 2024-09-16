import { sendToBackgroundViaRelay } from "@plasmohq/messaging";

import { RELAY_EXECUTE_ENTER } from "../constants";
import type {
  ExecuteEnterRequestBody,
  ExecutionLocation,
  Feature,
  UiStrategyConfig
} from "../types";
import getIsCustomZoom from "../utils/get-is-custom-zoom";
import getZoomValueFromStorage from "../utils/get-zoom-value-from-storage";
import {
  clickDOMElement,
  getDOMElement,
  getDOMElementAndClick
} from "../utils/ui-helpers";

export interface AbstractBaseStrategyImpl {
  execute: (executionLocation: ExecutionLocation) => void;
  getIsPageLoading: () => {
    isLoading: boolean;
    getElementToWatch: () => Element;
  };
}

export abstract class AbstractBaseStrategy implements AbstractBaseStrategyImpl {
  protected readonly config: UiStrategyConfig;
  public abstract execute(executionLocation: string): void;
  // protected abstract getIsViewOnly(): boolean

  protected constructor(config: UiStrategyConfig) {
    this.config = config;
  }

  protected getZoomValueFromStorage() {
    return getZoomValueFromStorage(this.config.storageKey);
  }

  protected uiExecuteFlow(zoomValue: string) {
    // don't do anything if zoom level is set to default value or not set
    if (!zoomValue || zoomValue === this.config.zoom.defaultZoom) {
      return;
    }

    // get menu element responsible for changing zoom
    const zoomInputContainer = getDOMElementAndClick(
      this.config.uiElements.clickableZoomSelectId
    );

    // add check for if strategy is supported or not for app
    if (
      this.isFeatureEnabled("customZoomInput") &&
      getIsCustomZoom(zoomValue)
    ) {
      this.uiExecuteCustomZoomFlow(zoomInputContainer, zoomValue);
    } else {
      this.uiExecuteDefinedZoomFlow(zoomInputContainer, zoomValue);
    }
  }

  private uiExecuteDefinedZoomFlow(
    zoomInputContainer: Element,
    zoomValue: string
  ) {
    // get zoom menu element dropdown
    const zoomInputContainerAriaOwns =
      zoomInputContainer.attributes["aria-owns"].value; // this is the link
    const zoomInputSelect = getDOMElement(
      `.goog-menu.goog-menu-vertical[aria-activedescendant="${zoomInputContainerAriaOwns}"]`
    );

    // figure out zoom value to select
    const zoomInputSelectOptions = zoomInputSelect.querySelectorAll(
      this.config.uiElements.clickableZoomOptionClass
    );
    let newZoomLevelElement = null;
    for (let i = 0; i < zoomInputSelectOptions.length; i++) {
      if (zoomInputSelectOptions[i].firstChild.textContent === zoomValue) {
        newZoomLevelElement = zoomInputSelectOptions[i].firstChild;
      }
    }

    // somehow we may not have matched the right element
    if (!newZoomLevelElement) {
      return;
    }

    // select new zoom level
    clickDOMElement(newZoomLevelElement);

    this.closeDropdown();
  }

  private uiExecuteCustomZoomFlow(
    zoomInputContainer: Element,
    zoomValue: string
  ) {
    const zoomInput = zoomInputContainer.querySelector("input");
    zoomInput.focus();
    zoomInput.select();

    sendToBackgroundViaRelay<ExecuteEnterRequestBody>({
      name: RELAY_EXECUTE_ENTER,
      body: {
        zoomValue
      }
    }).then(() => {
      this.closeDropdown();
    });
  }

  private closeDropdown() {
    // close dropdown with blur event (may need to check again to see if it's closed)
    setTimeout(() => {
      getDOMElementAndClick("canvas");
    }, 500);
  }

  private isFeatureEnabled(feature: Feature): boolean {
    return Boolean(this.config.features[feature]);
  }

  /*
   * This method is used to determine if the page is loading or not (i.e. things are disabled and interaction needs
   * to pause for a moment).
   *
   * In both situations, we want to check if element on the page, which we'll use to do the zooming, is disabled.
   *
   * If we have a zoom selector, we want to use that to determine if the page is loading.
   * If there is no zoom selector, we have to use the menu bar to indicate if the page is loading or not
   */
  public getIsPageLoading() {
    const zoomSelect = getDOMElement(
      this.config.uiElements.clickableZoomSelectId
    );

    if (zoomSelect) {
      return {
        isLoading: zoomSelect.classList.contains(
          "goog-toolbar-combo-button-disabled"
        ),
        getElementToWatch: () => getDOMElement(this.config.uiElements.toolbarId)
      };
    }

    const menuBarViewTab = getDOMElement(
      this.config.uiElements.menubarViewTabId
    );

    return {
      isLoading: menuBarViewTab.classList.contains("goog-control-disabled"),
      getElementToWatch: () =>
        getDOMElement(this.config.uiElements.menubarViewTabId)
    };
  }
}
