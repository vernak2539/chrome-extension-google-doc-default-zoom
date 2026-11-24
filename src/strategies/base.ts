import getAppStorageStateFromStorage from "src/utils/get-app-storage-state-from-storage";

import type { UiStrategyConfig, ZoomOutcome } from "../types";
import { isGoogleClassroomSubmittedAssignment } from "../utils/classroom-helpers";
import { IS_EXTENDED_EDITION } from "../utils/edition";
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
      let plan = await readPlan(config);

      // Google ignores a typed zoom in a page without focus (#77): a background tab, or the selected tab of a window
      // that isn't focused. Chrome fires no focus events there. So typing waits for focus, then plans again, because
      // the saved zoom can change while the tab waits. Picking a preset row works without focus, so presets don't wait.
      while (IS_EXTENDED_EDITION && plan.action === "type_custom" && !document.hasFocus()) {
        await waitForPageFocus();
        plan = await readPlan(config);
      }

      return await runPlan(config, options, plan);
    } catch (error) {
      return failed("exception", error);
    }
  }
});

const readPlan = async (config: UiStrategyConfig): Promise<ZoomPlan> => {
  const isClassroomSubmission = isGoogleClassroomSubmittedAssignment();

  const appState = await getAppStorageStateFromStorage(config.storageKey);

  return planZoom(config, appState, {
    isClassroomSubmission,
    hasZoomSelect: !isUIViewOnly(config)
  });
};

// The window gets a focus event when its tab is selected or its browser window is focused
const waitForPageFocus = () =>
  new Promise<void>((resolve) => window.addEventListener("focus", () => resolve(), { once: true }));

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
      // where the document takes its keys, so closing the dropdown can put focus back there
      const focusBeforeZoom = getFocusedElement();

      // get menu element responsible for changing zoom
      const zoomInputContainer = getDOMElementAndClick(config.uiElements.clickableZoomSelectId);

      if (!zoomInputContainer) {
        return failed("zoom_select_missing");
      }

      return plan.action === "type_custom"
        ? uiExecuteCustomZoomFlow(
            config,
            zoomInputContainer,
            focusBeforeZoom,
            plan.zoomValue,
            plan.fallbackZoomValue
          )
        : uiExecuteDefinedZoomFlow(config, zoomInputContainer, focusBeforeZoom, plan.zoomValue);
    }
  }
};

const uiExecuteDefinedZoomFlow = (
  config: UiStrategyConfig,
  zoomInputContainer: Element,
  focusBeforeZoom: Element | null,
  zoomValue: string
): ZoomOutcome => {
  // get zoom menu element dropdown (linked from the combobox's `aria-owns`)
  const zoomInputSelect = findZoomMenu(zoomInputContainer);

  if (!zoomInputSelect) {
    closeDropdown(zoomInputContainer, focusBeforeZoom);
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
    closeDropdown(zoomInputContainer, focusBeforeZoom);
    return failed("zoom_option_missing");
  }

  // select new zoom level
  clickDOMElement(newZoomLevelElement);

  closeDropdown(zoomInputContainer, focusBeforeZoom);
  return APPLIED;
};

const uiExecuteCustomZoomFlow = (
  config: UiStrategyConfig,
  zoomInputContainer: Element,
  focusBeforeZoom: Element | null,
  zoomValue: string,
  fallbackZoomValue: string
): ZoomOutcome => {
  const fallback = () =>
    uiExecuteDefinedZoomFlow(config, zoomInputContainer, focusBeforeZoom, fallbackZoomValue);

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

  closeDropdown(zoomInputContainer, focusBeforeZoom);

  // Docs and Sheets drop a value they did not apply when the box loses focus, so a value that survived the blur is
  // the zoom the app now shows (#110). If it changed, Google ignored the keys: report that instead of claiming the
  // zoom was applied, so a silent regression reaches Sentry and not only the live e2e.
  return zoomInput.value === zoomValue ? APPLIED : failed("custom_zoom_not_applied");
};

// The blur closes the menu after typing, and a click on `body` is the outside click that closes it on every other
// path. Neither touches the editor: a click on a canvas can move the caret or the selected cell.
// Google's menu ignores an outside press made in the same task that opened it (the live e2e shows it staying open),
// so the press runs in the next task. This yields to the event loop once; it is not a fixed wait.
// Google also focuses the zoom box when the control is pressed, and focuses it again when it loses focus before the
// dropdown has closed. Left there, the user's typing goes into the zoom box, so focus goes back to where it was before
// the zoom: where the document takes its keys (Docs: a hidden iframe, Sheets: the cell editor). That runs one task after
// the press: in the same task Google takes focus back and reopens the menu (seen on the live pages).
const closeDropdown = (zoomInputContainer: Element, focusBeforeZoom: Element | null) => {
  zoomInputContainer.querySelector("input")?.blur();
  setTimeout(() => {
    getDOMElementAndClick("body");
    setTimeout(() => restoreFocus(zoomInputContainer, focusBeforeZoom), 0);
  }, 0);
};

// The focused element, looking into same-origin frames. Docs takes the document's keys in an element inside a hidden
// iframe, and clears that element's focus while the zoom box has it, so focusing the iframe alone leaves the keys on the
// iframe's body.
const getFocusedElement = (): Element | null => {
  let element = document.activeElement;

  while (element?.tagName === "IFRAME") {
    // null for a frame from another origin
    const frameDocument = (element as HTMLIFrameElement).contentDocument;
    const inner = frameDocument?.activeElement;

    if (!inner || inner === frameDocument.body) {
      break;
    }
    element = inner;
  }

  return element;
};

// A body means nothing had focus, and an element of the zoom control would keep the keys in the zoom box. The checks
// avoid `instanceof HTMLElement`: an element inside a frame comes from the frame's window.
const restoreFocus = (zoomInputContainer: Element, element: Element | null) => {
  const focusable = element as HTMLElement | null;

  if (
    focusable?.isConnected &&
    typeof focusable.focus === "function" &&
    focusable !== focusable.ownerDocument.body &&
    !zoomInputContainer.contains(focusable)
  ) {
    focusable.focus();
  }
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
