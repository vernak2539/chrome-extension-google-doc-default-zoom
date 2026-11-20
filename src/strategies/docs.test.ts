// @vitest-environment jsdom
import { workspaceAppUiStrategyConfigs } from "src/constants";
import type { AppStorageState } from "src/types";
import getAppStorageStateFromStorage from "src/utils/get-app-storage-state-from-storage";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import DocsStrategy from "./docs";

vi.mock("src/utils/messaging", () => ({ sendMessage: vi.fn() }));
vi.mock("src/utils/localize", () => ({ default: (key: string) => key }));
vi.mock("src/utils/get-app-storage-state-from-storage", () => ({ default: vi.fn() }));

const FIT_LABEL = "popupDocsDropdownFitSelection";

const viewOnlyState: AppStorageState = {
  zoomValue: "150%",
  viewOnly: true,
  classroomSupport: false
};

const VIEW_MENU = `<div id="docs-view-menu"></div>`;
const ZOOM_ITEM = `<span aria-label="Zoom"></span>`;
const ZOOM_MENU = `
  <div class="goog-menu">
    <div class="goog-menuitem apps-menuitem"><div aria-label="${FIT_LABEL}">${FIT_LABEL}</div></div>
    <div class="goog-menuitem apps-menuitem"><div>100%</div></div>
    <div class="goog-menuitem apps-menuitem"><div>150%</div></div>
  </div>`;

const runViewOnlyFlow = async () => {
  const outcome = new DocsStrategy(workspaceAppUiStrategyConfigs.Docs).execute();
  await vi.advanceTimersByTimeAsync(1000);
  return outcome;
};

describe("Docs view-only zoom outcome", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(getAppStorageStateFromStorage).mockResolvedValue(viewOnlyState);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("should be applied when the row is clicked", async () => {
    document.body.innerHTML = VIEW_MENU + ZOOM_ITEM + ZOOM_MENU;
    const clicked: string[] = [];
    document.querySelectorAll(".goog-menuitem").forEach((row) => {
      row.firstElementChild?.addEventListener("click", () => clicked.push(row.textContent ?? ""));
    });

    expect(await runViewOnlyFlow()).toEqual({ status: "applied" });
    expect(clicked).toEqual(["150%"]);
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
