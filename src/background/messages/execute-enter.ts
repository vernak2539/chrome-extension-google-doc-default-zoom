import type { PlasmoMessaging } from "@plasmohq/messaging"

import { setupSentry } from "../../utils/sentry-background"

const sentryWrap = setupSentry("background")

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  sentryWrap(() => {
    chrome.tabs.query({ active: true }).then((tabs) => {
      const currentTab = tabs[0]
      const target = { tabId: currentTab.id }

      const key = {
        code: "Enter",
        key: "Enter"
        // windowsVirtualKeyCode: 13,
        // nativeVirtualKeyCode: 13,
        // macCharCode: 13
      }

      chrome.debugger.attach(target, "1.0")
      chrome.debugger.sendCommand(target, "Input.insertText", {
        text: "125"
      })
      chrome.debugger.sendCommand(target, "Input.dispatchKeyEvent", {
        type: "keyUp",
        ...key
      })

      chrome.debugger.detach(target)
    })
  })
}

export default handler
