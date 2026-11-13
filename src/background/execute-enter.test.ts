// Lives outside src/background/messages: Plasmo bundles every file in that folder as a message handler, and the
// Base edition deletes execute-enter.ts.
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({ captureException: vi.fn() }));

vi.mock("src/utils/sentry/base", () => ({
  createSentryClient: () => ({ captureException: mocks.captureException })
}));

import handler from "./messages/execute-enter";

const TAB_ID = 7;

const createDebugger = () => ({
  attach: vi.fn().mockResolvedValue(undefined),
  sendCommand: vi.fn().mockResolvedValue(undefined),
  detach: vi.fn().mockResolvedValue(undefined)
});

const runHandler = async (send = vi.fn()) => {
  await handler(
    { body: { zoomValue: "130%" }, sender: { tab: { id: TAB_ID } } } as any,
    {
      send
    } as any
  );
  return send;
};

describe("execute-enter handler", () => {
  let debuggerApi: ReturnType<typeof createDebugger>;

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
    debuggerApi.sendCommand.mockImplementation(async (_target, method) => void calls.push(method));
    debuggerApi.detach.mockImplementation(async () => void calls.push("detach"));
    const send = vi.fn(() => calls.push("reply"));

    await runHandler(send);

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
    expect(send).toHaveBeenCalledWith({ err: null });
  });

  test("should reply no_debugger when the debugger API is missing", async () => {
    vi.stubGlobal("chrome", {});

    expect(await runHandler()).toHaveBeenCalledWith({ err: "no_debugger" });
  });

  test("should reply debugger_failed, report it and not detach when attach rejects", async () => {
    const failure = new Error("Another debugger is already attached to the tab");
    debuggerApi.attach.mockRejectedValue(failure);

    const send = await runHandler();

    expect(send).toHaveBeenCalledWith({ err: "debugger_failed" });
    expect(debuggerApi.sendCommand).not.toHaveBeenCalled();
    expect(debuggerApi.detach).not.toHaveBeenCalled();
    expect(mocks.captureException).toHaveBeenCalledWith(failure);
  });

  test("should reply debugger_failed and still detach when a command rejects", async () => {
    const failure = new Error("Detached while handling command.");
    debuggerApi.sendCommand.mockRejectedValueOnce(failure);

    const send = await runHandler();

    expect(send).toHaveBeenCalledWith({ err: "debugger_failed" });
    expect(debuggerApi.sendCommand).toHaveBeenCalledTimes(1);
    expect(debuggerApi.detach).toHaveBeenCalledWith({ tabId: TAB_ID });
    expect(mocks.captureException).toHaveBeenCalledWith(failure);
  });

  test("should still reply debugger_failed when detach also rejects after a failed command", async () => {
    debuggerApi.sendCommand.mockRejectedValueOnce(new Error("command failed"));
    const detachFailure = new Error("detach failed");
    debuggerApi.detach.mockRejectedValue(detachFailure);

    const send = await runHandler();

    expect(send).toHaveBeenCalledWith({ err: "debugger_failed" });
    expect(mocks.captureException).toHaveBeenCalledWith(detachFailure);
  });

  test("should reply with no error and report it when only detach rejects", async () => {
    const detachFailure = new Error("detach failed");
    debuggerApi.detach.mockRejectedValue(detachFailure);

    const send = await runHandler();

    expect(send).toHaveBeenCalledWith({ err: null });
    expect(mocks.captureException).toHaveBeenCalledWith(detachFailure);
  });
});
