// The handler only types the zoom value in the Extended edition, so these tests run for that edition only.
import { IS_EXTENDED_EDITION } from "src/utils/edition";
import { type Mock, afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({ captureException: vi.fn() }));

vi.mock("src/utils/sentry/base", () => ({
  createSentryClient: () => ({ captureException: mocks.captureException })
}));

import { executeEnter } from "./execute-enter";

const TAB_ID = 7;
const SENDER = { tab: { id: TAB_ID } } as chrome.runtime.MessageSender;

interface DebuggerApi {
  attach: Mock;
  sendCommand: Mock;
  detach: Mock;
}

const createDebugger = (): DebuggerApi => ({
  attach: vi.fn().mockResolvedValue(undefined),
  sendCommand: vi.fn().mockResolvedValue(undefined),
  detach: vi.fn().mockResolvedValue(undefined)
});

const runHandler = () => executeEnter({ zoomValue: "130%" }, SENDER);

describe.runIf(IS_EXTENDED_EDITION)("execute-enter handler", () => {
  let debuggerApi: DebuggerApi;

  beforeEach(() => {
    mocks.captureException.mockClear();
    debuggerApi = createDebugger();
    vi.stubGlobal("chrome", { debugger: debuggerApi });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("should type the zoom value, press Enter, detach, then reply with no error", async () => {
    const calls: string[] = [];
    debuggerApi.attach.mockImplementation(async () => void calls.push("attach"));
    // Record when a command settles, so detach is only listed after every command has finished.
    debuggerApi.sendCommand.mockImplementation(async (_target, method) => {
      // settle on a later microtask, so detach can only be listed after the command
      await Promise.resolve();
      calls.push(method);
    });
    debuggerApi.detach.mockImplementation(async () => void calls.push("detach"));

    const response = await runHandler().finally(() => calls.push("reply"));

    expect(calls).toEqual([
      "attach",
      "Input.insertText",
      "Input.dispatchKeyEvent",
      "Input.dispatchKeyEvent",
      "detach",
      "reply"
    ]);
    expect(debuggerApi.sendCommand).toHaveBeenCalledWith({ tabId: TAB_ID }, "Input.insertText", {
      text: "130%"
    });
    expect(response).toEqual({ err: null });
  });

  test("should reply no_debugger when the debugger API is missing", async () => {
    vi.stubGlobal("chrome", {});

    expect(await runHandler()).toEqual({ err: "no_debugger" });
  });

  test("should reply debugger_failed, report it and not detach when attach rejects", async () => {
    const failure = new Error("Another debugger is already attached to the tab");
    debuggerApi.attach.mockRejectedValue(failure);

    expect(await runHandler()).toEqual({ err: "debugger_failed" });
    expect(debuggerApi.sendCommand).not.toHaveBeenCalled();
    expect(debuggerApi.detach).not.toHaveBeenCalled();
    expect(mocks.captureException).toHaveBeenCalledWith(failure);
  });

  test("should reply debugger_failed and still detach when a command rejects", async () => {
    const failure = new Error("Detached while handling command.");
    debuggerApi.sendCommand.mockRejectedValueOnce(failure);

    expect(await runHandler()).toEqual({ err: "debugger_failed" });
    expect(debuggerApi.sendCommand).toHaveBeenCalledTimes(1);
    expect(debuggerApi.detach).toHaveBeenCalledWith({ tabId: TAB_ID });
    expect(mocks.captureException).toHaveBeenCalledWith(failure);
  });

  test("should still reply debugger_failed when detach also rejects after a failed command", async () => {
    debuggerApi.sendCommand.mockRejectedValueOnce(new Error("command failed"));
    const detachFailure = new Error("detach failed");
    debuggerApi.detach.mockRejectedValue(detachFailure);

    expect(await runHandler()).toEqual({ err: "debugger_failed" });
    expect(mocks.captureException).toHaveBeenCalledWith(detachFailure);
  });

  test("should reply with no error and report it when only detach rejects", async () => {
    const detachFailure = new Error("detach failed");
    debuggerApi.detach.mockRejectedValue(detachFailure);

    expect(await runHandler()).toEqual({ err: null });
    expect(mocks.captureException).toHaveBeenCalledWith(detachFailure);
  });
});
