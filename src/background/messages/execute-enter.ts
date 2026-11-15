import type { PlasmoMessaging } from "@plasmohq/messaging";
import type { ExecuteEnterRequestBody, ExecuteEnterResponseBody } from "src/types";
import { createSentryClient } from "src/utils/sentry/base";

const sentryScope = createSentryClient("background");

const handler: PlasmoMessaging.MessageHandler<
  ExecuteEnterRequestBody,
  ExecuteEnterResponseBody
> = async (req, res) => {
  if (!chrome.debugger) {
    res.send({ err: "no_debugger" });
    return;
  }

  let attachedTarget: chrome.debugger.Debuggee | undefined;
  let err: ExecuteEnterResponseBody["err"] = null;

  try {
    const target = { tabId: req.sender.tab.id };

    await chrome.debugger.attach(target, "1.0");
    attachedTarget = target;

    await chrome.debugger.sendCommand(target, "Input.insertText", {
      text: req.body.zoomValue
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

  res.send({ err });
};

export default handler;
