// @vitest-environment jsdom
import { workspaceAppUiStrategyConfigs } from "src/constants";
import type { AppStorageState } from "src/types";
import getAppStorageStateFromStorage from "src/utils/get-app-storage-state-from-storage";
import { describe, expect, test, vi } from "vitest";

import { createSheetsDriver } from "./sheets";

vi.mock("src/utils/messaging", () => ({ sendMessage: vi.fn() }));
vi.mock("src/utils/localize", () => ({ default: (key: string) => key }));
vi.mock("src/utils/get-app-storage-state-from-storage", () => ({ default: vi.fn() }));

// Sheets ships with the view-only toggle off, so turn it on to reach the view-only branch
const viewOnlyConfig = {
  ...workspaceAppUiStrategyConfigs.Sheets,
  features: { ...workspaceAppUiStrategyConfigs.Sheets.features, enableViewOnlyToggle: true }
};

const state: AppStorageState = { zoomValue: "150%", viewOnly: true, classroomSupport: false };

describe("Sheets zoom outcome", () => {
  test("should skip with view_only when the toolbar zoom select is missing", async () => {
    document.body.innerHTML = "";
    vi.mocked(getAppStorageStateFromStorage).mockResolvedValue(state);

    expect(await createSheetsDriver(viewOnlyConfig).execute()).toEqual({
      status: "skipped",
      reason: "view_only"
    });
  });

  test("should fail with zoom_select_missing when view-only is not enabled", async () => {
    document.body.innerHTML = "";
    vi.mocked(getAppStorageStateFromStorage).mockResolvedValue(state);

    expect(await createSheetsDriver(workspaceAppUiStrategyConfigs.Sheets).execute()).toEqual({
      status: "failed",
      reason: "zoom_select_missing"
    });
  });
});

describe("Sheets preview detection", () => {
  test.each([
    ["https://docs.google.com/spreadsheets/u/0/d/ID/preview", true],
    ["https://docs.google.com/spreadsheets/u/0/d/ID/preview/sheet", true],
    ["https://docs.google.com/spreadsheets/d/ID/edit", false]
  ])("should treat %s as preview: %s", (href, expected) => {
    expect(createSheetsDriver(workspaceAppUiStrategyConfigs.Sheets).isUIPreview(href)).toBe(
      expected
    );
  });
});
