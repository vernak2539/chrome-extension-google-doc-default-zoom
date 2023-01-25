import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

import { STORAGE_KEY } from "~constants"

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
