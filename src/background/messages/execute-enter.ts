import type { PlasmoMessaging } from "@plasmohq/messaging";

import type { ExecuteEnterRequestBody } from "../../types";
import { setupSentry } from "../../utils/sentry/background";

const sentryClient = setupSentry("background");

const handler: PlasmoMessaging.MessageHandler<ExecuteEnterRequestBody> = async (
  req
) => {
  try {
    const target = { tabId: req.sender.tab.id };

    chrome.debugger.attach(target, "1.0");

    chrome.debugger.sendCommand(target, "Input.insertText", {
      text: req.body.zoomValue
    });

    // The two events below have to be used together. I don't know why... but they do...
    chrome.debugger.sendCommand(target, "Input.dispatchKeyEvent", {
      type: "rawKeyDown",
      code: "Enter",
      key: "Enter",
      macCharCode: 13,
      nativeVirtualKeyCode: 13,
      text: "\r", //This is the critical part
      unmodifiedText: "\r", //This is the critical part
      windowsVirtualKeyCode: 13
    });
    chrome.debugger.sendCommand(target, "Input.dispatchKeyEvent", {
      type: "char",
      text: "\r"
    });

    chrome.debugger.detach(target);
  } catch (err) {
    sentryClient.captureException(err);
  }
};

export default handler;
