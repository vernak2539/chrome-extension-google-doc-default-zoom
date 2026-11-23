// @vitest-environment jsdom
import { workspaceAppUiStrategyConfigs } from "src/constants";
import type { AppStorageState } from "src/types";
import { IS_EXTENDED_EDITION } from "src/utils/edition";
import getAppStorageStateFromStorage from "src/utils/get-app-storage-state-from-storage";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { createZoomDriver } from "./base";

vi.mock("src/utils/localize", () => ({ default: (key: string) => key }));
vi.mock("src/utils/get-app-storage-state-from-storage", () => ({ default: vi.fn() }));

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

const createDriver = () => createZoomDriver(DOCS_CONFIG, { isUIPreview: () => false });
const zoomTo = (zoomValue: string) => {
  getStoredState.mockResolvedValue(storedState(zoomValue));
  return createDriver().execute();
};

describe("zoom outcome", () => {
  beforeEach(() => {
    vi.useFakeTimers();
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

    expect(await zoomTo("150%")).toEqual({ status: "applied" });
  });

  test.each(["", DOCS_CONFIG.zoom.defaultZoom])(
    'should skip with default_zoom when the zoom is "%s"',
    async (zoomValue) => {
      renderZoomMenu();

      expect(await zoomTo(zoomValue)).toEqual({
        status: "skipped",
        reason: "default_zoom"
      });
    }
  );

  test("should fail with zoom_select_missing when the zoom select is not on the page", async () => {
    expect(await zoomTo("150%")).toEqual({
      status: "failed",
      reason: "zoom_select_missing"
    });
  });

  test("should fail with zoom_menu_missing when the select does not own a menu", async () => {
    document.body.innerHTML = `<div id="zoomSelect"></div>`;

    expect(await zoomTo("150%")).toEqual({
      status: "failed",
      reason: "zoom_menu_missing"
    });
  });

  test("should fail with zoom_option_missing when no row has the value", async () => {
    renderZoomMenu();

    expect(await zoomTo("200%")).toEqual({
      status: "failed",
      reason: "zoom_option_missing"
    });
  });

  test.runIf(IS_EXTENDED_EDITION)(
    "should fail with zoom_input_missing when a custom zoom has no input to type in",
    async () => {
      document.body.innerHTML = `<div id="zoomSelect" aria-owns="zoom-menu"></div>`;

      expect(await zoomTo(CUSTOM_ZOOM)).toEqual({
        status: "failed",
        reason: "zoom_input_missing"
      });
    }
  );

  test.runIf(!IS_EXTENDED_EDITION)(
    "should not type a custom zoom, and fail with zoom_option_missing",
    async () => {
      renderZoomMenu();
      const keydowns: string[] = [];
      document
        .querySelector("#zoomSelect input")
        ?.addEventListener("keydown", () => keydowns.push("keydown"));

      expect(await zoomTo(CUSTOM_ZOOM)).toEqual({
        status: "failed",
        reason: "zoom_option_missing"
      });
      expect(keydowns).toEqual([]);
    }
  );

  test("should skip with classroom_support_disabled for a submitted assignment", async () => {
    window.history.pushState({}, "", "/document/d/abc/grading");
    getStoredState.mockResolvedValue({ ...storedState("150%"), classroomSupport: false });

    expect(await createDriver().execute()).toEqual({
      status: "skipped",
      reason: "classroom_support_disabled"
    });
  });

  test("should fail with exception, keeping the error, when reading the stored state rejects", async () => {
    const error = new Error("Extension context invalidated");
    getStoredState.mockRejectedValue(error);

    expect(await createDriver().execute()).toEqual({
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

    expect(await createDriver().execute()).toEqual({
      status: "failed",
      reason: "exception",
      error
    });
  });
});

describe("closing the zoom dropdown", () => {
  const recordMousedownTargets = () => {
    const targets: string[] = [];
    document.addEventListener("mousedown", (event) => {
      targets.push((event.target as Element).tagName.toLowerCase());
    });
    return targets;
  };

  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = "";
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // The menu is opened with synthetic events, which don't focus the input, so a blur alone would leave it open
  test("should press outside the editor when no row matches, so a menu opened without focus closes", async () => {
    renderZoomMenu();
    document.body.insertAdjacentHTML("beforeend", "<canvas></canvas>");
    const mousedownTargets = recordMousedownTargets();

    await zoomTo("200%");
    // A canvas press behind a timer, as the old flow did, would land here
    await vi.advanceTimersByTimeAsync(1000);

    expect(mousedownTargets.at(-1)).toBe("body");
    expect(mousedownTargets).not.toContain("canvas");
  });

  // Google's menu ignores an outside press in the task that opened it, so on the live pages a same-task press left
  // the menu open
  test("should press outside in a later task than the one that opened the menu", async () => {
    renderZoomMenu();
    const mousedownTargets = recordMousedownTargets();

    await zoomTo("150%");
    expect(mousedownTargets).not.toContain("body");

    await vi.advanceTimersByTimeAsync(0);
    expect(mousedownTargets.at(-1)).toBe("body");
  });

  test("should blur the zoom input when a row is applied", async () => {
    renderZoomMenu();
    const input = document.querySelector<HTMLInputElement>("#zoomSelect input")!;
    input.focus();

    await zoomTo("150%");

    expect(document.activeElement).not.toBe(input);
  });
});

describe("page loading", () => {
  const { uiElements } = DOCS_CONFIG;
  const driver = createDriver;

  beforeEach(() => {
    document.body.innerHTML = "";
  });

  test("should watch the toolbar and read the zoom select when the page has one", () => {
    document.body.innerHTML = `<div id="zoomSelect" class="goog-toolbar-combo-button-disabled"></div>`;

    expect(driver().getIsPageLoadingElementToWatch()).toBe(uiElements.toolbarId);
    expect(driver().getIsPageLoading()).toBe(true);
  });

  test("should be ready once the zoom select is no longer disabled", () => {
    document.body.innerHTML = `<div id="zoomSelect"></div>`;

    expect(driver().getIsPageLoading()).toBe(false);
  });

  test("should watch the View tab and read it when there is no zoom select", () => {
    document.body.innerHTML = `<div id="docs-view-menu" class="goog-control-disabled"></div>`;

    expect(driver().getIsPageLoadingElementToWatch()).toBe(uiElements.menubarViewTabId);
    expect(driver().getIsPageLoading()).toBe(true);

    document.body.innerHTML = `<div id="docs-view-menu"></div>`;
    expect(driver().getIsPageLoading()).toBe(false);
  });

  test("should be loading when neither the zoom select nor the View tab exists", () => {
    expect(driver().getIsPageLoading()).toBe(true);
  });
});

describe.runIf(IS_EXTENDED_EDITION)("custom zoom flow", () => {
  let clickedRows: string[];

  beforeEach(() => {
    vi.useFakeTimers();
    clickedRows = renderZoomMenu();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const zoomAndSettle = async () => {
    const outcome = await zoomTo(CUSTOM_ZOOM);
    await vi.advanceTimersByTimeAsync(1000);
    return outcome;
  };

  test("should type the zoom value and press Enter without selecting a preset", async () => {
    const input = document.querySelector<HTMLInputElement>("#zoomSelect input")!;
    const events: string[] = [];
    let valueAtKeydown = "";

    for (const type of ["keydown", "keypress", "keyup"]) {
      input.addEventListener(type, (event) => {
        events.push(`${type}:${(event as KeyboardEvent).keyCode}`);
        if (type === "keydown") {
          valueAtKeydown = input.value;
        }
      });
    }

    const outcome = await zoomAndSettle();

    expect(outcome).toEqual({ status: "applied" });
    expect(events).toEqual(["keydown:13", "keypress:13", "keyup:13"]);
    expect(valueAtKeydown).toBe(CUSTOM_ZOOM);
    expect(clickedRows).toEqual([]);
  });

  test("should fail with custom_zoom_not_applied when the page drops the value on blur", async () => {
    const input = document.querySelector<HTMLInputElement>("#zoomSelect input")!;
    input.addEventListener("blur", () => {
      input.value = "100%";
    });

    expect(await zoomAndSettle()).toEqual({
      status: "failed",
      reason: "custom_zoom_not_applied"
    });
    expect(clickedRows).toEqual([]);
  });

  test("should select the nearest preset when the zoom combobox has no input", async () => {
    document.querySelector("#zoomSelect input")?.remove();

    await zoomAndSettle();

    expect(clickedRows).toEqual([NEAREST_PRESET]);
  });
});
