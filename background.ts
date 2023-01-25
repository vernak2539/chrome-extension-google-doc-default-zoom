import { Storage } from "@plasmohq/storage"

import { STORAGE_KEY } from "./constants"

const storage = new Storage()

export {}

// todo
// - check page for google docs
// - execute content script
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status == "complete" && tab.active) {
    // do your things
    console.log("page load")
    storage.get(STORAGE_KEY).then((key) => {
      // execute content script now?
      console.log(key)
    })
  }
})
