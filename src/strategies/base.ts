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
import { planZoom, type ZoomPlan } from "./plan-zoom";

export interface ZoomDriver {
  isUIPreview(href: string): boolean;
  getIsPageLoadingElementToWatch(): string;
  getIsPageLoading(): boolean;
  // Resolves with an outcome on every path and never rejects, so the caller can report it in one place
  execute(): Promise<ZoomOutcome>;
}

export interface ZoomDriverOptions {
  isUIPreview(href: string): boolean;
  // Only an app whose plan can be `view_menu_preset` supplies this (today: Docs)
  viewMenuFlow?: (config: UiStrategyConfig, zoomValue: string) => Promise<ZoomOutcome>;
}

export const createZoomDriver = (
  config: UiStrategyConfig,
  options: ZoomDriverOptions
): ZoomDriver => ({
  isUIPreview: options.isUIPreview,
  getIsPageLoadingElementToWatch: () => getIsPageLoadingElementToWatch(config),
  getIsPageLoading: () => getIsPageLoading(config),
  execute: async () => {
    try {
      const isClassroomSubmission = isGoogleClassroomSubmittedAssignment();

      const appState = await getAppStorageStateFromStorage(config.storageKey);

      const plan = planZoom(config, appState, {
        isClassroomSubmission,
        hasZoomSelect: !isUIViewOnly(config)
      });

      return await runPlan(config, options, plan);
    } catch (error) {
      return failed("exception", error);
    }
  }
});

const runPlan = async (
  config: UiStrategyConfig,
  options: ZoomDriverOptions,
  plan: ZoomPlan
): Promise<ZoomOutcome> => {
  switch (plan.action) {
    case "skip":
      return skipped(plan.reason);
    case "view_menu_preset":
      return options.viewMenuFlow
        ? options.viewMenuFlow(config, plan.zoomValue)
        : failed("view_menu_missing");
    case "select_preset":
    case "type_custom": {
      // get menu element responsible for changing zoom
      const zoomInputContainer = getDOMElementAndClick(config.uiElements.clickableZoomSelectId);

      if (!zoomInputContainer) {
        return failed("zoom_select_missing");
      }

      return plan.action === "type_custom"
        ? uiExecuteCustomZoomFlow(
            config,
            zoomInputContainer,
            plan.zoomValue,
            plan.fallbackZoomValue
          )
        : uiExecuteDefinedZoomFlow(config, zoomInputContainer, plan.zoomValue);
    }
  }
};

const uiExecuteDefinedZoomFlow = (
  config: UiStrategyConfig,
  zoomInputContainer: Element,
  zoomValue: string
): ZoomOutcome => {
  // get zoom menu element dropdown (linked from the combobox's `aria-owns`)
  const zoomInputSelect = findZoomMenu(zoomInputContainer);

  if (!zoomInputSelect) {
    closeDropdown(zoomInputContainer);
    return failed("zoom_menu_missing");
  }

  // figure out zoom value to select
  const zoomInputSelectOptions = zoomInputSelect.querySelectorAll(
    config.uiElements.clickableZoomOptionClass
  );
  let newZoomLevelElement: Element | null = null;
  for (let i = 0; i < zoomInputSelectOptions.length; i++) {
    if (zoomInputSelectOptions[i].firstChild?.textContent === zoomValue) {
      newZoomLevelElement = zoomInputSelectOptions[i].firstChild as Element;
    }
  }

  // somehow we may not have matched the right element
  if (!newZoomLevelElement) {
    closeDropdown(zoomInputContainer);
    return failed("zoom_option_missing");
  }

  // select new zoom level
  clickDOMElement(newZoomLevelElement);

  closeDropdown(zoomInputContainer);
  return APPLIED;
};

const uiExecuteCustomZoomFlow = (
  config: UiStrategyConfig,
  zoomInputContainer: Element,
  zoomValue: string,
  fallbackZoomValue: string
): ZoomOutcome => {
  const fallback = () => uiExecuteDefinedZoomFlow(config, zoomInputContainer, fallbackZoomValue);

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

  closeDropdown(zoomInputContainer);

  // Docs and Sheets drop a value they did not apply when the box loses focus, so a value that survived the blur is
  // the zoom the app now shows (#110). If it changed, Google ignored the keys: report that instead of claiming the
  // zoom was applied, so a silent regression reaches Sentry and not only the live e2e.
  return zoomInput.value === zoomValue ? APPLIED : failed("custom_zoom_not_applied");
};

// Only the custom flow focuses the zoom input, and we open the menu with synthetic events that don't move focus. So
// the blur closes the menu after typing, and a click on `body` is the outside click that closes it on every other
// path. Neither touches the editor: document.activeElement can be the editor, and a click on a canvas can move the
// caret or the selected cell.
// Google's menu ignores an outside press made in the same task that opened it (the live e2e shows it staying open),
// so the press runs in the next task. This yields to the event loop once; it is not a fixed wait.
const closeDropdown = (zoomInputContainer: Element) => {
  zoomInputContainer.querySelector("input")?.blur();
  setTimeout(() => getDOMElementAndClick("body"), 0);
};

const isUIViewOnly = (config: UiStrategyConfig) => {
  const zoomInputContainer = document.querySelector(config.uiElements.clickableZoomSelectId);

  return !zoomInputContainer;
};

const getIsPageLoadingElementToWatch = (config: UiStrategyConfig): string => {
  const zoomElement = getDOMElement(config.uiElements.clickableZoomSelectId);

  return zoomElement ? config.uiElements.toolbarId : config.uiElements.menubarViewTabId;
};

/*
 * This is used to determine if the page is loading or not (i.e. things are disabled and interaction needs
 * to pause for a moment).
 *
 * In both situations, we want to check if element on the page, which we'll use to do the zooming, is disabled.
 *
 * If we have a zoom selector, we want to use that to determine if the page is loading.
 * If there is no zoom selector, we have to use the menu bar to indicate if the page is loading or not
 */
const getIsPageLoading = (config: UiStrategyConfig): boolean => {
  const zoomSelect = getDOMElement(config.uiElements.clickableZoomSelectId);

  if (zoomSelect) {
    return zoomSelect.classList.contains("goog-toolbar-combo-button-disabled");
  }

  const menuBarViewTab = getDOMElement(config.uiElements.menubarViewTabId);

  // without the view tab the menu bar is not usable yet
  return menuBarViewTab ? menuBarViewTab.classList.contains("goog-control-disabled") : true;
};
