// @vitest-environment jsdom
import { workspaceAppUiStrategyConfigs } from "src/constants";
import type { AppStorageState } from "src/types";
import getAppStorageStateFromStorage from "src/utils/get-app-storage-state-from-storage";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { createDocsDriver } from "./docs";

vi.mock("src/utils/messaging", () => ({ sendMessage: vi.fn() }));
vi.mock("src/utils/localize", () => ({ default: (key: string) => key }));
vi.mock("src/utils/get-app-storage-state-from-storage", () => ({ default: vi.fn() }));

// The localize mock returns the key, so this is the Fit value the extension saves. Docs shows FIT_ROW_TEXT.
const EXTENSION_FIT_LABEL = "popupDocsDropdownFitSelection";
const FIT_ROW_TEXT = "Ajustar";

const stateWith = (zoomValue: string): AppStorageState => ({
  zoomValue,
  viewOnly: true,
  classroomSupport: false
});

const VIEW_MENU = `<div id="docs-view-menu"></div>`;
const ZOOM_ITEM = `<span aria-label="Zoom"></span>`;

// The structure of Docs' View > Zoom menu: Fit is no checkbox and has a shortcut, the presets are checkboxes
const fitRow = (text: string, shortcut = "⌘+Option+[") =>
  `<div class="goog-menuitem apps-menuitem" role="menuitem"><div class="goog-menuitem-content"><span class="goog-menuitem-label" aria-label="${text} f">${text}</span><span class="goog-menuitem-accel">${shortcut}</span></div></div>`;
const presetRow = (text: string) =>
  `<div class="goog-menuitem apps-menuitem goog-option" role="menuitemcheckbox"><div class="goog-menuitem-content">${text}</div></div>`;
const zoomMenu = (rows: string[], attributes = "") =>
  `<div class="goog-menu" ${attributes}>${rows.join("")}</div>`;

const ZOOM_MENU = zoomMenu([fitRow(FIT_ROW_TEXT), presetRow("100%"), presetRow("150%")]);

// Records the text of each clicked row
const recordClicks = () => {
  const clicked: string[] = [];
  document.querySelectorAll(".goog-menuitem").forEach((row) => {
    row.firstElementChild?.addEventListener("click", () => clicked.push(row.textContent ?? ""));
  });
  return clicked;
};

const runViewOnlyFlow = async () => {
  const outcome = createDocsDriver(workspaceAppUiStrategyConfigs.Docs).execute();
  await vi.advanceTimersByTimeAsync(1000);
  return outcome;
};

describe("Docs view-only zoom outcome", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(getAppStorageStateFromStorage).mockResolvedValue(stateWith("150%"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("should be applied when the row is clicked", async () => {
    document.body.innerHTML = VIEW_MENU + ZOOM_ITEM + ZOOM_MENU;
    const clicked = recordClicks();

    expect(await runViewOnlyFlow()).toEqual({ status: "applied" });
    expect(clicked).toEqual(["150%"]);
  });

  // The menu is found by the presets it lists, and the Fit row by its structure: the text is in Docs' language, not
  // the extension's
  test("should click the Fit row in the language Docs is shown in", async () => {
    vi.mocked(getAppStorageStateFromStorage).mockResolvedValue(stateWith(EXTENSION_FIT_LABEL));
    document.body.innerHTML = VIEW_MENU + ZOOM_ITEM + ZOOM_MENU;
    const clicked = recordClicks();

    expect(await runViewOnlyFlow()).toEqual({ status: "applied" });
    expect(clicked).toEqual([`${FIT_ROW_TEXT}⌘+Option+[`]);
  });

  test("should ignore a menu that lists no zoom presets", async () => {
    document.body.innerHTML =
      VIEW_MENU + ZOOM_ITEM + zoomMenu([fitRow("Make available offline", "")]) + ZOOM_MENU;
    const clicked = recordClicks();

    expect(await runViewOnlyFlow()).toEqual({ status: "applied" });
    expect(clicked).toEqual(["150%"]);
  });

  test("should ignore a hidden menu that lists the zoom presets", async () => {
    document.body.innerHTML =
      VIEW_MENU +
      ZOOM_ITEM +
      zoomMenu([fitRow("Hidden"), presetRow("100%"), presetRow("150%")], 'style="display: none"') +
      ZOOM_MENU;
    const clicked = recordClicks();

    expect(await runViewOnlyFlow()).toEqual({ status: "applied" });
    expect(clicked).toEqual(["150%"]);
  });

  test("should fail with view_zoom_option_missing and click nothing when Fit can't be told from another row", async () => {
    vi.mocked(getAppStorageStateFromStorage).mockResolvedValue(stateWith(EXTENSION_FIT_LABEL));
    document.body.innerHTML =
      VIEW_MENU +
      ZOOM_ITEM +
      zoomMenu([fitRow("Nueva opción"), fitRow("Otra cosa"), presetRow("100%"), presetRow("150%")]);
    const clicked = recordClicks();

    expect(await runViewOnlyFlow()).toEqual({
      status: "failed",
      reason: "view_zoom_option_missing"
    });
    expect(clicked).toEqual([]);
  });

  test("should fail with view_menu_missing when the View menu is not on the page", async () => {
    document.body.innerHTML = ZOOM_ITEM + ZOOM_MENU;

    expect(await runViewOnlyFlow()).toEqual({ status: "failed", reason: "view_menu_missing" });
  });

  test("should fail with view_zoom_item_missing when neither Zoom item selector matches", async () => {
    document.body.innerHTML = VIEW_MENU + ZOOM_MENU;

    expect(await runViewOnlyFlow()).toEqual({ status: "failed", reason: "view_zoom_item_missing" });
  });

  test("should fail with view_zoom_menu_missing instead of rejecting when the zoom menu is not open", async () => {
    document.body.innerHTML = VIEW_MENU + ZOOM_ITEM;

    expect(await runViewOnlyFlow()).toEqual({ status: "failed", reason: "view_zoom_menu_missing" });
  });

  test("should fail with view_zoom_option_missing when no row has the value", async () => {
    document.body.innerHTML = VIEW_MENU + ZOOM_ITEM + ZOOM_MENU.replace("150%", "175%");

    expect(await runViewOnlyFlow()).toEqual({
      status: "failed",
      reason: "view_zoom_option_missing"
    });
  });
});

describe("Docs preview detection", () => {
  test.each([
    ["https://docs.google.com/document/d/ID/preview", true],
    ["https://docs.google.com/document/d/ID/edit", false]
  ])("should treat %s as preview: %s", (href, expected) => {
    expect(createDocsDriver(workspaceAppUiStrategyConfigs.Docs).isUIPreview(href)).toBe(expected);
  });
});
