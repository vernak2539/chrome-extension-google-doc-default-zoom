import { sendToBackgroundViaRelay } from "@plasmohq/messaging";
import { getClosestZoomValue } from "src/utils/get-closest-zoom-value";
import { getFeatureClassroomSupportFromStorage } from "src/utils/get-feature-classroom-support-from-storage";
import {
  RELAY_EXECUTE_ENTER,
  getFeatureClassroomSupportStorageKey
} from "../constants";
import type {
  ExecuteEnterRequestBody,
  ExecuteEnterResponseBody,
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
  execute: () => void;
  getIsPageLoading: () => boolean;
  getIsPageLoadingElementToWatch: () => string;
  isUIPreview: (href: string) => boolean;
}

export abstract class AbstractBaseStrategy implements AbstractBaseStrategyImpl {
  protected readonly config: UiStrategyConfig;
  public abstract execute(): void;
  public abstract isUIPreview(href: string): boolean;

  protected constructor(config: UiStrategyConfig) {
    this.config = config;
  }

  protected getZoomValueFromStorage() {
    return getZoomValueFromStorage(this.config.storageKey);
  }

  /**
   * This method will return true if the page has been loaded inside of Google Classroom (not if the TLD is google classrooms)
   *
   * Checks if:
   *   1. The feature is enabled for the current app
   *   2. The user has enabled the feature in the extension settings
   */
  protected async isGoogleClassroomEnabled() {
    if (!this.config.features.classroomSupport) {
      return false;
    }

    const classroomSupportStorageKey = getFeatureClassroomSupportStorageKey(
      this.config.storageKey
    );

    const enabled = await getFeatureClassroomSupportFromStorage(
      classroomSupportStorageKey
    );

    return enabled;
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

    /*--EXTENDED_ONLY_START--*/
    const canUseCustomZoom =
      this.isFeatureEnabled("customZoomInput") &&
      getIsCustomZoom(this.config.application, zoomValue);

    if (canUseCustomZoom) {
      this.uiExecuteCustomZoomFlow(zoomInputContainer, zoomValue);
    } else {
      /*--EXTENDED_ONLY_END--*/

      this.uiExecuteDefinedZoomFlow(zoomInputContainer, zoomValue);
      /*--EXTENDED_ONLY_START--*/
    }
    /*--EXTENDED_ONLY_END--*/
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

  /*--EXTENDED_ONLY_START--*/
  private uiExecuteCustomZoomFlow(
    zoomInputContainer: Element,
    zoomValue: string
  ) {
    const zoomInput = zoomInputContainer.querySelector("input");
    zoomInput.focus();
    zoomInput.select();

    sendToBackgroundViaRelay<ExecuteEnterRequestBody, ExecuteEnterResponseBody>(
      {
        name: RELAY_EXECUTE_ENTER,
        body: {
          zoomValue
        }
      }
    ).then(({ err }) => {
      if (!err) {
        this.closeDropdown();
        return;
      }

      if (err === "no_debugger") {
        const closestZoomValue = getClosestZoomValue(
          this.config.zoom.zoomValues,
          zoomValue
        );

        this.uiExecuteDefinedZoomFlow(zoomInputContainer, closestZoomValue);
      }
    });
  }
  /*--EXTENDED_ONLY_END--*/

  private closeDropdown() {
    // close dropdown with blur event (may need to check again to see if it's closed)
    setTimeout(() => {
      getDOMElementAndClick("canvas");
    }, 500);
  }

  private isFeatureEnabled(feature: Feature): boolean {
    return Boolean(this.config.features[feature]);
  }

  private getZoomSelectElement(): Element {
    const zoomSelect = getDOMElement(
      this.config.uiElements.clickableZoomSelectId
    );

    return zoomSelect;
  }

  public getIsPageLoadingElementToWatch(): string {
    const zoomSelector = this.getZoomSelectElement();

    if (zoomSelector) {
      return this.config.uiElements.toolbarId;
    }

    return this.config.uiElements.menubarViewTabId;
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
    const zoomSelect = this.getZoomSelectElement();

    if (zoomSelect) {
      return zoomSelect.classList.contains(
        "goog-toolbar-combo-button-disabled"
      );
    }

    const menuBarViewTab = getDOMElement(
      this.config.uiElements.menubarViewTabId
    );

    return menuBarViewTab.classList.contains("goog-control-disabled");
  }
}
