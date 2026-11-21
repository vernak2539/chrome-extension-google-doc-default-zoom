// @vitest-environment jsdom
// @vitest-environment-options {"url": "https://docs.google.com/document/d/DOC_ID_123/edit"}
import type { ReportContentErrorRequestBody, ZoomOutcome } from "src/types";
import { beforeEach, describe, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  sendMessage: vi.fn(),
  walkDOM: vi.fn(),
  execute: vi.fn(),
  isUIPreview: vi.fn()
}));

vi.mock("src/utils/messaging", () => ({
  sendMessage: mocks.sendMessage
}));
vi.mock("src/utils/localize", () => ({ default: (key: string) => key }));
vi.mock("src/utils/walk-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("src/utils/walk-dom")>();
  mocks.walkDOM.mockImplementation(actual.walkDOM);
  return { walkDOM: mocks.walkDOM };
});
vi.mock("src/strategies/docs", () => ({
  default: class {
    isUIPreview = mocks.isUIPreview;
    getIsPageLoadingElementToWatch = () => "#docs-toolbar";
    getIsPageLoading = () => false;
    execute = mocks.execute;
  }
}));
vi.mock("src/strategies/sheets", () => ({ default: class {} }));

const startContentScript = async () => {
  document.body.innerHTML = `<div id="docs-chrome" class="chrome"><div id="docs-toolbar"></div></div>`;
  const { runContentScript } = await import("./content-script");
  runContentScript();

  // The script starts on the first DOM mutation after it was injected
  document.body.append(document.createElement("div"));
  await new Promise((resolve) => setTimeout(resolve, 0));
};

const sentReport = (): ReportContentErrorRequestBody => {
  expect(mocks.sendMessage).toHaveBeenCalledTimes(1);
  expect(mocks.sendMessage.mock.calls[0][0]).toBe("reportContentError");
  return mocks.sendMessage.mock.calls[0][1];
};

describe("content script error reporting", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mocks.sendMessage.mockResolvedValue({});
    mocks.isUIPreview.mockReturnValue(false);
    mocks.execute.mockResolvedValue({ status: "applied" } satisfies ZoomOutcome);
  });

  test("should not walk the DOM or message the background on a normal page load", async () => {
    await startContentScript();

    expect(mocks.execute).toHaveBeenCalledTimes(1);
    expect(mocks.walkDOM).not.toHaveBeenCalled();
    expect(mocks.sendMessage).not.toHaveBeenCalled();
  });

  test("should send a failed outcome with its reason and the page structure", async () => {
    mocks.execute.mockResolvedValue({
      status: "failed",
      reason: "zoom_menu_missing"
    } satisfies ZoomOutcome);

    await startContentScript();

    const report = sentReport();
    expect(report).toMatchObject({ application: "Docs", reason: "zoom_menu_missing" });
    expect(report.error).toBeUndefined();
    expect(JSON.parse(report.dom.menu)).toMatchObject({ id: "docs-chrome", classNames: "chrome" });
  });

  test("should send the stack of an error that escapes main", async () => {
    const failure = new TypeError("preview check broke");
    mocks.isUIPreview.mockImplementation(() => {
      throw failure;
    });

    await startContentScript();

    const report = sentReport();
    expect(report.reason).toBeUndefined();
    expect(report.error).toEqual({
      name: "TypeError",
      message: "preview check broke",
      stack: failure.stack
    });
  });

  test("should not throw when the background cannot be reached", async () => {
    mocks.execute.mockResolvedValue({ status: "failed", reason: "exception" });
    mocks.sendMessage.mockRejectedValue(new Error("Extension context invalidated."));
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    await startContentScript();

    expect(consoleError).toHaveBeenCalledWith(
      expect.any(String),
      "Could not send the error report to the background",
      expect.objectContaining({ message: "Extension context invalidated." })
    );
    consoleError.mockRestore();
  });
});
