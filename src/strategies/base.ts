import { sendToBackgroundViaRelay } from "@plasmohq/messaging";
import getAppStorageStateFromStorage from "src/utils/get-app-storage-state-from-storage";

import { RELAY_EXECUTE_ENTER } from "../constants";
import type {
  ExecuteEnterRequestBody,
  ExecuteEnterResponseBody,
  UiStrategyConfig,
  ZoomOutcome
} from "../types";
import { isGoogleClassroomSubmittedAssignment } from "../utils/classroom-helpers";
import { findZoomMenu } from "../utils/find-zoom-menu";
import { clickDOMElement, getDOMElement, getDOMElementAndClick } from "../utils/ui-helpers";
import { APPLIED, failed, skipped } from "../utils/zoom-outcome";
import { planToolbarZoom, planZoom, type ZoomPlan } from "./plan-zoom";

export abstract class AbstractBaseStrategy {
  protected readonly config: UiStrategyConfig;
  public abstract isUIPreview(href: string): boolean;

  constructor(config: UiStrategyConfig) {
    this.config = config;
  }

  // Resolves with an outcome on every path and never rejects, so the caller can report it in one place
  public async execute(): Promise<ZoomOutcome> {
    try {
      const isClassroomSubmission = isGoogleClassroomSubmittedAssignment();

      const appState = await getAppStorageStateFromStorage(this.config.storageKey);

      const plan = planZoom(this.config, appState, {
        isClassroomSubmission,
        hasZoomSelect: !this.isUIViewOnly()
      });

      return await this.runPlan(plan);
    } catch (error) {
      return failed("exception", error);
    }
  }

  protected uiExecuteFlow(zoomValue: string): Promise<ZoomOutcome> {
    return this.runPlan(planToolbarZoom(this.config, zoomValue));
  }

  protected async runPlan(plan: ZoomPlan): Promise<ZoomOutcome> {
    switch (plan.action) {
      case "skip":
        return skipped(plan.reason);
      case "view_menu_preset":
        return this.uiExecuteViewMenuFlow(plan.zoomValue);
      case "select_preset":
      case "type_custom": {
        // get menu element responsible for changing zoom
        const zoomInputContainer = getDOMElementAndClick(
          this.config.uiElements.clickableZoomSelectId
        );

        if (!zoomInputContainer) {
          return failed("zoom_select_missing");
        }

        return plan.action === "type_custom"
          ? this.uiExecuteCustomZoomFlow(zoomInputContainer, plan.zoomValue, plan.fallbackZoomValue)
          : this.uiExecuteDefinedZoomFlow(zoomInputContainer, plan.zoomValue);
      }
    }
  }

  // Only Docs plans a view menu zoom, and it overrides this method
  protected async uiExecuteViewMenuFlow(_zoomValue: string): Promise<ZoomOutcome> {
    return failed("view_menu_missing");
  }

  private uiExecuteDefinedZoomFlow(zoomInputContainer: Element, zoomValue: string): ZoomOutcome {
    // get zoom menu element dropdown (linked from the combobox's `aria-owns`)
    const zoomInputSelect = findZoomMenu(zoomInputContainer);

    if (!zoomInputSelect) {
      this.closeDropdown();
      return failed("zoom_menu_missing");
    }

    // figure out zoom value to select
    const zoomInputSelectOptions = zoomInputSelect.querySelectorAll(
      this.config.uiElements.clickableZoomOptionClass
    );
    let newZoomLevelElement: Element | null = null;
    for (let i = 0; i < zoomInputSelectOptions.length; i++) {
      if (zoomInputSelectOptions[i].firstChild?.textContent === zoomValue) {
        newZoomLevelElement = zoomInputSelectOptions[i].firstChild as Element;
      }
    }

    // somehow we may not have matched the right element
    if (!newZoomLevelElement) {
      this.closeDropdown();
      return failed("zoom_option_missing");
    }

    // select new zoom level
    clickDOMElement(newZoomLevelElement);

    this.closeDropdown();
    return APPLIED;
  }

  private async uiExecuteCustomZoomFlow(
    zoomInputContainer: Element,
    zoomValue: string,
    fallbackZoomValue: string
  ): Promise<ZoomOutcome> {
    const fallback = () => this.uiExecuteDefinedZoomFlow(zoomInputContainer, fallbackZoomValue);

    const zoomInput = zoomInputContainer.querySelector("input");

    if (!zoomInput) {
      // nothing to type in: use the nearest preset, and report the missing input if that fails too
      const outcome = fallback();
      return outcome.status === "applied" ? outcome : failed("zoom_input_missing");
    }

    zoomInput.focus();
    zoomInput.select();

    let response: ExecuteEnterResponseBody | null = null;
    try {
      response = await sendToBackgroundViaRelay<ExecuteEnterRequestBody, ExecuteEnterResponseBody>({
        name: RELAY_EXECUTE_ENTER,
        body: {
          zoomValue
        }
      });
    } catch {
      // the relay failed, so nothing was typed: use the nearest preset instead
    }

    if (!response || response.err) {
      return fallback();
    }

    this.closeDropdown();
    return APPLIED;
  }

  private closeDropdown() {
    // close dropdown with blur event (may need to check again to see if it's closed)
    setTimeout(() => {
      getDOMElementAndClick("canvas");
    }, 500);
  }

  protected isUIViewOnly() {
    const zoomInputContainer = document.querySelector(this.config.uiElements.clickableZoomSelectId);

    return !zoomInputContainer;
  }

  public getIsPageLoadingElementToWatch(): string {
    const zoomElement = getDOMElement(this.config.uiElements.clickableZoomSelectId);

    return zoomElement ? this.config.uiElements.toolbarId : this.config.uiElements.menubarViewTabId;
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
    const zoomSelect = getDOMElement(this.config.uiElements.clickableZoomSelectId);

    if (zoomSelect) {
      return zoomSelect.classList.contains("goog-toolbar-combo-button-disabled");
    }

    const menuBarViewTab = getDOMElement(this.config.uiElements.menubarViewTabId);

    // without the view tab the menu bar is not usable yet
    return menuBarViewTab ? menuBarViewTab.classList.contains("goog-control-disabled") : true;
  }
}
