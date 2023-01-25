import { sendViaRelay } from "@plasmohq/messaging"
import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

import { STORAGE_KEY } from "./constants"

const storage = new Storage()

export const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  storage.get(STORAGE_KEY).then((value) => {
    // execute content script now?
    console.log("onUpdated", value)
    res.send({
      message: value
    })
  })
}

// const executeScript = (zoomValue, tabId) => {
//   sendViaRelay({
//     name: "getZoom",
//     body: {
//       zoomValue
//     }
//   }).then((resp) => console.log(resp))
//
//   // const functionToExecute = (val) => () => {
//   //   console.log("executeScript", val)
//   // }
//   //
//   // chrome.scripting.executeScript(
//   //   {
//   //     target: {
//   //       tabId // the tab you want to inject into
//   //     },
//   //     world: "MAIN", // MAIN to access the window object
//   //     func: functionToExecute(zoomValue)
//   //   },
//   //   () => {
//   //     console.log("Background script got callback after injection")
//   //   }
//   // )
// }
//
// // todo
// // - check page for google docs
// // - execute content script
// chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
//   if (changeInfo.status == "complete" && tab.active) {
//     // do your things
//     console.log("page load")
//   }
// })
