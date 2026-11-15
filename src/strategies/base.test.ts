// @vitest-environment jsdom
import { sendToBackgroundViaRelay } from "@plasmohq/messaging";
import { workspaceAppUiStrategyConfigs } from "src/constants";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { AbstractBaseStrategy } from "./base";

vi.mock("@plasmohq/messaging", () => ({ sendToBackgroundViaRelay: vi.fn() }));
vi.mock("src/utils/localize", () => ({ default: (key: string) => key }));
vi.mock("src/utils/get-app-storage-state-from-storage", () => ({ default: vi.fn() }));

class TestStrategy extends AbstractBaseStrategy {
  protected performZoom() {}
  public isUIPreview() {
    return false;
  }
  public zoomTo(zoomValue: string) {
    this.uiExecuteFlow(zoomValue);
  }
}

const relay = vi.mocked(sendToBackgroundViaRelay);

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

describe("custom zoom flow", () => {
  let clickedRows: string[];

  beforeEach(() => {
    vi.useFakeTimers();
    relay.mockReset();
    clickedRows = renderZoomMenu();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const zoomAndSettle = async () => {
    new TestStrategy(workspaceAppUiStrategyConfigs.Docs).zoomTo(CUSTOM_ZOOM);
    await vi.advanceTimersByTimeAsync(1000);
  };

  test("should not select a preset when the debugger typed the value", async () => {
    relay.mockResolvedValue({ err: null });

    await zoomAndSettle();

    expect(clickedRows).toEqual([]);
  });

  test.each(["no_debugger", "debugger_failed"] as const)(
    "should select the nearest preset when the handler replies %s",
    async (err) => {
      relay.mockResolvedValue({ err });

      await zoomAndSettle();

      expect(clickedRows).toEqual([NEAREST_PRESET]);
    }
  );

  test("should select the nearest preset when the relay rejects", async () => {
    relay.mockRejectedValue(new Error("Could not establish connection"));

    await zoomAndSettle();

    expect(clickedRows).toEqual([NEAREST_PRESET]);
  });
});
