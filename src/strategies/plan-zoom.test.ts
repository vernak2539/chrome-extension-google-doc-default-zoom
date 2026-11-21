import { workspaceAppUiStrategyConfigs } from "src/constants";
import type { AppStorageState, UiStrategyConfig } from "src/types";
import { describe, expect, test, vi } from "vitest";

import { planZoom, type ZoomPage } from "./plan-zoom";

vi.mock("src/utils/localize", () => ({ default: (key: string) => key }));

const withFeatures = (
  config: UiStrategyConfig,
  features: Partial<UiStrategyConfig["features"]>
): UiStrategyConfig => ({ ...config, features: { ...config.features, ...features } });

// Edition-independent: the custom zoom input is the only feature that differs between editions
const DOCS = withFeatures(workspaceAppUiStrategyConfigs.Docs, {
  customZoomInput: true,
  enableViewOnlyToggle: true,
  classroomSupport: true
});
const SHEETS = withFeatures(workspaceAppUiStrategyConfigs.Sheets, {
  customZoomInput: true,
  enableViewOnlyToggle: false,
  classroomSupport: true
});

const state = (overrides: Partial<AppStorageState> = {}): AppStorageState => ({
  zoomValue: "150%",
  viewOnly: false,
  classroomSupport: false,
  ...overrides
});

const page = (overrides: Partial<ZoomPage> = {}): ZoomPage => ({
  isClassroomSubmission: false,
  hasZoomSelect: true,
  ...overrides
});

describe("planZoom", () => {
  describe("toolbar zoom", () => {
    test.each([
      ["Docs", DOCS, "150%"],
      ["Sheets", SHEETS, "125%"]
    ])("should select the preset in %s", (_app, config, zoomValue) => {
      expect(planZoom(config, state({ zoomValue }), page())).toEqual({
        action: "select_preset",
        zoomValue
      });
    });

    test.each(["", "100%"])('should skip with default_zoom when the zoom is "%s"', (zoomValue) => {
      expect(planZoom(DOCS, state({ zoomValue }), page())).toEqual({
        action: "skip",
        reason: "default_zoom"
      });
    });

    test("should type a value that is not a preset and keep the closest preset as fallback", () => {
      expect(planZoom(DOCS, state({ zoomValue: "140%" }), page())).toEqual({
        action: "type_custom",
        zoomValue: "140%",
        fallbackZoomValue: "150%"
      });
    });

    test("should select the preset when custom zoom input is off for the edition", () => {
      const config = withFeatures(DOCS, { customZoomInput: false });

      expect(planZoom(config, state({ zoomValue: "140%" }), page())).toEqual({
        action: "select_preset",
        zoomValue: "140%"
      });
    });
  });

  describe("classroom submission", () => {
    const submission = page({ isClassroomSubmission: true });

    test("should skip when the stored classroom support is off", () => {
      expect(planZoom(DOCS, state({ classroomSupport: false }), submission)).toEqual({
        action: "skip",
        reason: "classroom_support_disabled"
      });
    });

    test("should skip when the app has no classroom support, whatever is stored", () => {
      const config = withFeatures(DOCS, { classroomSupport: false });

      expect(planZoom(config, state({ classroomSupport: true }), submission)).toEqual({
        action: "skip",
        reason: "classroom_support_disabled"
      });
    });

    test("should zoom when classroom support is on", () => {
      expect(planZoom(DOCS, state({ classroomSupport: true }), submission)).toEqual({
        action: "select_preset",
        zoomValue: "150%"
      });
    });

    test("should win over view-only", () => {
      expect(
        planZoom(DOCS, state({ viewOnly: true }), page({ ...submission, hasZoomSelect: false }))
      ).toEqual({ action: "skip", reason: "classroom_support_disabled" });
    });
  });

  describe("view-only", () => {
    const noZoomSelect = page({ hasZoomSelect: false });

    test("should pick the preset from the View menu in Docs", () => {
      expect(planZoom(DOCS, state({ viewOnly: true }), noZoomSelect)).toEqual({
        action: "view_menu_preset",
        zoomValue: "150%"
      });
    });

    test("should pick the closest preset for a value the View menu lacks", () => {
      expect(planZoom(DOCS, state({ viewOnly: true, zoomValue: "130%" }), noZoomSelect)).toEqual({
        action: "view_menu_preset",
        zoomValue: "125%"
      });
    });

    test("should not skip the default zoom, as the View menu flow never has", () => {
      expect(planZoom(DOCS, state({ viewOnly: true, zoomValue: "100%" }), noZoomSelect)).toEqual({
        action: "view_menu_preset",
        zoomValue: "100%"
      });
    });

    test("should skip with view_only in an app that supports the toggle but has no View menu flow", () => {
      const config = withFeatures(SHEETS, { enableViewOnlyToggle: true });

      expect(planZoom(config, state({ viewOnly: true }), noZoomSelect)).toEqual({
        action: "skip",
        reason: "view_only"
      });
    });

    test("should use the toolbar when the zoom select is on the page", () => {
      expect(planZoom(DOCS, state({ viewOnly: true }), page())).toEqual({
        action: "select_preset",
        zoomValue: "150%"
      });
    });

    test("should use the toolbar when the saved view-only setting is off", () => {
      expect(planZoom(DOCS, state({ viewOnly: false }), noZoomSelect)).toEqual({
        action: "select_preset",
        zoomValue: "150%"
      });
    });

    test("should use the toolbar when the app has no view-only toggle", () => {
      expect(planZoom(SHEETS, state({ viewOnly: true }), noZoomSelect)).toEqual({
        action: "select_preset",
        zoomValue: "150%"
      });
    });
  });
});
