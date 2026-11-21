import type { ExecuteEnterRequestBody, ExecuteEnterResponseBody } from "src/types";
import { IS_EXTENDED_EDITION } from "src/utils/edition";
import { createSentryClient } from "src/utils/sentry/base";

const sentryScope = createSentryClient("background");

export const executeEnter = async (
  body: ExecuteEnterRequestBody | undefined,
  sender: chrome.runtime.MessageSender
): Promise<ExecuteEnterResponseBody> => {
  // The edition check is what lets the minifier drop the debugger code from the Base bundle
  if (!IS_EXTENDED_EDITION || !chrome.debugger) {
    return { err: "no_debugger" };
  }

  let attachedTarget: chrome.debugger.Debuggee | undefined;
  let err: ExecuteEnterResponseBody["err"] = null;

  try {
    const tabId = sender?.tab?.id;
    const zoomValue = body?.zoomValue;
    if (tabId === undefined || zoomValue === undefined) {
      throw new Error("Message is missing the sender tab id or the zoom value");
    }
    const target = { tabId };

    await chrome.debugger.attach(target, "1.0");
    attachedTarget = target;

    await chrome.debugger.sendCommand(target, "Input.insertText", {
      text: zoomValue
    });

    // Both events are needed: the original version sent only a `keyUp` with `code`/`key` and did not work
    // (4fdbe09), and the working pair was found by trial (485a0b0). Why Docs needs the `rawKeyDown` with `text` plus
    // the `char` event is not documented, so don't drop either one without testing in Docs.
    await chrome.debugger.sendCommand(target, "Input.dispatchKeyEvent", {
      type: "rawKeyDown",
      code: "Enter",
      key: "Enter",
      macCharCode: 13,
      nativeVirtualKeyCode: 13,
      text: "\r", //This is the critical part
      unmodifiedText: "\r", //This is the critical part
      windowsVirtualKeyCode: 13
    });
    await chrome.debugger.sendCommand(target, "Input.dispatchKeyEvent", {
      type: "char",
      text: "\r"
    });
  } catch (error) {
    sentryScope.captureException(error);
    err = "debugger_failed";
  } finally {
    // Detach only once every command has settled, and always, so the debugging banner doesn't stay up. A failed
    // detach is reported but doesn't change the reply: the zoom was already applied.
    if (attachedTarget) {
      await chrome.debugger
        .detach(attachedTarget)
        .catch((error) => sentryScope.captureException(error));
    }
  }

  return { err };
};
