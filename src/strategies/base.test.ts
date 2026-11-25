// @vitest-environment jsdom
import { workspaceAppUiStrategyConfigs } from "src/constants";
import type { AppStorageState } from "src/types";
import { IS_EXTENDED_EDITION } from "src/utils/edition";
import getAppStorageStateFromStorage from "src/utils/get-app-storage-state-from-storage";
import { afterEach, beforeEach, describe, expect, type MockInstance, test, vi } from "vitest";

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

// The saved Fit value is "fit", whatever language the extension or Docs is shown in
describe("Fit when Docs is shown in another language than the extension", () => {
  const FIT_VALUE = "fit";

  const renderToolbarMenu = (rowTexts: string[]) => {
    document.body.innerHTML = `
      <div id="zoomSelect" aria-owns="zoom-menu"><input /></div>
      <div class="goog-menu goog-menu-vertical" id="zoom-menu">
        ${rowTexts.map((text) => `<div class="goog-menuitem"><div>${text}</div></div>`).join("")}
      </div>`;

    const clicked: string[] = [];
    document.querySelectorAll(".goog-menuitem").forEach((row) => {
      row.firstElementChild?.addEventListener("click", () => clicked.push(row.textContent ?? ""));
    });
    const mousedownTargets: string[] = [];
    document.addEventListener("mousedown", (event) => {
      mousedownTargets.push((event.target as Element).tagName.toLowerCase());
    });
    return { clicked, mousedownTargets };
  };

  beforeEach(() => {
    vi.useFakeTimers();
    getStoredState.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("should click the row without a digit, whatever its text", async () => {
    const { clicked } = renderToolbarMenu(["Ajustar", "50%", "100%", "150%"]);

    expect(await zoomTo(FIT_VALUE)).toEqual({ status: "applied" });
    expect(clicked).toEqual(["Ajustar"]);
  });

  test("should fail with zoom_option_missing, click nothing and close the menu when two rows have no digit", async () => {
    const { clicked, mousedownTargets } = renderToolbarMenu([
      "New feature",
      "Other",
      "50%",
      "150%"
    ]);

    expect(await zoomTo(FIT_VALUE)).toEqual({ status: "failed", reason: "zoom_option_missing" });
    await vi.advanceTimersByTimeAsync(0);

    expect(clicked).toEqual([]);
    expect(mousedownTargets.at(-1)).toBe("body");
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

describe("keyboard focus after the zoom", () => {
  // On the live pages Google moves focus into the zoom box when the control is pressed, and leaves it there once the
  // zoom is applied, so typing went into the zoom box instead of the document
  const focusZoomBoxOnPress = () => {
    const input = document.querySelector<HTMLInputElement>("#zoomSelect input")!;
    document.querySelector("#zoomSelect")!.addEventListener("mousedown", () => input.focus());
  };

  // stands in for the element that takes the document's keys (Docs: an iframe, Sheets: the cell editor)
  const renderFocusedEditor = () => {
    document.body.insertAdjacentHTML("beforeend", `<textarea id="editor"></textarea>`);
    const editor = document.querySelector<HTMLTextAreaElement>("#editor")!;
    editor.focus();
    return editor;
  };

  beforeEach(() => {
    vi.useFakeTimers();
    getStoredState.mockReset();
    document.body.innerHTML = "";
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("should put focus back in the document after a preset is applied", async () => {
    renderZoomMenu();
    focusZoomBoxOnPress();
    const editor = renderFocusedEditor();

    expect(await zoomTo("150%")).toEqual({ status: "applied" });
    await vi.runAllTimersAsync();

    expect(document.activeElement).toBe(editor);
  });

  test("should put focus back in the document when no row matches", async () => {
    renderZoomMenu();
    focusZoomBoxOnPress();
    const editor = renderFocusedEditor();

    await zoomTo("200%");
    await vi.runAllTimersAsync();

    expect(document.activeElement).toBe(editor);
  });

  test.runIf(IS_EXTENDED_EDITION)(
    "should put focus back in the document after a custom zoom is typed",
    async () => {
      renderZoomMenu();
      focusZoomBoxOnPress();
      const editor = renderFocusedEditor();

      expect(await zoomTo(CUSTOM_ZOOM)).toEqual({ status: "applied" });
      await vi.runAllTimersAsync();

      expect(document.activeElement).toBe(editor);
    }
  );

  // On the live pages, focusing the document in the task of the outside press made Google reopen the menu
  test("should put focus back in a later task than the outside press", async () => {
    renderZoomMenu();
    focusZoomBoxOnPress();
    const editor = renderFocusedEditor();
    const events: string[] = [];
    document.body.addEventListener("mousedown", (event) => {
      if (event.target === document.body) {
        events.push("outside press");
      }
    });
    editor.addEventListener("focus", () => events.push("focus back"));

    await zoomTo("150%");
    await vi.advanceTimersToNextTimerAsync();
    expect(events).toEqual(["outside press"]);

    await vi.advanceTimersToNextTimerAsync();
    expect(events).toEqual(["outside press", "focus back"]);
  });

  test("should leave focus off the zoom box when nothing had focus before", async () => {
    renderZoomMenu();
    focusZoomBoxOnPress();

    await zoomTo("150%");
    await vi.runAllTimersAsync();

    expect(document.activeElement).toBe(document.body);
  });

  // Docs takes the document's keys in an element inside a hidden iframe, and clears that element's focus while the zoom
  // box has it. Focusing the iframe alone would leave the keys on the iframe's body.
  test("should put focus back on the element inside a frame that had it", async () => {
    renderZoomMenu();
    document.body.insertAdjacentHTML("beforeend", "<iframe></iframe>");
    const frame = document.querySelector("iframe")!;
    const frameDocument = frame.contentDocument!;
    frameDocument.body.innerHTML = `<div contenteditable="true" tabindex="-1"></div>`;
    const editor = frameDocument.querySelector("div")!;
    frame.focus();
    editor.focus();
    const input = document.querySelector<HTMLInputElement>("#zoomSelect input")!;
    document.querySelector("#zoomSelect")!.addEventListener("mousedown", () => {
      editor.blur();
      input.focus();
    });

    await zoomTo("150%");
    await vi.runAllTimersAsync();

    expect(frameDocument.activeElement).toBe(editor);
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

// A background tab, or the selected tab of a window that is not focused. There Chrome fires no focus events, and
// Google ignores a typed zoom (#77).
describe("zoom in a page without focus", () => {
  let hasFocus: MockInstance<() => boolean>;
  let clickedRows: string[];

  const recordZoomControl = () => {
    const events: string[] = [];
    document
      .querySelector("#zoomSelect")!
      .addEventListener("mousedown", () => events.push("press"));
    document
      .querySelector("#zoomSelect input")!
      .addEventListener("keydown", () => events.push("keydown"));
    return events;
  };

  const giveFocus = () => {
    hasFocus.mockReturnValue(true);
    window.dispatchEvent(new FocusEvent("focus"));
  };

  // the outcome, or "pending" while the flow still waits
  const track = (execution: Promise<unknown>) => {
    let outcome: unknown = "pending";
    void execution.then((value) => (outcome = value));
    return () => outcome;
  };

  beforeEach(() => {
    vi.useFakeTimers();
    getStoredState.mockReset();
    clickedRows = renderZoomMenu();
    hasFocus = vi.spyOn(document, "hasFocus").mockReturnValue(false);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test("should apply a preset at once, since picking a row works without focus", async () => {
    expect(await zoomTo("150%")).toEqual({ status: "applied" });
    expect(clickedRows).toEqual(["150%"]);
  });

  describe.runIf(IS_EXTENDED_EDITION)("custom zoom", () => {
    test("should not touch the zoom control until the page has focus, then type the zoom", async () => {
      const events = recordZoomControl();
      const outcome = track(zoomTo(CUSTOM_ZOOM));

      await vi.advanceTimersByTimeAsync(5000);
      expect(events).toEqual([]);
      expect(outcome()).toBe("pending");

      giveFocus();
      await vi.advanceTimersByTimeAsync(0);

      expect(outcome()).toEqual({ status: "applied" });
      expect(events).toEqual(["press", "keydown"]);
    });

    test("should keep waiting when a focus event comes while the page still has no focus", async () => {
      const events = recordZoomControl();
      const outcome = track(zoomTo(CUSTOM_ZOOM));

      window.dispatchEvent(new FocusEvent("focus"));
      await vi.advanceTimersByTimeAsync(1000);

      expect(events).toEqual([]);
      expect(outcome()).toBe("pending");

      // finish here, or the waiting flow would wake up in the next test
      giveFocus();
      await vi.advanceTimersByTimeAsync(0);
      expect(outcome()).toEqual({ status: "applied" });
    });

    test("should read the saved zoom again once the page has focus", async () => {
      getStoredState
        .mockResolvedValueOnce(storedState(CUSTOM_ZOOM))
        .mockResolvedValueOnce(storedState("150%"));
      const outcome = track(createDriver().execute());
      await vi.advanceTimersByTimeAsync(0);

      giveFocus();
      await vi.advanceTimersByTimeAsync(0);

      expect(outcome()).toEqual({ status: "applied" });
      expect(clickedRows).toEqual(["150%"]);
    });
  });
});
