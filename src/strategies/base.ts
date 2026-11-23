import getAppStorageStateFromStorage from "src/utils/get-app-storage-state-from-storage";

import type { UiStrategyConfig, ZoomOutcome } from "../types";
import { isGoogleClassroomSubmittedAssignment } from "../utils/classroom-helpers";
import { findZoomMenu } from "../utils/find-zoom-menu";
import {
  clickDOMElement,
  getDOMElement,
  getDOMElementAndClick,
  simulateEnter
} from "../utils/ui-helpers";
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
      this.closeDropdown(zoomInputContainer);
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
      this.closeDropdown(zoomInputContainer);
      return failed("zoom_option_missing");
    }

    // select new zoom level
    clickDOMElement(newZoomLevelElement);

    this.closeDropdown(zoomInputContainer);
    return APPLIED;
  }

  private uiExecuteCustomZoomFlow(
    zoomInputContainer: Element,
    zoomValue: string,
    fallbackZoomValue: string
  ): ZoomOutcome {
    const fallback = () => this.uiExecuteDefinedZoomFlow(zoomInputContainer, fallbackZoomValue);

    const zoomInput = zoomInputContainer.querySelector("input");

    if (!zoomInput) {
      // nothing to type in: use the nearest preset, and report the missing input if that fails too
      const outcome = fallback();
      return outcome.status === "applied" ? outcome : failed("zoom_input_missing");
    }

    zoomInput.focus();
    zoomInput.select();
    zoomInput.value = zoomValue;
    simulateEnter(zoomInput);

    this.closeDropdown(zoomInputContainer);

    // Docs and Sheets drop a value they did not apply when the box loses focus, so a value that survived the blur is
    // the zoom the app now shows (#110). If it changed, Google ignored the keys: report that instead of claiming the
    // zoom was applied, so a silent regression reaches Sentry and not only the live e2e.
    return zoomInput.value === zoomValue ? APPLIED : failed("custom_zoom_not_applied");
  }

  // Only the custom flow focuses the zoom input, and we open the menu with synthetic events that don't move focus. So
  // the blur closes the menu after typing, and a click on `body` is the outside click that closes it on every other
  // path. Neither touches the editor: document.activeElement can be the editor, and a click on a canvas can move the
  // caret or the selected cell.
  // Google's menu ignores an outside press made in the same task that opened it (the live e2e shows it staying open),
  // so the press runs in the next task. This yields to the event loop once; it is not a fixed wait.
  private closeDropdown(zoomInputContainer: Element) {
    zoomInputContainer.querySelector("input")?.blur();
    setTimeout(() => getDOMElementAndClick("body"), 0);
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
