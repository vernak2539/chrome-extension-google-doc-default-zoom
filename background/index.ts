import { Storage } from "@plasmohq/storage"

import { STORAGE_KEY } from "~constants"

const storage = new Storage()

export {}

// how do this outside of chrome...??
chrome.webNavigation.onCompleted.addListener(
  (details) => {
    console.log(details)

    storage.get(STORAGE_KEY).then((key) => console.log(key))
  },
  {
    url: [
      {
        // Runs on example.com, example.net, but also example.foo.com
        hostContains: ".google."
      }
    ]
  }
)
