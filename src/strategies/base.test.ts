// @vitest-environment jsdom
import { workspaceAppUiStrategyConfigs } from "src/constants";
import type { AppStorageState } from "src/types";
import { IS_EXTENDED_EDITION } from "src/utils/edition";
import getAppStorageStateFromStorage from "src/utils/get-app-storage-state-from-storage";
import { sendMessage } from "src/utils/messaging";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { AbstractBaseStrategy } from "./base";

vi.mock("src/utils/messaging", () => ({ sendMessage: vi.fn() }));
vi.mock("src/utils/localize", () => ({ default: (key: string) => key }));
vi.mock("src/utils/get-app-storage-state-from-storage", () => ({ default: vi.fn() }));

class TestStrategy extends AbstractBaseStrategy {
  protected performZoom(appState: AppStorageState) {
    return this.uiExecuteFlow(appState.zoomValue);
  }
  public isUIPreview() {
    return false;
  }
  public zoomTo(zoomValue: string) {
    return this.uiExecuteFlow(zoomValue);
  }
}

const sendMessageMock = vi.mocked(sendMessage);
const getStoredState = vi.mocked(getAppStorageStateFromStorage);

// "130%" is not a Docs preset, so it takes the custom zoom flow; the nearest preset is "125%"
const CUSTOM_ZOOM = "130%";
const NEAREST_PRESET = "125%";

const renderZoomMenu = () => {
  document.body.innerHTML = `
    <div id="zoomSelect" aria-owns="zoom-menu"><input /></div>
    <div class="goog-menu goog-menu-vertical" id="zoom-menu">
      <div class="goog-menuitem"><div>100%</div></div>
      <div class="goog-menuitem"><div>${NEAREST_PRESET}</div></div>
      <div class="goog-menuitem"><div>150%</div></div>
    </div>`;

  const clicked: string[] = [];
  document.querySelectorAll(".goog-menuitem").forEach((row) => {
    row.firstElementChild?.addEventListener("click", () => clicked.push(row.textContent ?? ""));
  });
  return clicked;
};

const DOCS_CONFIG = workspaceAppUiStrategyConfigs.Docs;
const storedState = (zoomValue: string): AppStorageState => ({
  zoomValue,
  viewOnly: false,
  classroomSupport: false
});

describe("zoom outcome", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    sendMessageMock.mockReset();
    getStoredState.mockReset();
    document.body.innerHTML = "";
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    window.history.pushState({}, "", "/");
  });

  test("should be applied when the preset row is clicked", async () => {
    renderZoomMenu();

    expect(await new TestStrategy(DOCS_CONFIG).zoomTo("150%")).toEqual({ status: "applied" });
  });

  test.each(["", DOCS_CONFIG.zoom.defaultZoom])(
    'should skip with default_zoom when the zoom is "%s"',
    async (zoomValue) => {
      renderZoomMenu();

      expect(await new TestStrategy(DOCS_CONFIG).zoomTo(zoomValue)).toEqual({
        status: "skipped",
        reason: "default_zoom"
      });
    }
  );

  test("should fail with zoom_select_missing when the zoom select is not on the page", async () => {
    expect(await new TestStrategy(DOCS_CONFIG).zoomTo("150%")).toEqual({
      status: "failed",
      reason: "zoom_select_missing"
    });
  });

  test("should fail with zoom_menu_missing when the select does not own a menu", async () => {
    document.body.innerHTML = `<div id="zoomSelect"></div>`;

    expect(await new TestStrategy(DOCS_CONFIG).zoomTo("150%")).toEqual({
      status: "failed",
      reason: "zoom_menu_missing"
    });
  });

  test("should fail with zoom_option_missing when no row has the value", async () => {
    renderZoomMenu();

    expect(await new TestStrategy(DOCS_CONFIG).zoomTo("200%")).toEqual({
      status: "failed",
      reason: "zoom_option_missing"
    });
  });

  test.runIf(IS_EXTENDED_EDITION)(
    "should fail with zoom_input_missing when a custom zoom has no input to type in",
    async () => {
      document.body.innerHTML = `<div id="zoomSelect" aria-owns="zoom-menu"></div>`;

      expect(await new TestStrategy(DOCS_CONFIG).zoomTo(CUSTOM_ZOOM)).toEqual({
        status: "failed",
        reason: "zoom_input_missing"
      });
      expect(sendMessageMock).not.toHaveBeenCalled();
    }
  );

  test.runIf(!IS_EXTENDED_EDITION)(
    "should not use the debugger for a custom zoom, and fail with zoom_option_missing",
    async () => {
      renderZoomMenu();

      expect(await new TestStrategy(DOCS_CONFIG).zoomTo(CUSTOM_ZOOM)).toEqual({
        status: "failed",
        reason: "zoom_option_missing"
      });
      expect(sendMessageMock).not.toHaveBeenCalled();
    }
  );

  test("should skip with classroom_support_disabled for a submitted assignment", async () => {
    window.history.pushState({}, "", "/document/d/abc/grading");
    getStoredState.mockResolvedValue({ ...storedState("150%"), classroomSupport: false });

    expect(await new TestStrategy(DOCS_CONFIG).execute()).toEqual({
      status: "skipped",
      reason: "classroom_support_disabled"
    });
  });

  test("should fail with exception, keeping the error, when reading the stored state rejects", async () => {
    const error = new Error("Extension context invalidated");
    getStoredState.mockRejectedValue(error);

    expect(await new TestStrategy(DOCS_CONFIG).execute()).toEqual({
      status: "failed",
      reason: "exception",
      error
    });
  });

  test("should fail with exception instead of rejecting when the flow throws", async () => {
    const error = new Error("boom");
    getStoredState.mockResolvedValue(storedState("150%"));
    renderZoomMenu();
    vi.spyOn(document, "querySelector").mockImplementationOnce(() => {
      throw error;
    });

    expect(await new TestStrategy(DOCS_CONFIG).execute()).toEqual({
      status: "failed",
      reason: "exception",
      error
    });
  });
});

describe.runIf(IS_EXTENDED_EDITION)("custom zoom flow", () => {
  let clickedRows: string[];

  beforeEach(() => {
    vi.useFakeTimers();
    sendMessageMock.mockReset();
    clickedRows = renderZoomMenu();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const zoomAndSettle = async () => {
    const outcome = await new TestStrategy(workspaceAppUiStrategyConfigs.Docs).zoomTo(CUSTOM_ZOOM);
    await vi.advanceTimersByTimeAsync(1000);
    return outcome;
  };

  test("should not select a preset when the debugger typed the value", async () => {
    sendMessageMock.mockResolvedValue({ err: null });

    const outcome = await zoomAndSettle();

    expect(outcome).toEqual({ status: "applied" });
    expect(clickedRows).toEqual([]);
  });

  test.each(["no_debugger", "debugger_failed"] as const)(
    "should select the nearest preset when the handler replies %s",
    async (err) => {
      sendMessageMock.mockResolvedValue({ err });

      const outcome = await zoomAndSettle();

      expect(outcome).toEqual({ status: "applied" });
      expect(clickedRows).toEqual([NEAREST_PRESET]);
    }
  );

  test("should select the nearest preset when the message rejects", async () => {
    sendMessageMock.mockRejectedValue(new Error("Could not establish connection"));

    const outcome = await zoomAndSettle();

    expect(outcome).toEqual({ status: "applied" });
    expect(clickedRows).toEqual([NEAREST_PRESET]);
  });

  test("should select the nearest preset when the zoom combobox has no input", async () => {
    document.querySelector("#zoomSelect input")?.remove();

    await zoomAndSettle();

    expect(sendMessageMock).not.toHaveBeenCalled();
    expect(clickedRows).toEqual([NEAREST_PRESET]);
  });
});
