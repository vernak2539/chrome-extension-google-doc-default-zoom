import type { AppStorageState, UiStrategyConfig, ZoomSkipReason } from "../types";
import { getClosestZoomValue } from "../utils/get-closest-zoom-value";
import getIsCustomZoom from "../utils/get-is-custom-zoom";

export type ZoomPlan =
  | { action: "skip"; reason: ZoomSkipReason }
  | { action: "select_preset"; zoomValue: string }
  | { action: "type_custom"; zoomValue: string; fallbackZoomValue: string }
  | { action: "view_menu_preset"; zoomValue: string };

/** The facts about the page that the zoom decision depends on. */
export interface ZoomPage {
  isClassroomSubmission: boolean;
  hasZoomSelect: boolean;
}

export const planToolbarZoom = (config: UiStrategyConfig, zoomValue: string): ZoomPlan => {
  // don't do anything if zoom level is set to default value or not set
  if (!zoomValue || zoomValue === config.zoom.defaultZoom) {
    return { action: "skip", reason: "default_zoom" };
  }

  if (config.features.customZoomInput && getIsCustomZoom(config.application, zoomValue)) {
    return {
      action: "type_custom",
      zoomValue,
      fallbackZoomValue: getClosestZoomValue(config.zoom.zoomValues, zoomValue)
    };
  }

  return { action: "select_preset", zoomValue };
};

// view only Docs don't allow for custom zoom levels, but rather only allow the predefined ones
const planViewMenuZoom = (config: UiStrategyConfig, zoomValue: string): ZoomPlan => {
  const isPredefined = config.zoom.zoomValues.includes(zoomValue as never);

  return {
    action: "view_menu_preset",
    zoomValue: isPredefined ? zoomValue : getClosestZoomValue(config.zoom.zoomValues, zoomValue)
  };
};

export const planZoom = (
  config: UiStrategyConfig,
  state: AppStorageState,
  page: ZoomPage
): ZoomPlan => {
  const isClassroomSupportEnabled = config.features.classroomSupport && state.classroomSupport;

  if (page.isClassroomSubmission && !isClassroomSupportEnabled) {
    return { action: "skip", reason: "classroom_support_disabled" };
  }

  const isViewOnly = config.features.enableViewOnlyToggle && state.viewOnly && !page.hasZoomSelect;

  if (isViewOnly) {
    return config.application === "Docs"
      ? planViewMenuZoom(config, state.zoomValue)
      : { action: "skip", reason: "view_only" };
  }

  return planToolbarZoom(config, state.zoomValue);
};
